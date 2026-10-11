import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as getLiveTrucks } from '../src/handlers/trucks/getLiveTrucks.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('Live Collection Truck Tracking Handler (TRK-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: 'GET /v1/trucks/live',
      rawPath: '/v1/trucks/live',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method: 'GET', path: '/v1/trucks/live', protocol: 'HTTP/1.1' },
      },
    };
    return event;
  };

  it('returns live tracking coordinates and active status for municipal waste vehicles', async () => {
    const mockTrucks = [
      {
        PK: 'QR#qr_truck_ndmc_01',
        SK: 'METADATA',
        sourceId: 'qr_truck_ndmc_01',
        type: 'truck_rotating',
        name: 'NDMC Central Route Waste Truck',
        latitude: 28.6328,
        longitude: 77.2195,
        h3TerritoryId: '8760824b4ffffff',
        isActive: true,
        // Collector app reported a live position 1 minute ago
        liveLatitude: 28.6401,
        liveLongitude: 77.2301,
        livePositionAt: new Date(Date.now() - 60_000).toISOString(),
      },
      {
        PK: 'QR#qr_truck_mcd_south_02',
        SK: 'METADATA',
        sourceId: 'qr_truck_mcd_south_02',
        type: 'truck_rotating',
        name: 'MCD South Saket Waste Truck',
        latitude: 28.525,
        longitude: 77.215,
        h3TerritoryId: '8760824b0ffffff',
        isActive: false,
      },
    ];

    vi.mocked(docClient.send).mockResolvedValueOnce({
      Items: mockTrucks,
    } as any);

    const res: any = await getLiveTrucks(createEvent());
    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);
    expect(body.count).toBe(2);
    expect(body.trucks).toHaveLength(2);

    expect(body.trucks[0].truckId).toBe('trk_ndmc_01');
    expect(body.trucks[0].status).toBe('active');
    expect(body.trucks[0].latitude).toBe(28.6401); // live position, not the depot
    expect(body.trucks[0].longitude).toBe(77.2301);

    expect(body.trucks[1].truckId).toBe('trk_mcd_south_02');
    expect(body.trucks[1].status).toBe('idle'); // no recent position
    expect(body.trucks[1].latitude).toBe(28.525);
  });
});
