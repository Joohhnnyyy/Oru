import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { hasGroup } from '../../utils/territory.js';
import { calculateHaversineDistance } from '../../utils/geo.js';
import { BIN_MANUAL_EMPTY_RADIUS_M } from '../../utils/bins.js';
import { claimsOf, isLatLng, json, parseBody } from '../../utils/http.js';

/**
 * POST /v1/collector/bins/{sourceId}/emptied  { latitude, longitude, repaired?: boolean }
 * Collector confirms a pickup (or a repair) on site. Must be within 100 m of the bin.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const claims = claimsOf(event);
  const userId = claims?.sub;
  if (!userId) return json(401, createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.'));
  if (!hasGroup(claims, 'collector')) return json(403, createErrorResponse('FORBIDDEN', 'Only collectors can mark bins as emptied.'));

  const sourceId = event.pathParameters?.sourceId;
  const body = parseBody(event.body);
  if (!sourceId || !body) return json(400, createErrorResponse('VALIDATION_ERROR', 'Bin id and a JSON body are required.'));
  if (!isLatLng(body.latitude, body.longitude)) {
    return json(400, createErrorResponse('VALIDATION_ERROR', 'Your location is required to confirm a pickup.'));
  }

  try {
    const bin = (await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `QR#${sourceId}`, SK: 'METADATA' } }))).Item;
    if (!bin || bin.type !== 'dustbin_static') return json(404, createErrorResponse('BIN_NOT_FOUND', 'That bin was not found.'));
    const distance = calculateHaversineDistance(body.latitude, body.longitude, bin.latitude, bin.longitude);
    if (distance > BIN_MANUAL_EMPTY_RADIUS_M) {
      return json(403, createErrorResponse('TOO_FAR', `Move closer to the bin to confirm (you are ${distance} m away).`));
    }

    const nowIso = new Date().toISOString();
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `QR#${sourceId}`, SK: 'METADATA' },
        UpdateExpression:
          'SET fillLevel = :zero, fillUpdatedAt = :at, lastEmptiedAt = :at, emptiedBy = :by' + (body.repaired === true ? ' REMOVE damagedAt' : ''),
        ExpressionAttributeValues: { ':zero': 0, ':at': nowIso, ':by': userId },
      }),
    );
    return json(200, { sourceId, fillLevel: 0, status: 'OK', lastEmptiedAt: nowIso });
  } catch (error: any) {
    console.error('[emptyBin] failed', { sourceId, error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to update the bin.'));
  }
};
