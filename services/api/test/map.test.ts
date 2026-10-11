import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { latLngToCell } from 'h3-js';
import { docClient } from '../src/utils/dynamo.js';

const geo = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('../src/utils/dynamo.js', () => ({ docClient: { send: vi.fn() }, TABLE_NAME: 'TestTable' }));
vi.mock('@aws-sdk/client-location', () => {
  const cmd = (name: string) => vi.fn().mockImplementation((input: any) => ({ __name: name, input }));
  return {
    LocationClient: vi.fn().mockImplementation(() => geo),
    BatchUpdateDevicePositionCommand: cmd('BatchUpdateDevicePosition'),
    GetDevicePositionHistoryCommand: cmd('GetDevicePositionHistory'),
    BatchPutGeofenceCommand: cmd('BatchPutGeofence'),
    DescribeKeyCommand: cmd('DescribeKey'),
  };
});

import { handler as getMap } from '../src/handlers/map/getMap.js';
import { handler as updateLocation } from '../src/handlers/collector/updateLocation.js';
import { handler as reportBin } from '../src/handlers/bins/reportBin.js';
import { handler as emptyBin } from '../src/handlers/bins/emptyBin.js';
import { handler as getTruckTrail } from '../src/handlers/trucks/getTruckTrail.js';
import { handler as onGeofenceEvent } from '../src/handlers/geo/onGeofenceEvent.js';
import { toGeofenceRing } from '../src/handlers/geo/syncGeofences.js';
import { estimateFill, binStatus } from '../src/utils/bins.js';
import { guardianFor } from '../src/utils/guardians.js';

const ddb = () => vi.mocked(docClient.send);
const ev = (claims: Record<string, any> | null, extra: Partial<any> = {}): APIGatewayProxyEventV2 =>
  ({ requestContext: { authorizer: claims ? { jwt: { claims } } : undefined }, ...extra }) as any;
const citizen = { sub: 'u1' };
const collector = { sub: 'c1', 'cognito:groups': ['collector'] };
const conditionalFail = () => Object.assign(new Error('conditional'), { name: 'ConditionalCheckFailedException' });

// Lajpat Nagar
const LAT = 28.5677;
const LNG = 77.2433;
const CELL = latLngToCell(LAT, LNG, 7);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const territory = {
  PK: `TERRITORY#${CELL}`, SK: 'METADATA', h3Index: CELL, name: 'Lajpat Nagar', ward: 'Ward 61', mascot: 'blackbuck',
  health: 64, mood: 'recovering', cleanIndex: 6.4, centerLat: LAT, centerLng: LNG,
  boundary: [[28.57, 77.24], [28.571, 77.25], [28.565, 77.255], [28.56, 77.25], [28.561, 77.24], [28.565, 77.235]],
};
const nearBin = { PK: 'QR#qr_bin_lajpat_01', SK: 'METADATA', sourceId: 'qr_bin_lajpat_01', type: 'dustbin_static', name: 'Lajpat Market Bin', h3TerritoryId: CELL, latitude: LAT + 0.0001, longitude: LNG, lastEmptiedAt: hoursAgo(30), fillLevel: 0, fillUpdatedAt: hoursAgo(30) };
const farBin = { ...nearBin, PK: 'QR#qr_bin_far', sourceId: 'qr_bin_far', latitude: LAT + 0.01, lastEmptiedAt: hoursAgo(2), fillUpdatedAt: hoursAgo(2) };
const truck = { PK: 'QR#qr_truck_vehicle_01', SK: 'METADATA', sourceId: 'qr_truck_vehicle_01', type: 'truck_rotating', collectorId: 'c1', name: 'Truck 01' };

/** Route DynamoDB calls by command shape so Promise.all ordering doesn't matter. */
function routeDdb(opts: { profile?: any; source?: any; bin?: any; spots?: any[] } = {}) {
  ddb().mockImplementation(async (cmd: any) => {
    const i = cmd.input || {};
    if (i.IndexName === 'GSI1') return { Items: i.ExpressionAttributeValues[':prefix'] === 'TERRITORY#' ? [territory] : [nearBin, farBin, truck] };
    if (i.IndexName === 'GSI2') return { Items: opts.spots ?? [{ territoryId: CELL }] };
    if (i.Key?.SK === 'PROFILE') return { Item: opts.profile };
    if (i.Key?.PK?.startsWith('QR#') && !i.UpdateExpression) return { Item: i.Key.PK === `QR#${truck.sourceId}` ? opts.source : opts.bin };
    if (i.UpdateExpression) return { Attributes: { ...(opts.bin || {}), fillLevel: 100, fillUpdatedAt: new Date().toISOString() } };
    return {};
  });
}

