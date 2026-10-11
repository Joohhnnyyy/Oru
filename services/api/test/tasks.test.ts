import { describe, it, expect, vi, beforeEach } from 'vitest';
import { istDayString } from '../src/utils/territory.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as getTasks } from '../src/handlers/tasks/getTasks.js';
import { handler as checkinHabit } from '../src/handlers/tasks/checkinHabit.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('Task Board & Habit Handlers', () => {
  const mockSub = 'user-test-sub-123';
  const mockTerritory = '8760824b4ffffff';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createAuthEvent = (sub: string | null = mockSub, body: any = null): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'GET /v1/tasks',
      rawPath: '/v1/tasks',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method: 'GET', path: '/v1/tasks', protocol: 'HTTP/1.1' },
        authorizer: sub
          ? {
              jwt: {
                claims: { sub, email: 'test@user.in' },
              },
            }
          : undefined,
      },
      body: body ? JSON.stringify(body) : undefined,
    };
    return event;
  };

  describe('getTasks handler', () => {
    it('returns 401 when request is unauthenticated', async () => {
      const event = createAuthEvent(null);
      const res: any = await getTasks(event);
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 404 when user profile is not found', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);
      const event = createAuthEvent();
      const res: any = await getTasks(event);
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('USER_NOT_FOUND');
    });

    it('returns 200 with daily, weekly, and monthly task boards populated with completion progress', async () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const mockUser = {
        PK: `USER#${mockSub}`,
        SK: 'PROFILE',
        userId: mockSub,
        homeTerritoryId: mockTerritory,
        streakDays: 5,
        lastHabitDate: todayStr,
      };

      const mockTerritoryItem = {
        PK: `TERRITORY#${mockTerritory}`,
        SK: 'METADATA',
        name: 'Connaught Place - Barakhamba',
      };

      const mockLedgerItems = [
        {
          PK: `USER#${mockSub}`,
          SK: `LEDGER#${todayStr}T10:00:00.000Z`,
          actionType: 'STATIC_BIN_SCAN',
          timestamp: `${todayStr}T10:00:00.000Z`,
        },
      ];

      // 1. Get user profile
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: mockUser } as any);
      // 2. Get territory
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: mockTerritoryItem } as any);
      // 3. Query ledger
      vi.mocked(docClient.send).mockResolvedValueOnce({ Items: mockLedgerItems } as any);

      const event = createAuthEvent();
      const res: any = await getTasks(event);

      expect(res.statusCode).toBe(200);
      const board = JSON.parse(res.body);
      expect(board.daily).toHaveLength(3);
      expect(board.weekly).toHaveLength(3);
      expect(board.monthly).toHaveLength(3);
      expect(board.streakDays).toBe(5);
      expect(board.lastHabitCheckInDate).toBe(todayStr);

      // Verify habit task is marked completed since lastHabitDate == todayStr
      const habitTask = board.daily.find((t: any) => t.actionType === 'HABIT_SEGREGATION');
      expect(habitTask).toBeDefined();
      expect(habitTask.currentCount).toBe(1);
      expect(habitTask.completed).toBe(true);

      // Verify static bin scan has currentCount == 1 from ledger
      const binTask = board.daily.find((t: any) => t.actionType === 'STATIC_BIN_SCAN');
      expect(binTask).toBeDefined();
      expect(binTask.currentCount).toBe(1);
      expect(binTask.completed).toBe(binTask.currentCount >= binTask.targetCount);
    });
  });

  describe('checkinHabit handler', () => {
    it('returns 401 when request is unauthenticated', async () => {
      const event = createAuthEvent(null);
      const res: any = await checkinHabit(event);
      expect(res.statusCode).toBe(401);
    });

    it('returns 409 when user has already completed habit check-in today', async () => {
      const todayStr = istDayString(new Date()) // check-in days are IST with a 3 AM cutoff;
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          lastHabitDate: todayStr,
          streakDays: 4,
        },
      } as any);

      const event = createAuthEvent();
      const res: any = await checkinHabit(event);
      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('ALREADY_CHECKED_IN');
    });

    it('increments streak and writes atomic transaction when consecutive day checkin', async () => {
      const yesterday = istDayString(new Date(), -1);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 50,
          lifetimeXP: 100,
          lastHabitDate: yesterday,
          streakDays: 3,
          homeTerritoryId: mockTerritory,
        },
      } as any);

      // Mock successful TransactWriteCommand
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      const event = createAuthEvent();
      const res: any = await checkinHabit(event);

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.creditsEarned).toBe(5);
      expect(body.xpEarned).toBe(10);
      expect(body.newBalanceGC).toBe(55);
      expect(body.newLifetimeXP).toBe(110);
      expect(body.streakDays).toBe(4); // incremented from 3 to 4

      // 1 profile read + 1 transaction + 2 best-effort health clamp writes
      expect(docClient.send).toHaveBeenCalledTimes(4);
      const txCall = vi.mocked(docClient.send).mock.calls[1][0] as any;
      expect(txCall.input.TransactItems).toHaveLength(4); // HABIT item, LEDGER item, USER update, TERRITORY update
    });

    it('resets streak to 1 when user missed a day', async () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 10,
          lifetimeXP: 50,
          lastHabitDate: fourDaysAgo,
          streakDays: 12,
        },
      } as any);

      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      const event = createAuthEvent();
      const res: any = await checkinHabit(event);

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.streakDays).toBe(1); // reset to 1
    });

    it('handles TransactionCanceledException and returns 409 Conflict', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          lastHabitDate: yesterday,
          streakDays: 2,
        },
      } as any);

      const txError = new Error('ConditionalCheckFailed');
      txError.name = 'TransactionCanceledException';
      vi.mocked(docClient.send).mockRejectedValueOnce(txError);

      const event = createAuthEvent();
      const res: any = await checkinHabit(event);
      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('ALREADY_CHECKED_IN');
    });
  });
});
