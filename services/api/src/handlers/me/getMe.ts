import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { UserProfile, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

interface HomeTerritorySummary {
  territoryId: string;
  name: string;
  ward?: string;
  mascot?: string;
  health: number;
  mood: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const userId = claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.')),
    };
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      }),
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('USER_NOT_FOUND', 'User profile not found. Please complete onboarding first.')),
      };
    }

    const { PK, SK, GSI1PK, GSI1SK, ...profile } = result.Item;

    // Home territory summary for the app's home card. Best-effort: a missing or
    // failed territory read must never block the profile itself.
    let territory: HomeTerritorySummary | null = null;
    if (profile.homeTerritoryId) {
      try {
        const t = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: `TERRITORY#${profile.homeTerritoryId}`, SK: 'METADATA' },
          }),
        );
        if (t.Item) {
          territory = {
            territoryId: profile.homeTerritoryId,
            name: t.Item.name || 'Home territory',
            ward: t.Item.ward,
            mascot: t.Item.mascot,
            health: typeof t.Item.health === 'number' ? t.Item.health : 100,
            mood: t.Item.mood || t.Item.moodState || 'thriving',
          };
        }
      } catch (err: any) {
        console.warn('[getMe] territory lookup failed', { error: err?.message });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(profile as UserProfile), territory }),
    };
  } catch (error: any) {
    console.error('[getMe] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve user profile.')),
    };
  }
};
