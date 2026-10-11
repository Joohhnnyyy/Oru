import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as h3 from 'h3-js';
import { OnboardingRequestSchema, UserProfile, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const userId = claims?.sub;
  const email = claims?.email || '';

  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.')),
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INVALID_JSON', 'Malformed JSON in request body.')),
    };
  }

  const parseResult = OnboardingRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', `Invalid onboarding request: ${errorDetails}`)),
    };
  }

  const { language, latitude, longitude } = parseResult.data;

  // Calculate Uber H3 resolution 7 hex cell index
  const homeTerritoryId = h3.latLngToCell(latitude, longitude, 7);

  const now = new Date().toISOString();
  const profile: UserProfile = {
    userId,
    email,
    language,
    homeTerritoryId,
    role: 'citizen',
    balanceGC: 0,
    lifetimeXP: 0,
    streakDays: 0,
    createdAt: now,
    updatedAt: now,
  };

  const item = {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
    GSI1PK: `TERRITORY#${homeTerritoryId}`,
    GSI1SK: `USER#${userId}`,
    ...profile,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        // Never overwrite an existing profile (would wipe balance, XP and streak)
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    };
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') {
      // Already onboarded: return the existing profile unchanged (idempotent)
      const existing = await docClient.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${userId}`, SK: 'PROFILE' } }),
      );
      const { PK, SK, GSI1PK, GSI1SK, ...existingProfile } = existing.Item || {};
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existingProfile),
      };
    }
    console.error('[completeOnboarding] failed', { userId, error: error?.message });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to persist user profile during onboarding.')),
    };
  }
};
