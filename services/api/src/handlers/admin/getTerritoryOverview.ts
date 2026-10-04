import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  AdminTerritoryOverview,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { evaluateCedarPolicy } from '../../utils/cedar.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;

  // 1. Evaluate Cedar authorization policy
  const authDecision = evaluateCedarPolicy({
    claims,
    action: 'viewTerritoryOverview',
    resource: 'system',
  });

  if (authDecision.decision !== 'ALLOW') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('FORBIDDEN', authDecision.reason || 'Unauthorized administrative access.')),
    };
  }

  try {
    // 2. Fetch all territory metadata
    const territoryScan = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'SK = :sk AND begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':sk': 'METADATA',
          ':prefix': 'TERRITORY#',
        },
      }),
    );
    const territoryItems = territoryScan.Items || [];

    // 3. Fetch active open hotspots to map hotspot density per territory
    const hotspotQuery = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': 'STATUS#OPEN',
        },
      }),
    );
    const openHotspots = (hotspotQuery.Items || []).filter((h) => h.PK?.startsWith('HOTSPOT#'));

    // Count hotspots per territory
    const hotspotsByTerritory: Record<string, number> = {};
    for (const hotspot of openHotspots) {
      const tid = hotspot.territoryId;
      if (tid) {
        hotspotsByTerritory[tid] = (hotspotsByTerritory[tid] || 0) + 1;
      }
    }

    // 4. Compute dashboard metrics
    let totalHealth = 0;
    const moodDistribution: Record<string, number> = {
      sick: 0,
      recovering: 0,
      thriving: 0,
      legendary: 0,
    };

    const territories = territoryItems.map((item) => {
      const health = typeof item.health === 'number' ? item.health : 100;
      const mood = item.moodState || 'legendary';

      totalHealth += health;
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;

      return {
        territoryId: item.territoryId || item.PK.replace('TERRITORY#', ''),
        name: item.name || 'Delhi NCR Ward',
        health,
        moodState: mood,
        activeHotspotsCount: hotspotsByTerritory[item.territoryId] || 0,
        lastUpdated: item.lastUpdated || item.createdAt || new Date().toISOString(),
      };
    });

    const averageHealth = territories.length > 0
      ? Math.round((totalHealth / territories.length) * 100) / 100
      : 0;

    const overview: AdminTerritoryOverview = {
      totalTerritories: territories.length,
      averageHealth,
      moodDistribution,
      totalActiveHotspots: openHotspots.length,
      territories,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overview),
    };
  } catch (error: any) {
    console.error('Error fetching admin territory overview:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve municipal territory overview.')),
    };
  }
};
