import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

// Mock DynamoDB DocumentClient
const mockSend = vi.fn();
vi.mock('../src/utils/dynamo.js', () => ({
  docClient: {
    send: (...args: any[]) => mockSend(...args),
  },
  TABLE_NAME: 'SaafSafariMain',
}));

import { handler as reportHotspotHandler } from '../src/handlers/hotspots/reportHotspot.js';
import { handler as getHotspotsHandler } from '../src/handlers/hotspots/getHotspots.js';

describe('Civic Hotspot Reporting & Bounties (HOT-01, HOT-02)', () => {
  const mockUserId = 'usr_citizen123456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reportHotspot handler', () => {
    it('returns 401 when auth claims are missing', async () => {
      const event: Partial<APIGatewayProxyEventV2> = {
        body: JSON.stringify({
          latitude: 28.6139,
          longitude: 77.2090,
          title: 'Illegal dump near park',
          description: 'Large pile of mixed plastic waste blocking walkway',
        }),
        requestContext: {} as any,
      };

      const res: any = await reportHotspotHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when coordinates are outside Delhi NCR region', async () => {
      const event: Partial<APIGatewayProxyEventV2> = {
        body: JSON.stringify({
          latitude: 19.0760, // Mumbai coordinates
          longitude: 72.8777,
          title: 'Illegal dump site',
          description: 'Garbage accumulation near station',
        }),
        requestContext: {
          authorizer: {
            jwt: {
              claims: { sub: mockUserId },
              scopes: [],
            },
          },
        } as any,
      };

      const res: any = await reportHotspotHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('LOCATION_OUT_OF_BOUNDS');
    });

    it('successfully records hotspot, deducts 5 health, and generates bounty task', async () => {
      mockSend.mockResolvedValueOnce({});

      const event: Partial<APIGatewayProxyEventV2> = {
        body: JSON.stringify({
          latitude: 28.6139,
          longitude: 77.2090,
          title: 'Waste dump on central avenue',
          description: 'Open waste pile requiring municipal clearing and segregation.',
          severity: 'HIGH',
        }),
        requestContext: {
          authorizer: {
            jwt: {
              claims: { sub: mockUserId },
              scopes: [],
            },
          },
        } as any,
      };

      const res: any = await reportHotspotHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(201);

      const body = JSON.parse(res.body);
      expect(body.hotspotId).toMatch(/^hotspot_[0-9a-f]{12}$/);
      expect(body.bountyId).toMatch(/^bounty_[0-9a-f]{12}$/);
      expect(body.healthPenalty).toBe(-5);
      expect(body.status).toBe('OPEN');
      expect(body.bountyReward).toEqual({
        greenCredits: 120,
        xp: 250,
      });

      // Verify TransactWriteItems call
      expect(mockSend).toHaveBeenCalledTimes(1);
      const transactCall = mockSend.mock.calls[0][0];
      const items = transactCall.input.TransactItems;
      expect(items).toHaveLength(3);

      // Item 0: Hotspot Put
      expect(items[0].Put.Item.PK).toBe(`HOTSPOT#${body.hotspotId}`);
      expect(items[0].Put.Item.reporterUserId).toBe(mockUserId);
      expect(items[0].Put.Item.severity).toBe('HIGH');

      // Item 1: Territory health update (-5)
      expect(items[1].Update.Key.PK).toBe(`TERRITORY#${body.territoryId}`);
      expect(items[1].Update.ExpressionAttributeValues[':penalty']).toBe(5);

      // Item 2: Bounty task Put
      expect(items[2].Put.Item.PK).toBe(`BOUNTY#${body.bountyId}`);
      expect(items[2].Put.Item.rewardGC).toBe(120);
      expect(items[2].Put.Item.rewardXP).toBe(250);
      expect(items[2].Put.Item.status).toBe('AVAILABLE');
    });
  });

  describe('getHotspots handler', () => {
    it('returns hotspots filtered by territoryId', async () => {
      const mockHotspot = {
        PK: 'HOTSPOT#hotspot_112233445566',
        SK: 'METADATA',
        hotspotId: 'hotspot_112233445566',
        reporterUserId: mockUserId,
        territoryId: '8728308281fffff',
        latitude: 28.6139,
        longitude: 77.2090,
        title: 'Open dump',
        description: 'Needs cleanup',
        severity: 'MEDIUM',
        status: 'OPEN',
        bountyId: 'bounty_998877665544',
        createdAt: new Date().toISOString(),
      };

      mockSend.mockResolvedValueOnce({
        Items: [mockHotspot],
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        queryStringParameters: {
          territoryId: '8728308281fffff',
        },
      };

      const res: any = await getHotspotsHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.count).toBe(1);
      expect(body.hotspots[0].hotspotId).toBe('hotspot_112233445566');
    });

    it('returns open hotspots across city when no territory specified', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'HOTSPOT#hotspot_aabbccddeeff',
            SK: 'METADATA',
            hotspotId: 'hotspot_aabbccddeeff',
            reporterUserId: mockUserId,
            territoryId: '8728308281fffff',
            latitude: 28.62,
            longitude: 77.21,
            title: 'Overflowing bin corner',
            description: 'Commercial waste spill',
            severity: 'CRITICAL',
            status: 'OPEN',
            bountyId: 'bounty_111122223333',
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        queryStringParameters: {},
      };

      const res: any = await getHotspotsHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.count).toBe(1);
      expect(body.hotspots[0].severity).toBe('CRITICAL');
    });
  });
});
