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

    const trucks: LiveTruck[] = items.map((item: any) => ({
      truckId: item.sourceId.replace('qr_truck_', 'trk_'),
      sourceId: item.sourceId,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      h3TerritoryId: item.h3TerritoryId,
      lastUpdated: item.updatedAt || nowIso,
      status: item.isActive !== false ? 'active' : 'idle',
    }));

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
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve live collection vehicle locations.')),
    };
  }
};
