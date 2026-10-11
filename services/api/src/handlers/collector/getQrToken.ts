import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { LocationClient, BatchUpdateDevicePositionCommand } from '@aws-sdk/client-location';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { generateRotatingQrToken, ROTATING_QR_STEP_MS } from '../../utils/hmac.js';
import { hasGroup } from '../../utils/territory.js';

const location = new LocationClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const TRACKER_NAME = process.env.TRACKER_NAME;

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

/**
 * GET /v1/collector/qr-token
 * Issues the current rotating QR for the collector's assigned truck / kabadiwala source.
 * The HMAC secret never leaves the server; the phone just renders `qrPayload`.
 *
 * Optional ?lat=&lng= : the collector phone's current GPS. It is stored on the source
 * (used by POST /v1/scans for the 150 m proximity check and by GET /v1/trucks/live)
 * and pushed to the Amazon Location tracker.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const userId = claims?.sub;
  if (!userId) return json(401, createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.'));
  if (!hasGroup(claims, 'collector')) {
    return json(403, createErrorResponse('FORBIDDEN', 'Only collectors can display a rotating handover QR.'));
  }

  try {
    const profile = (
      await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${userId}`, SK: 'PROFILE' } }))
    ).Item;
    const sourceId: string | undefined = profile?.assignedSourceId;
    if (!sourceId) {
      return json(404, createErrorResponse('NO_ASSIGNED_SOURCE', 'No truck or collection point is assigned to this collector.'));
    }

    const source = (
      await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `QR#${sourceId}`, SK: 'METADATA' } }))
    ).Item;
    if (!source || source.type !== 'truck_rotating' || !source.secretKey) {
      return json(404, createErrorResponse('QR_SOURCE_NOT_FOUND', `Rotating QR source '${sourceId}' is not configured.`));
    }
    if (source.collectorId && source.collectorId !== userId) {
      return json(403, createErrorResponse('FORBIDDEN', 'This QR source is assigned to a different collector.'));
    }

    const now = Date.now();

    // Record the collector's live position when the phone sends it
    const lat = Number(event.queryStringParameters?.lat);
    const lng = Number(event.queryStringParameters?.lng);
    const hasPosition =
      Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
    if (hasPosition) {
      const sampleTime = new Date(now);
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `QR#${sourceId}`, SK: 'METADATA' },
          UpdateExpression: 'SET liveLatitude = :lat, liveLongitude = :lng, livePositionAt = :at',
          ExpressionAttributeValues: { ':lat': lat, ':lng': lng, ':at': sampleTime.toISOString() },
        }),
      );
      if (TRACKER_NAME) {
        try {
          await location.send(
            new BatchUpdateDevicePositionCommand({
              TrackerName: TRACKER_NAME,
              Updates: [{ DeviceId: sourceId, Position: [lng, lat], SampleTime: sampleTime }],
            }),
          );
        } catch (err: any) {
          console.warn('[getQrToken] Amazon Location update failed', { sourceId, error: err?.message });
        }
      }
    }
    const token = generateRotatingQrToken(source.secretKey, sourceId, now);
    const refreshInMs = ROTATING_QR_STEP_MS - (now % ROTATING_QR_STEP_MS);

    return json(200, {
      sourceId,
      sourceName: source.name,
      token,
      // What the QR encodes. The citizen app sends sourceId + token to POST /v1/scans.
      qrPayload: JSON.stringify({ v: 1, sourceId, token }),
      issuedAt: new Date(now).toISOString(),
      refreshInMs,
    });
  } catch (error: any) {
    console.error('[getQrToken] failed', { userId, error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to issue rotating QR token.'));
  }
};