beforeEach(() => {
  ddb().mockReset();
  geo.send.mockReset().mockResolvedValue({});
});

describe('bin fill model', () => {
  it('fills with time and flags pickup at 75%', () => {
    const now = Date.now();
    expect(estimateFill({ fillLevel: 0, fillUpdatedAt: new Date(now).toISOString() }, now)).toBe(0);
    const f = estimateFill({ fillLevel: 0, fillUpdatedAt: new Date(now - 30 * 3_600_000).toISOString() }, now);
    expect(f).toBe(75);
    expect(binStatus({}, f)).toBe('NEEDS_PICKUP');
    expect(binStatus({}, 50)).toBe('FILLING');
    expect(binStatus({ damagedAt: new Date(now).toISOString(), lastEmptiedAt: hoursAgo(1) }, 10)).toBe('DAMAGED');
    expect(estimateFill({ fillLevel: 90, fillUpdatedAt: hoursAgo(100) })).toBe(100);
  });

  it('maps habitat mascots to app guardians', () => {
    expect(guardianFor('blackbuck').id).toBe('dolphin');
    expect(guardianFor('unknown').id).toBe('crane');
  });
});

describe('GET /v1/map', () => {
  it('returns territories with guardians, bins with status and per-territory counts', async () => {
    routeDdb();
    const res: any = await getMap(ev(citizen));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.territories).toHaveLength(1);
    const t = body.territories[0];
    expect(t.guardian).toEqual({ id: 'dolphin', name: 'Dolphin', role: 'Water & River Guardian' });
    expect(t.boundary[0]).toEqual([28.57, 77.24]);
    expect(t.openHotspots).toBe(1);
    expect(t.binsNeedingPickup).toBe(1);
    expect(body.bins.map((b: any) => b.sourceId)).toEqual(['qr_bin_lajpat_01', 'qr_bin_far']); // trucks excluded
    expect(body.bins[0].status).toBe('NEEDS_PICKUP');
    expect(body.mapStyle).toBeNull(); // no API key configured in tests
  });
});

