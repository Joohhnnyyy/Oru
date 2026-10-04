import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { generateRotatingQrToken } from '../src/utils/hmac.js';
import { handler as verifyScan } from '../src/handlers/scans/verifyScan.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('QR Scan Verification Handler', () => {
  const mockSub = 'user-sub-aarav';
  const mockTerritory = '8760824b4ffffff';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (body: any, sub: string | null = mockSub): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'POST /v1/scans',
      rawPath: '/v1/scans',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method: 'POST', path: '/v1/scans', protocol: 'HTTP/1.1' },
        authorizer: sub
          ? {
              jwt: {
                claims: { sub, email: 'aarav@saafsafari.demo' },
              },
            }
          : undefined,
      },
      body: JSON.stringify(body),
    };
    return event;
  };

  describe('Static Dustbin Scans (QR-01)', () => {
    const dustbinSource = {
      sourceId: 'qr_bin_cp_inner_circle_01',
      type: 'dustbin_static',
      name: 'Connaught Place Block A Smart Bin',
      h3TerritoryId: mockTerritory,
      latitude: 28.6328,
      longitude: 77.2195,
      geofenceRadiusMeters: 75,
      isActive: true,
    };

    it('successfully verifies scan within 75m and awards credits atomically', async () => {
      // 1. Get QR source
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: dustbinSource } as any);
      // 2. Check Cooldown (none exists)
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);
      // 3. Get User Profile
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 100,
          lifetimeXP: 250,
          streakDays: 4,
        },
      } as any);
      // 4. Get Territory Metadata
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `TERRITORY#${mockTerritory}`,
          SK: 'METADATA',
          health: 70,
        },
      } as any);
      // 5. TransactWriteCommand succeeds
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      // Scan location 20 meters away from bin
      const event = createEvent({
        sourceId: 'qr_bin_cp_inner_circle_01',
        latitude: 28.6329,
        longitude: 77.2195,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.actionType).toBe('STATIC_BIN_SCAN');
      expect(body.creditsEarned).toBeGreaterThanOrEqual(10);
      expect(body.xpEarned).toBeGreaterThanOrEqual(25);
      expect(body.newBalanceGC).toBe(100 + body.creditsEarned);
      expect(body.newLifetimeXP).toBe(250 + body.xpEarned);
      expect(body.territoryHealth).toBeGreaterThanOrEqual(70);

      // Verify TransactWriteItems
      const txCall = vi.mocked(docClient.send).mock.calls[4][0] as any;
      expect(txCall.input.TransactItems).toHaveLength(4); // ledger, balance, cooldown, territory
    });

    it('rejects scan when user coordinates breach 75m geofence radius', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: dustbinSource } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      // Scan location ~250m away from bin
      const event = createEvent({
        sourceId: 'qr_bin_cp_inner_circle_01',
        latitude: 28.6350,
        longitude: 77.2195,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(400);

      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('GEOFENCE_BREACH');
      expect(body.error.message).toContain('75 meters');
    });
  });

  describe('Rotating Collection Truck Scans (QR-02 & QR-03)', () => {
    const secretKey = 'sec_truck_hmac_secret_key_1';
    const truckSource = {
      sourceId: 'qr_truck_ndmc_central_01',
      type: 'truck_rotating',
      name: 'NDMC Central Route Waste Truck',
      h3TerritoryId: mockTerritory,
      latitude: 28.6320,
      longitude: 77.2185,
      secretKey,
      collectorId: 'usr_delhi_collector_rajesh',
      isActive: true,
    };

    it('successfully verifies rotating HMAC token and proximity within 150m, crediting collector', async () => {
      const now = Date.now();
      const validToken = generateRotatingQrToken(secretKey, truckSource.sourceId, now);

      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: truckSource } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'PROFILE',
          balanceGC: 50,
          lifetimeXP: 100,
          streakDays: 2,
        },
      } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: { PK: `TERRITORY#${mockTerritory}`, SK: 'METADATA', health: 40 },
      } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      // 40 meters from truck
      const event = createEvent({
        sourceId: truckSource.sourceId,
        qrPayload: validToken,
        latitude: 28.6323,
        longitude: 77.2185,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.actionType).toBe('TRUCK_COLLECTOR_SCAN');
      expect(body.collectorReward).toBeDefined();
      expect(body.collectorReward.collectorId).toBe('usr_delhi_collector_rajesh');
      expect(body.collectorReward.creditsEarned).toBe(2);

      // Verify collector balance update is included in TransactItems
      const txCall = vi.mocked(docClient.send).mock.calls[4][0] as any;
      expect(txCall.input.TransactItems).toHaveLength(5); // includes collector reward update
    });

    it('rejects rotating scan when qrPayload is missing', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: truckSource } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      const event = createEvent({
        sourceId: truckSource.sourceId,
        latitude: 28.6320,
        longitude: 77.2185,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('MISSING_QR_TOKEN');
    });

    it('rejects expired or forged rotating QR token', async () => {
      const expiredToken = generateRotatingQrToken(secretKey, truckSource.sourceId, Date.now() - 150000);

      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: truckSource } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      const event = createEvent({
        sourceId: truckSource.sourceId,
        qrPayload: expiredToken,
        latitude: 28.6320,
        longitude: 77.2185,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INVALID_OR_EXPIRED_TOKEN');
    });

    it('rejects rotating scan when proximity exceeds 150 meters', async () => {
      const validToken = generateRotatingQrToken(secretKey, truckSource.sourceId, Date.now());

      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: truckSource } as any);
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      // Far away coordinates (~400m away)
      const event = createEvent({
        sourceId: truckSource.sourceId,
        qrPayload: validToken,
        latitude: 28.6360,
        longitude: 77.2185,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('TRUCK_PROXIMITY_EXCEEDED');
    });
  });

  describe('Cooldown & Security Checks', () => {
    it('returns 429 when user scanned the same source within 4-hour window', async () => {
      const futureEpoch = Math.floor(Date.now() / 1000) + 7200; // 2 hours remaining
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          sourceId: 'qr_bin_1',
          type: 'dustbin_static',
          latitude: 28.6,
          longitude: 77.2,
          isActive: true,
        },
      } as any);

      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          PK: `USER#${mockSub}`,
          SK: 'COOLDOWN#qr_bin_1',
          ttl: futureEpoch,
        },
      } as any);

      const event = createEvent({
        sourceId: 'qr_bin_1',
        latitude: 28.6,
        longitude: 77.2,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(429);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('COOLDOWN_ACTIVE');
    });

    it('returns 404 when QR source is not in DynamoDB', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      const event = createEvent({
        sourceId: 'non_existent_qr',
        latitude: 28.6,
        longitude: 77.2,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('QR_SOURCE_NOT_FOUND');
    });

    it('returns 400 when QR source is inactive', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({
        Item: {
          sourceId: 'qr_decommissioned',
          isActive: false,
        },
      } as any);

      const event = createEvent({
        sourceId: 'qr_decommissioned',
        latitude: 28.6,
        longitude: 77.2,
      });

      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INACTIVE_QR_SOURCE');
    });

    it('returns 401 when request is unauthenticated', async () => {
      const event = createEvent({ sourceId: 'qr_1', latitude: 28.6, longitude: 77.2 }, null);
      const res: any = await verifyScan(event);
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
