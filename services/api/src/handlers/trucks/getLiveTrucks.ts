import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import {
  LiveTruck,
  LiveTrucksResponse,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const res = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :qrPrefix) AND SK = :sk AND #type = :truckType',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':qrPrefix': 'QR#',
          ':sk': 'METADATA',
          ':truckType': 'truck_rotating',
        },
      }),
    );

    const items = res.Items || [];
    const nowIso = new Date().toISOString();

    // A truck is "live" if its collector app reported a position in the last 10 minutes
    const LIVE_WINDOW_MS = 10 * 60 * 1000;
    const trucks: LiveTruck[] = items.map((item: any) => {
      const live =
        !!item.livePositionAt &&
        Date.now() - Date.parse(item.livePositionAt) <= LIVE_WINDOW_MS &&
        typeof item.liveLatitude === 'number';
      return {
        truckId: item.sourceId.replace('qr_truck_', 'trk_'),
        sourceId: item.sourceId,
        name: item.name,
        latitude: live ? item.liveLatitude : item.latitude,
        longitude: live ? item.liveLongitude : item.longitude,
        h3TerritoryId: item.h3TerritoryId,
        lastUpdated: live ? item.livePositionAt : item.updatedAt || nowIso,
        status: live ? 'active' : 'idle',
      };
    });

    const responsePayload: LiveTrucksResponse = {
      trucks,
      count: trucks.length,
      timestamp: nowIso,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    console.error('[getLiveTrucks] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve live collection vehicle locations.')),
    };
  }
};
