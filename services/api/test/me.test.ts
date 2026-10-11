import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler } from '../src/handlers/me/getMe.js';

vi.mock('../src/utils/dynamo.js', () => ({
  docClient: { send: vi.fn() },
  TABLE_NAME: 'TestTable',
}));

const event = (sub: string | null = 'user-1') =>
  ({ requestContext: { authorizer: { jwt: { claims: sub ? { sub } : {} } } } }) as unknown as APIGatewayProxyEventV2;

const profileItem = {
  PK: 'USER#user-1', SK: 'PROFILE', GSI1PK: 'x', GSI1SK: 'y',
  userId: 'user-1', email: 'a@b.c', homeTerritoryId: 'h3abc', balanceGC: 120, lifetimeXP: 300, streakDays: 4, role: 'citizen',
};

describe('GET /v1/me', () => {
  beforeEach(() => vi.mocked(docClient.send).mockReset());

  it('returns the profile with its home territory summary', async () => {
    vi.mocked(docClient.send)
      .mockResolvedValueOnce({ Item: profileItem } as any)
      .mockResolvedValueOnce({ Item: { name: 'Lajpat Nagar', ward: 'Ward 61', mascot: 'dolphin', health: 64, mood: 'recovering' } } as any);
    const res: any = await handler(event());
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.PK).toBeUndefined();
    expect(body.balanceGC).toBe(120);
    expect(body.territory).toEqual({
      territoryId: 'h3abc', name: 'Lajpat Nagar', ward: 'Ward 61', mascot: 'dolphin', health: 64, mood: 'recovering',
    });
  });

  it('still returns the profile when the territory read fails', async () => {
    vi.mocked(docClient.send)
      .mockResolvedValueOnce({ Item: profileItem } as any)
      .mockRejectedValueOnce(new Error('throttled'));
    const res: any = await handler(event());
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).territory).toBeNull();
  });

  it('401s without a subject claim', async () => {
    const res: any = await handler(event(null));
    expect(res.statusCode).toBe(401);
  });
});