describe('POST /v1/collector/location', () => {
  const ping = (claims: any, body: any) => ev(claims, { body: JSON.stringify(body) });

  it('rejects non-collectors and bad coordinates', async () => {
    expect(((await updateLocation(ping(citizen, { latitude: LAT, longitude: LNG }))) as any).statusCode).toBe(403);
    expect(((await updateLocation(ping(collector, { latitude: 'x' }))) as any).statusCode).toBe(400);
  });

  it('stores the live position without inventing bin pickups', async () => {
    routeDdb({ profile: { assignedSourceId: truck.sourceId }, source: truck });
    const res: any = await updateLocation(ping(collector, { latitude: LAT, longitude: LNG, accuracy: 10, speedKmh: 18 }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.territoryId).toBe(CELL);
    expect(body.binsEmptied).toEqual([]);
    const updates = ddb().mock.calls.map(([c]: any) => c.input).filter((i: any) => i.UpdateExpression);
    expect(updates[0].ExpressionAttributeValues[':tid']).toBe(CELL);
    expect(updates.some((u: any) => u.Key.PK === 'QR#qr_bin_lajpat_01' && u.ExpressionAttributeValues[':zero'] === 0)).toBe(false);
    expect(updates.some((u: any) => u.Key.PK === 'QR#qr_bin_far')).toBe(false);
  });

  it('skips pickup detection on an inaccurate fix', async () => {
    routeDdb({ profile: { assignedSourceId: truck.sourceId }, source: truck });
    const res: any = await updateLocation(ping(collector, { latitude: LAT, longitude: LNG, accuracy: 400 }));
    expect(JSON.parse(res.body).binsEmptied).toEqual([]);
  });

  it("refuses another collector's truck", async () => {
    routeDdb({ profile: { assignedSourceId: truck.sourceId }, source: { ...truck, collectorId: 'someone-else' } });
    const res: any = await updateLocation(ping(collector, { latitude: LAT, longitude: LNG }));
    expect(res.statusCode).toBe(403);
  });
});

describe('POST /v1/bins/{id}/report', () => {
  const report = (body: any) => ev(citizen, { pathParameters: { sourceId: nearBin.sourceId }, body: JSON.stringify(body) });

  it('requires the reporter to be near the bin', async () => {
    routeDdb({ bin: nearBin });
    const res: any = await reportBin(report({ issue: 'FULL', latitude: LAT + 0.05, longitude: LNG }));
    expect(res.statusCode).toBe(403);
  });

  it('marks the bin full and limits repeat reports', async () => {
    routeDdb({ bin: nearBin });
    const ok: any = await reportBin(report({ issue: 'FULL', latitude: LAT, longitude: LNG }));
    expect(ok.statusCode).toBe(200);
    expect(JSON.parse(ok.body).status).toBe('NEEDS_PICKUP');

    ddb().mockImplementation(async (cmd: any) => {
      if (cmd.input?.ConditionExpression === 'attribute_not_exists(PK)') throw conditionalFail();
      return { Item: nearBin };
    });
    const again: any = await reportBin(report({ issue: 'FULL', latitude: LAT, longitude: LNG }));
    expect(again.statusCode).toBe(429);
  });

  it('validates the issue type', async () => {
    const res: any = await reportBin(report({ issue: 'SMELLY', latitude: LAT, longitude: LNG }));
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /v1/collector/bins/{id}/emptied', () => {
  const empty = (claims: any, body: any) => ev(claims, { pathParameters: { sourceId: nearBin.sourceId }, body: JSON.stringify(body) });

  it('lets a nearby collector reset the bin', async () => {
    routeDdb({ bin: nearBin });
    const res: any = await emptyBin(empty(collector, { latitude: LAT, longitude: LNG, repaired: true }));
    expect(res.statusCode).toBe(200);
    const upd = ddb().mock.calls.map(([c]: any) => c.input).find((i: any) => i.UpdateExpression);
    expect(upd.UpdateExpression).toContain('REMOVE damagedAt');
  });

  it('rejects citizens and far-away collectors', async () => {
    routeDdb({ bin: nearBin });
    expect(((await emptyBin(empty(citizen, { latitude: LAT, longitude: LNG }))) as any).statusCode).toBe(403);
    expect(((await emptyBin(empty(collector, { latitude: LAT + 0.01, longitude: LNG }))) as any).statusCode).toBe(403);
  });
});

describe('GET /v1/trucks/{id}/trail', () => {
  it('validates the id', async () => {
    const res: any = await getTruckTrail(ev(citizen, { pathParameters: { sourceId: '../etc' } }));
    expect(res.statusCode).toBe(400);
  });
});

describe('Amazon Location geofence events', () => {
  const geofenceEvent = (EventType: 'ENTER' | 'EXIT') =>
    ({ time: '2026-10-11T10:00:00Z', detail: { EventType, GeofenceId: CELL, DeviceId: truck.sourceId, SampleTime: '2026-10-11T10:00:00Z', Position: [LNG, LAT] } }) as any;

  it('records a territory visit on ENTER', async () => {
    ddb().mockResolvedValue({} as any);
    await onGeofenceEvent(geofenceEvent('ENTER'));
    const inputs = ddb().mock.calls.map(([c]: any) => c.input);
    expect(inputs.find((i: any) => i.Key.PK === `TERRITORY#${CELL}`).ExpressionAttributeValues[':truck']).toBe(truck.sourceId);
    expect(inputs.find((i: any) => i.Key.PK === `QR#${truck.sourceId}`).ExpressionAttributeValues[':tid']).toBe(CELL);
  });

  it('ignores an EXIT for a territory the truck already left', async () => {
    ddb().mockRejectedValue(conditionalFail());
    await expect(onGeofenceEvent(geofenceEvent('EXIT'))).resolves.toBeUndefined();
  });

  it('builds closed counter-clockwise [lng, lat] rings', () => {
    const ring = toGeofenceRing(territory.boundary as [number, number][]);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(ring).toContainEqual([77.24, 28.57]); // [lng, lat] order
    expect(ring).toHaveLength(territory.boundary.length + 1);
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    expect(area).toBeGreaterThan(0);
  });
});
