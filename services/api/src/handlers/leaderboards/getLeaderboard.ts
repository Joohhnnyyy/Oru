import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getUserTier } from '@saafsafari/game-rules';
import {
  LeaderboardResponse,
  LeaderboardEntry,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

function getIsoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const currentUserId = claims?.sub;

  const queryParams = event.queryStringParameters || {};
  const type = (queryParams.type || 'territory') as 'territory' | 'citywide' | 'territories';
  let territoryId = queryParams.territoryId;

  const periodKey = getIsoWeekString(new Date());

  try {
    let entries: LeaderboardEntry[] = [];
    let userRank: LeaderboardEntry | undefined;

    if (type === 'territory') {
      // 1. If territoryId is not provided, look up authenticated user's home territory
      if (!territoryId && currentUserId) {
        const userRes = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `USER#${currentUserId}`,
              SK: 'PROFILE',
            },
          }),
        );
        territoryId = userRes.Item?.homeTerritoryId;
      }

      if (!territoryId) {
        territoryId = '8760824b4ffffff'; // Fallback to central Delhi cell
      }

      // Query GSI1 for all users in this territory
      const queryRes = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': `TERRITORY#${territoryId}`,
            ':gsi1sk': 'USER#',
          },
        }),
      );

      const items = queryRes.Items || [];

      // Sort by lifetimeXP descending
      const sorted = [...items].sort((a, b) => (b.lifetimeXP || 0) - (a.lifetimeXP || 0));

      const rankedEntries: LeaderboardEntry[] = sorted.map((item, idx) => {
        const xp = item.lifetimeXP || 0;
        const tierProgress = getUserTier(xp);
        return {
          rank: idx + 1,
          id: item.userId,
          name: item.displayName || item.email?.split('@')[0] || `Citizen ${idx + 1}`,
          score: xp,
          tier: tierProgress.currentTier.titleEn,
        };
      });

      if (currentUserId) {
        userRank = rankedEntries.find((e) => e.id === currentUserId);
      }

      entries = rankedEntries.slice(0, 25);
    } else if (type === 'citywide') {
      // Citywide citizen ranking
      const scanRes = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'SK = :sk AND begins_with(PK, :userPrefix)',
          ExpressionAttributeValues: {
            ':sk': 'PROFILE',
            ':userPrefix': 'USER#',
          },
        }),
      );

      const items = scanRes.Items || [];
      const sorted = [...items].sort((a, b) => (b.lifetimeXP || 0) - (a.lifetimeXP || 0));

      const rankedEntries: LeaderboardEntry[] = sorted.map((item, idx) => {
        const xp = item.lifetimeXP || 0;
        const tierProgress = getUserTier(xp);
        return {
          rank: idx + 1,
          id: item.userId,
          name: item.displayName || item.email?.split('@')[0] || `Citizen ${idx + 1}`,
          score: xp,
          tier: tierProgress.currentTier.titleEn,
        };
      });

      if (currentUserId) {
        userRank = rankedEntries.find((e) => e.id === currentUserId);
      }

      entries = rankedEntries.slice(0, 25);
    } else if (type === 'territories') {
      // Territory vs Territory health ranking
      const scanRes = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'SK = :sk AND begins_with(PK, :terrPrefix)',
          ExpressionAttributeValues: {
            ':sk': 'METADATA',
            ':terrPrefix': 'TERRITORY#',
          },
        }),
      );

      const items = scanRes.Items || [];
      const sorted = [...items].sort((a, b) => (b.health || 0) - (a.health || 0));

      entries = sorted.slice(0, 25).map((item, idx) => ({
        rank: idx + 1,
        id: item.h3Index,
        name: item.name || `Territory ${item.h3Index}`,
        score: Math.round(item.health || 0),
        mascot: item.mascot,
        mood: item.mood,
      }));
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', 'Invalid leaderboard type. Must be territory, citywide, or territories.')),
      };
    }

    const responsePayload: LeaderboardResponse = {
      type,
      periodKey,
      territoryId: type === 'territory' ? territoryId : undefined,
      entries,
      userRank,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    console.error('[getLeaderboard] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve leaderboard.')),
    };
  }
};
