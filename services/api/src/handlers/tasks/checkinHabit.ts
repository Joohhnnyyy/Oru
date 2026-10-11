import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { HabitCheckInResponse, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { clampTerritoryHealth, istDayString, ledgerSortKey } from '../../utils/territory.js';

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
    // 1. Fetch user profile
    const userRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      }),
    );

    if (!userRes.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('USER_NOT_FOUND', 'User profile not found. Please complete onboarding first.')),
      };
    }

    const user = userRes.Item;
    const now = new Date();
    const todayStr = istDayString(now); // IST day, 3 AM cutoff
    const nowIso = now.toISOString();

    // Check if already completed today
    if (user.lastHabitDate === todayStr) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('ALREADY_CHECKED_IN', 'You have already completed your habit check-in for today.')),
      };
    }

    // Compute streak days
    const yesterdayStr = istDayString(now, -1);

    let newStreak = 1;
    if (user.lastHabitDate === yesterdayStr) {
      newStreak = (user.streakDays || 0) + 1;
    }

    const creditsEarned = 5;
    const xpEarned = 10;
    const newBalanceGC = (user.balanceGC || 0) + creditsEarned;
    const newLifetimeXP = (user.lifetimeXP || 0) + xpEarned;

    // 2. Atomic transaction write
    const transactItems: any[] = [
      // Guard against duplicate check-in today
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `HABIT#${todayStr}`,
            userId,
            date: todayStr,
            createdAt: nowIso,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      // Immutable ledger entry
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: ledgerSortKey(nowIso),
            GSI1PK: 'ACTION#HABIT_SEGREGATION',
            GSI1SK: nowIso,
            userId,
            actionType: 'HABIT_SEGREGATION',
            creditsEarned,
            xpEarned,
            territoryId: user.homeTerritoryId,
            timestamp: nowIso,
          },
        },
      },
      // User profile update
      {
        Update: {
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
          },
          UpdateExpression: 'SET balanceGC = balanceGC + :gc, lifetimeXP = lifetimeXP + :xp, streakDays = :newStreak, lastHabitDate = :today, updatedAt = :nowIso',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':gc': creditsEarned,
            ':xp': xpEarned,
            ':newStreak': newStreak,
            ':today': todayStr,
            ':nowIso': nowIso,
          },
        },
      },
    ];

    // If user has home territory, add slight health gain
    if (user.homeTerritoryId) {
      transactItems.push({
        Update: {
          TableName: TABLE_NAME,
          Key: {
            PK: `TERRITORY#${user.homeTerritoryId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET health = health + :gain, totalActions = if_not_exists(totalActions, :zero) + :one',
          ConditionExpression: 'attribute_exists(PK)',
          ExpressionAttributeValues: {
            ':gain': 0.1,
            ':zero': 0,
            ':one': 1,
          },
        },
      });
    }

    try {
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
    } catch (txErr: any) {
      if (txErr.name === 'TransactionCanceledException') {
        return {
          statusCode: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('ALREADY_CHECKED_IN', 'Habit check-in already recorded for today.')),
        };
      }
      throw txErr;
    }

    await clampTerritoryHealth(user.homeTerritoryId);

    const responsePayload: HabitCheckInResponse = {
      success: true,
      creditsEarned,
      xpEarned,
      newBalanceGC,
      newLifetimeXP,
      streakDays: newStreak,
      message: `Daily segregation habit verified! Streak reached ${newStreak} ${newStreak === 1 ? 'day' : 'days'}.`,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    console.error('[checkinHabit] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to complete habit check-in.')),
    };
  }
};
