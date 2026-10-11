import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as getWallet } from '../src/handlers/wallet/getWallet.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('Wallet Handler (WALT-01)', () => {
  const mockSub = 'user-sub-aarav';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (sub: string | null = mockSub): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'GET /v1/wallet',
      rawPath: '/v1/wallet',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method: 'GET', path: '/v1/wallet', protocol: 'HTTP/1.1' },
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

  it('returns 401 when request is unauthenticated', async () => {
    const event = createEvent(null);
    const res: any = await getWallet(event);
    expect(res.statusCode).toBe(401);
  });

  it('returns 404 when citizen profile does not exist', async () => {
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);
    const event = createEvent();
    const res: any = await getWallet(event);
    expect(res.statusCode).toBe(404);
  });

  it('returns 200 with wallet balance, tier, recent transactions, and coupons', async () => {
    const mockUser = {
      PK: `USER#${mockSub}`,
      SK: 'PROFILE',
      userId: mockSub,
      balanceGC: 150,
      lifetimeXP: 1800,
      streakDays: 7,
    };

    const mockLedgerItems = [
      {
        SK: 'LEDGER#2026-10-04T12:00:00.000Z',
        timestamp: '2026-10-04T12:00:00.000Z',
        actionType: 'STATIC_BIN_SCAN',
        creditsEarned: 10,
        xpEarned: 25,
        sourceId: 'qr_bin_1',
      },
      {
        SK: 'LEDGER#2026-10-03T15:00:00.000Z',
        timestamp: '2026-10-03T15:00:00.000Z',
        actionType: 'COUPON_REDEMPTION',
        creditsEarned: -50,
        couponId: 'coup_1',
      },
    ];

    const mockCoupons = [
      {
        redemptionId: 'red_12345678',
        couponId: 'coup_1',
        merchantId: 'merchant_khadi_cp',
        title: '₹100 Off Khadi',
        discountText: 'Flat ₹100 discount',
        redemptionCode: 'SAF-KHAD-8A9F1B',
        costGC: 50,
        redeemedAt: '2026-10-03T15:00:00.000Z',
        expiresAt: '2026-12-31T23:59:59.000Z',
        status: 'active',
      },
    ];

    // 1. Get user profile
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: mockUser } as any);
    // 2. Query ledger
    vi.mocked(docClient.send).mockResolvedValueOnce({ Items: mockLedgerItems } as any);
    // 3. Query coupons
    vi.mocked(docClient.send).mockResolvedValueOnce({ Items: mockCoupons } as any);

    const event = createEvent();
    const res: any = await getWallet(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.balanceGC).toBe(150);
    expect(body.lifetimeXP).toBe(1800);
    expect(body.tier.currentTier.titleEn).toBe('Paudha (Sapling)');
    expect(body.recentTransactions).toHaveLength(2);
    expect(body.activeCoupons).toHaveLength(1);
    expect(body.activeCoupons[0].redemptionCode).toBe('SAF-KHAD-8A9F1B');
  });
});
