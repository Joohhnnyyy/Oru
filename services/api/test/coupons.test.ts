import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as getCoupons } from '../src/handlers/coupons/getCoupons.js';
import { handler as redeemCoupon } from '../src/handlers/coupons/redeemCoupon.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('Coupon Handlers (WALT-02)', () => {
  const mockSub = 'user-sub-aarav';
  const mockMerchantId = 'merchant_khadi_cp';
  const mockCouponId = 'coup_khadi_100_off';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (
    route: string,
    method: string,
    body: any = null,
    sub: string | null = mockSub,
  ): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: `${method} ${route}`,
      rawPath: route,
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method, path: route, protocol: 'HTTP/1.1' },
        authorizer: sub
          ? {
              jwt: {
                claims: { sub, email: 'aarav@saafsafari.demo' },
              },
            }
          : undefined,
      },
      body: body ? JSON.stringify(body) : undefined,
    };
    return event;
  };

  describe('getCoupons handler', () => {
    it('returns available coupons with positive stock and future expiry', async () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const pastDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

      const mockCoupons = [
        {
          couponId: 'c1',
          merchantId: 'm1',
          title: 'Valid Coupon',
          discountText: '10% off',
          costGC: 50,
          stock: 20,
          expiresAt: futureDate,
        },
        {
          couponId: 'c2',
          merchantId: 'm1',
          title: 'Out of Stock Coupon',
          discountText: '20% off',
          costGC: 100,
          stock: 0,
          expiresAt: futureDate,
        },
        {
          couponId: 'c3',
          merchantId: 'm2',
          title: 'Expired Coupon',
          discountText: '30% off',
          costGC: 80,
          stock: 15,
          expiresAt: pastDate,
        },
      ];

      vi.mocked(docClient.send).mockResolvedValueOnce({
        Items: mockCoupons,
      } as any);

      const event = createEvent('/v1/coupons', 'GET');
      const res: any = await getCoupons(event);

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.coupons).toHaveLength(1);
      expect(body.coupons[0].couponId).toBe('c1');
      expect(body.count).toBe(1);
    });
  });

  describe('redeemCoupon handler', () => {
    const validCoupon = {
      couponId: mockCouponId,
      merchantId: mockMerchantId,
      title: '₹100 Off Pure Handloom',
      discountText: 'Flat ₹100 discount',
      costGC: 120,
      stock: 50,
      expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
    };

    it('successfully redeems coupon when user has sufficient balance and is under weekly limit', async () => {
      // 1. Get user profile (balance 200 GC >= 120 cost)
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 200,
        },
      } as any);
      // 2. Get coupon metadata
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: validCoupon } as any);
      // 3. Get weekly limit (none exists)
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);
      // 4. TransactWriteCommand succeeds
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      const event = createEvent('/v1/coupons/redeem', 'POST', {
        couponId: mockCouponId,
        merchantId: mockMerchantId,
      });

      const res: any = await redeemCoupon(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.newBalanceGC).toBe(80); // 200 - 120
      expect(body.redemption.redemptionCode).toMatch(/^SAF-KHAD-[0-9A-F]{6}$/);

      // Verify TransactWriteItems call
      const txCall = vi.mocked(docClient.send).mock.calls[3][0] as any;
      expect(txCall.input.TransactItems).toHaveLength(5);
    });

    it('rejects redemption when user balance is insufficient', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 30, // only 30 GC, coupon costs 120
        },
      } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: validCoupon } as any);

      const event = createEvent('/v1/coupons/redeem', 'POST', {
        couponId: mockCouponId,
        merchantId: mockMerchantId,
      });

      const res: any = await redeemCoupon(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INSUFFICIENT_BALANCE');
    });

    it('rejects redemption when coupon is out of stock', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: { PK: `USER#${mockSub}`, SK: 'PROFILE', balanceGC: 500 },
      } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: { ...validCoupon, stock: 0 },
      } as any);

      const event = createEvent('/v1/coupons/redeem', 'POST', {
        couponId: mockCouponId,
        merchantId: mockMerchantId,
      });

      const res: any = await redeemCoupon(event);
      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('OUT_OF_STOCK');
    });

    it('rejects redemption when user already redeemed a coupon from this merchant this week', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: { PK: `USER#${mockSub}`, SK: 'PROFILE', balanceGC: 500 },
      } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: validCoupon } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: { PK: `USER#${mockSub}`, SK: `LIMIT#${mockMerchantId}#2026-W41` },
      } as any);

      const event = createEvent('/v1/coupons/redeem', 'POST', {
        couponId: mockCouponId,
        merchantId: mockMerchantId,
      });

      const res: any = await redeemCoupon(event);
      expect(res.statusCode).toBe(429);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('WEEKLY_LIMIT_EXCEEDED');
    });

    it('rejects unauthenticated requests', async () => {
      const event = createEvent('/v1/coupons/redeem', 'POST', { couponId: 'c1', merchantId: 'm1' }, null);
      const res: any = await redeemCoupon(event);
      expect(res.statusCode).toBe(401);
    });
  });
});
