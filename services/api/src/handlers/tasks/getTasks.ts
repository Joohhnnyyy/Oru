import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  generateDailyTaskBoard,
  generateWeeklyTaskBoard,
  generateMonthlyTaskBoard,
} from '@saafsafari/game-rules';
import { TaskBoardResponse, TaskProgress, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

/**
 * Returns ISO week string in YYYY-Www format
 */
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
    const todayStr = now.toISOString().slice(0, 10);
    const weekStr = getIsoWeekString(now);
    const monthStr = now.toISOString().slice(0, 7);

    // 2. Fetch territory name if available
    let territoryName = 'Delhi Territory';
    if (user.homeTerritoryId) {
      const terrRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TERRITORY#${user.homeTerritoryId}`,
            SK: 'METADATA',
          },
        }),
      );
      if (terrRes.Item?.name) {
        territoryName = terrRes.Item.name;
      }
    }

    // 3. Generate deterministic task definitions
    const rawDaily = generateDailyTaskBoard(userId, todayStr);
    const rawWeekly = generateWeeklyTaskBoard(userId, weekStr);
    const rawMonthly = generateMonthlyTaskBoard(userId, monthStr, territoryName);

    // 4. Query recent user ledger entries to populate progress
    const ledgerRes = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'LEDGER#',
        },
        ScanIndexForward: false,
        Limit: 50,
      }),
    );

    const ledgerItems = ledgerRes.Items || [];

    // Helper to count occurrences of actions within a timeframe
    const countActions = (actionType: string, sinceDateStr: string): number => {
      return ledgerItems.filter(
        (item: any) => item.actionType === actionType && item.timestamp >= sinceDateStr,
      ).length;
    };

    const isHabitCheckedInToday = user.lastHabitDate === todayStr;

    // Map daily tasks
    const daily: TaskProgress[] = rawDaily.map((task) => {
      let currentCount = 0;
      if (task.actionType === 'HABIT_SEGREGATION') {
        currentCount = isHabitCheckedInToday ? 1 : 0;
      } else {
        currentCount = countActions(task.actionType, todayStr);
      }
      return {
        ...task,
        currentCount,
        completed: currentCount >= task.targetCount,
      };
    });

    // Map weekly tasks
    const weekStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weekly: TaskProgress[] = rawWeekly.map((task) => {
      const currentCount = countActions(task.actionType, weekStartDate);
      return {
        ...task,
        currentCount,
        completed: currentCount >= task.targetCount,
      };
    });

    // Map monthly tasks
    const monthStartDate = `${monthStr}-01T00:00:00.000Z`;
    const monthly: TaskProgress[] = rawMonthly.map((task) => {
      let currentCount = 0;
      if (task.isTerritoryGoal) {
        currentCount = countActions('HABIT_SEGREGATION', monthStartDate) + countActions('STATIC_BIN_SCAN', monthStartDate);
      } else {
        currentCount = countActions(task.actionType, monthStartDate);
      }
      return {
        ...task,
        currentCount,
        completed: currentCount >= task.targetCount,
      };
    });

    const responsePayload: TaskBoardResponse = {
      daily,
      weekly,
      monthly,
      streakDays: user.streakDays || 0,
      lastHabitCheckInDate: user.lastHabitDate,
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
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve task board.')),
    };
  }
};
