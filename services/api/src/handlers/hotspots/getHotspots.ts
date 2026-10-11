import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const territoryId = event.queryStringParameters?.territoryId;
  const status = event.queryStringParameters?.status?.toUpperCase() || 'OPEN';

  try {
    let items: any[] = [];

    if (territoryId) {
      // Query GSI2 for status and filter by territory
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI2',
          KeyConditionExpression: 'GSI2PK = :gsi2pk',
          FilterExpression: 'territoryId = :tid',
          ExpressionAttributeValues: {
            ':gsi2pk': `STATUS#${status}`,
            ':tid': territoryId,
          },
        }),
      );
      items = (result.Items || []).filter((item) => item.PK?.startsWith('HOTSPOT#'));
    } else {
      // Query GSI2 for status
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI2',
          KeyConditionExpression: 'GSI2PK = :gsi2pk',
          ExpressionAttributeValues: {
            ':gsi2pk': `STATUS#${status}`,
          },
          Limit: 50,
        }),
      );
      items = (result.Items || []).filter((item) => item.PK?.startsWith('HOTSPOT#'));
    }

    const hotspots = items.map((item) => ({
      hotspotId: item.hotspotId,
      reporterUserId: item.reporterUserId,
      territoryId: item.territoryId,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.title,
      description: item.description,
      severity: item.severity,
      status: item.status,
      bountyId: item.bountyId,
      photoUrl: item.photoUrl,
      createdAt: item.createdAt,
      resolvedAt: item.resolvedAt,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotspots,
        count: hotspots.length,
      }),
    };
  } catch (error: any) {
    console.error('Error fetching hotspots:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve hotspots.')),
    };
  }
};
