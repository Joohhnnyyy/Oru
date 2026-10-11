import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as crypto from 'crypto';
import * as h3 from 'h3-js';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  ReportHotspotRequestSchema,
  ReportHotspotResponse,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { clampTerritoryHealth } from '../../utils/territory.js';

const MAX_REPORTS_PER_DAY = 3;

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

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INVALID_JSON', 'Request body must be valid JSON.')),
    };
  }

  const parseResult = ReportHotspotRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid hotspot report payload.')),
    };
  }

  const { latitude, longitude, title, description, severity, photoUrl } = parseResult.data;

  // Validate coordinates within Delhi NCR bounding box (28.2 to 29.0 N, 76.7 to 77.6 E)
  if (latitude < 28.2 || latitude > 29.0 || longitude < 76.7 || longitude > 77.6) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('LOCATION_OUT_OF_BOUNDS', 'Hotspot coordinates must be located within Delhi NCR region.')),
    };
  }

  try {
    const territoryId = parseResult.data.territoryId || h3.latLngToCell(latitude, longitude, 7);
    const hotspotId = `hotspot_${crypto.randomBytes(6).toString('hex')}`;
    const bountyId = `bounty_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const healthPenalty = -5;
    const todayStr = nowIso.slice(0, 10);

    // Execute atomic TransactWriteItems:
    // 1. Hotspot record
    // 2. Territory health penalty (-5 health)
    // 3. Automated cleanup Bounty task (120 GC, 250 XP)
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          // Per-user daily cap so one account can't spam reports to sink a rival territory
          {
            Update: {
              TableName: TABLE_NAME,
              Key: { PK: `USER#${userId}`, SK: `HOTSPOT_LIMIT#${todayStr}` },
              UpdateExpression: 'ADD reportCount :one SET #ttl = :ttl',
              ConditionExpression: 'attribute_not_exists(reportCount) OR reportCount < :max',
              ExpressionAttributeNames: { '#ttl': 'ttl' },
              ExpressionAttributeValues: {
                ':one': 1,
                ':max': MAX_REPORTS_PER_DAY,
                ':ttl': Math.floor(now.getTime() / 1000) + 2 * 24 * 3600,
              },
            },
          },
          {
            Put: {
              TableName: TABLE_NAME,
              Item: {
                PK: `HOTSPOT#${hotspotId}`,
                SK: 'METADATA',
                GSI1PK: `TERRITORY#${territoryId}`,
                GSI1SK: nowIso,
                GSI2PK: 'STATUS#OPEN',
                GSI2SK: nowIso,
                hotspotId,
                reporterUserId: userId,
                territoryId,
                latitude,
                longitude,
                title,
                description,
                severity,
                status: 'OPEN',
                bountyId,
                photoUrl: photoUrl || null,
                createdAt: nowIso,
              },
            },
          },
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `TERRITORY#${territoryId}`,
                SK: 'METADATA',
              },
              UpdateExpression: 'SET health = health - :penalty, lastUpdated = :now',
              // Only real (seeded) territories; never create ghost territory items
              ConditionExpression: 'attribute_exists(PK)',
              ExpressionAttributeValues: {
                ':penalty': 5,
                ':now': nowIso,
              },
            },
          },
          {
            Put: {
              TableName: TABLE_NAME,
              Item: {
                PK: `BOUNTY#${bountyId}`,
                SK: 'METADATA',
                GSI1PK: `TERRITORY#${territoryId}`,
                GSI1SK: nowIso,
                bountyId,
                hotspotId,
                territoryId,
                title: `Civic Cleanup Bounty: ${title}`,
                description: `Community cleanup bounty for verified dumping site. ${description}`,
                rewardGC: 120,
                rewardXP: 250,
                status: 'AVAILABLE',
                createdAt: nowIso,
                expiresAt,
              },
            },
          },
        ],
      }),
    );

    await clampTerritoryHealth(territoryId);

    const response: ReportHotspotResponse = {
      hotspotId,
      territoryId,
      bountyId,
      healthPenalty,
      status: 'OPEN',
      bountyReward: {
        greenCredits: 120,
        xp: 250,
      },
      reportedAt: nowIso,
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    if (error?.name === 'TransactionCanceledException') {
      const reasons: Array<{ Code?: string }> = error.CancellationReasons || [];
      const limitHit = reasons[0]?.Code === 'ConditionalCheckFailed';
      return {
        statusCode: limitHit ? 429 : 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          limitHit
            ? createErrorResponse('DAILY_LIMIT_REACHED', `You can report up to ${MAX_REPORTS_PER_DAY} hotspots per day.`)
            : createErrorResponse('OUTSIDE_TERRITORY', 'This location is outside the active Oru territories.'),
        ),
      };
    }
    console.error('Error reporting hotspot:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to report civic hotspot.')),
    };
  }
};
