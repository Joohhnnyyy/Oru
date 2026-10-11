import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { LocationClient, BatchUpdateDevicePositionCommand } from '@aws-sdk/client-location';
import { latLngToCell } from 'h3-js';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { hasGroup } from '../../utils/territory.js';
import { claimsOf, isLatLng, json, parseBody } from '../../utils/http.js';

const TRACKER_NAME = process.env.TRACKER_NAME;
const location = new LocationClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const H3_RES = 7;

/**
 * POST /v1/collector/location — the collector app's GPS ping while on route.
 *  1. Stores the truck's live position (DynamoDB) for /v1/trucks/live.
 *  2. Sends it to the Amazon Location tracker, which (a) keeps position history for
 *     /v1/trucks/{id}/trail and (b) evaluates territory geofences → EventBridge ENTER/EXIT.
 *  Bin pickups are confirmed separately; GPS proximity never resets bin status.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const claims = claimsOf(event);
  const userId = claims?.sub;
  if (!userId) return json(401, createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.'));
  if (!hasGroup(claims, 'collector')) return json(403, createErrorResponse('FORBIDDEN', 'Only collectors can report truck location.'));

  const body = parseBody(event.body);
  if (!body) return json(400, createErrorResponse('INVALID_JSON', 'Request body must be valid JSON.'));
  const { latitude, longitude } = body;
  if (!isLatLng(latitude, longitude)) {
    return json(400, createErrorResponse('VALIDATION_ERROR', 'latitude and longitude are required.'));
  }
  const accuracy = typeof body.accuracy === 'number' && body.accuracy >= 0 ? body.accuracy : undefined;
  const speedKmh = typeof body.speedKmh === 'number' && body.speedKmh >= 0 ? Math.min(body.speedKmh, 150) : undefined;
  const heading = typeof body.heading === 'number' ? ((body.heading % 360) + 360) % 360 : undefined;

  try {
    const profile = (
      await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${userId}`, SK: 'PROFILE' } }))
    ).Item;
    const sourceId: string | undefined = profile?.assignedSourceId;
    if (!sourceId) return json(404, createErrorResponse('NO_ASSIGNED_SOURCE', 'No truck is assigned to this collector.'));

    const source = (
      await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `QR#${sourceId}`, SK: 'METADATA' } }))
    ).Item;
    if (!source || source.type !== 'truck_rotating' || source.isActive === false) {
      return json(404, createErrorResponse('QR_SOURCE_NOT_FOUND', `Truck '${sourceId}' is not configured.`));
    }
    if (source.collectorId && source.collectorId !== userId) {
      return json(403, createErrorResponse('FORBIDDEN', 'This truck is assigned to a different collector.'));
    }

    const at = new Date();
    const atIso = at.toISOString();
    const territoryId = latLngToCell(latitude, longitude, H3_RES);

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `QR#${sourceId}`, SK: 'METADATA' },
        UpdateExpression:
          'SET liveLatitude = :lat, liveLongitude = :lng, livePositionAt = :at, liveTerritoryId = :tid' +
          (speedKmh !== undefined ? ', liveSpeedKmh = :spd' : '') +
          (heading !== undefined ? ', liveHeading = :hdg' : ''),
        ExpressionAttributeValues: {
          ':lat': latitude,
          ':lng': longitude,
          ':at': atIso,
          ':tid': territoryId,
          ...(speedKmh !== undefined ? { ':spd': speedKmh } : {}),
          ...(heading !== undefined ? { ':hdg': heading } : {}),
        },
      }),
    );

    let trackerUpdated = false;
    if (TRACKER_NAME) {
      try {
        const res = await location.send(
          new BatchUpdateDevicePositionCommand({
            TrackerName: TRACKER_NAME,
            Updates: [
              {
                DeviceId: sourceId,
                Position: [longitude, latitude],
                SampleTime: at,
                ...(accuracy !== undefined ? { Accuracy: { Horizontal: accuracy } } : {}),
                PositionProperties: { collectorId: userId, ...(speedKmh !== undefined ? { speedKmh: String(speedKmh) } : {}) },
              },
            ],
          }),
        );
        trackerUpdated = !res.Errors || res.Errors.length === 0;
      } catch (err: any) {
        console.warn('[updateLocation] Amazon Location update failed', { sourceId, error: err?.message });
      }
    }

    // A nearby truck does not prove a pickup; collectors confirm through /bins/{id}/emptied.
    const binsEmptied: string[] = [];

    return json(200, { recorded: true, sourceId, territoryId, trackerUpdated, binsEmptied, recordedAt: atIso });
  } catch (error: any) {
    console.error('[updateLocation] failed', { userId, error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to record truck location.'));
  }
};
