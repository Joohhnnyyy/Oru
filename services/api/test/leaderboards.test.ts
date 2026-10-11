import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as getLeaderboard } from '../src/handlers/leaderboards/getLeaderboard.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('Leaderboards Handler', () => {
  const mockSub = 'user-sub-aarav';
  const mockTerritory = '8760824b4ffffff';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (
    queryParams: Record<string, string> = {},
    sub: string | null = mockSub,
  ): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'GET /v1/leaderboards',
      rawPath: '/v1/leaderboards',
      rawQueryString: Object.entries(queryParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&'),
      queryStringParameters: queryParams,
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method: 'GET', path: '/v1/leaderboards', protocol: 'HTTP/1.1' },
        authorizer: sub
          ? {
              jwt: {
                claims: { sub, email: 'aarav@saafsafari.demo' },
              },
            }
          : undefined,
      },
    };
    return event;
  };

  it('returns ranked users for a territory with ranks and tier titles', async () => {
    const mockUsers = [
      {
        userId: 'user-sub-priya',
        displayName: 'Priya Singh',
        lifetimeXP: 450,
      },
      {
        userId: mockSub,
        displayName: 'Aarav Sharma',
        lifetimeXP: 1250,
      },
      {
        userId: 'user-sub-rohan',
        displayName: 'Rohan Verma',
        lifetimeXP: 150,
      },
    ];

    vi.mocked(docClient.send).mockResolvedValueOnce({
      Items: mockUsers,
    } as any);

    const event = createEvent({ type: 'territory', territoryId: mockTerritory });
    const res: any = await getLeaderboard(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.type).toBe('territory');
    expect(body.territoryId).toBe(mockTerritory);
    expect(body.entries).toHaveLength(3);

    // Aarav has 1250 XP -> rank 1
    expect(body.entries[0].id).toBe(mockSub);
    expect(body.entries[0].rank).toBe(1);
    expect(body.entries[0].tier).toBe('Ankur (Sprout)');

    // Priya has 450 XP -> rank 2
    expect(body.entries[1].id).toBe('user-sub-priya');
    expect(body.entries[1].rank).toBe(2);
    expect(body.entries[1].tier).toBe('Beej (Seed)');

    // Check userRank
    expect(body.userRank).toBeDefined();
    expect(body.userRank.id).toBe(mockSub);
    expect(body.userRank.rank).toBe(1);
  });

  it('returns citywide citizen ranking across Delhi', async () => {
    const mockAllCitizens = [
      { userId: 'usr-1', displayName: 'Top Citizen', lifetimeXP: 10500 },
      { userId: mockSub, displayName: 'Aarav Sharma', lifetimeXP: 2200 },
    ];

    vi.mocked(docClient.send).mockResolvedValueOnce({
      Items: mockAllCitizens,
    } as any);

    const event = createEvent({ type: 'citywide' });
    const res: any = await getLeaderboard(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.type).toBe('citywide');
    expect(body.entries[0].name).toBe('Top Citizen');
    expect(body.entries[0].tier).toBe('Van Rakshak (Forest Guardian)');
    expect(body.entries[1].id).toBe(mockSub);
  });

  it('returns territory vs territory competitive ranking', async () => {
    const mockTerritories = [
      { h3Index: '8760824b4ffffff', name: 'Connaught Place', health: 85, mascot: 'Indian Peafowl', mood: 'thriving' },
      { h3Index: '8760824b0ffffff', name: 'Lodhi Colony', health: 92, mascot: 'Indian Peafowl', mood: 'legendary' },
      { h3Index: '8760824b6ffffff', name: 'Yamuna Riverbed', health: 28, mascot: 'Blackbuck', mood: 'sick' },
    ];

    vi.mocked(docClient.send).mockResolvedValueOnce({
      Items: mockTerritories,
    } as any);

    const event = createEvent({ type: 'territories' });
    const res: any = await getLeaderboard(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.type).toBe('territories');
    expect(body.entries).toHaveLength(3);

    // Highest health first
    expect(body.entries[0].name).toBe('Lodhi Colony');
    expect(body.entries[0].score).toBe(92);
    expect(body.entries[0].rank).toBe(1);

    expect(body.entries[2].name).toBe('Yamuna Riverbed');
    expect(body.entries[2].score).toBe(28);
    expect(body.entries[2].mood).toBe('sick');
  });

  it('returns 400 for invalid leaderboard type', async () => {
    const event = createEvent({ type: 'invalid_type' });
    const res: any = await getLeaderboard(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
