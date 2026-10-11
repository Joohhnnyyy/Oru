import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { verifyRotatingQrToken } from '../src/utils/hmac.js';
import { istDayString } from '../src/utils/territory.js';
import { handler as getSubmission } from '../src/handlers/submissions/getSubmission.js';
import { handler as completeOnboarding } from '../src/handlers/onboarding/completeOnboarding.js';
import { handler as updateMe } from '../src/handlers/me/updateMe.js';
import { handler as getQrToken } from '../src/handlers/collector/getQrToken.js';

vi.mock('../src/utils/dynamo.js', () => ({
  docClient: { send: vi.fn() },
  TABLE_NAME: 'SaafSafariMainTest',
}));
vi.mock('@aws-sdk/client-location', () => ({
  LocationClient: vi.fn().mockImplementation(() => ({ send: vi.fn().mockResolvedValue({}) })),
  BatchUpdateDevicePositionCommand: vi.fn(),
}));

const ddb = () => vi.mocked(docClient.send);
const event = (claims: Record<string, any> | null, extra: Partial<any> = {}): APIGatewayProxyEventV2 =>
  ({
    requestContext: { http: { method: 'GET' }, authorizer: claims ? { jwt: { claims } } : undefined },
    ...extra,
  }) as any;
const conditionalFail = () => Object.assign(new Error('conditional'), { name: 'ConditionalCheckFailedException' });

beforeEach(() => ddb().mockReset());

describe('GET /v1/submissions/{id}: ownership (IDOR fix)', () => {
  const item = { PK: 'SUBMISSION#sub_1', SK: 'METADATA', submissionId: 'sub_1', userId: 'owner', taskToken: 'secret-token' };

  it("returns 404 for someone else's submission", async () => {
    ddb().mockResolvedValueOnce({ Item: item } as any);
    const res: any = await getSubmission(event({ sub: 'intruder' }, { pathParameters: { id: 'sub_1' } }));
    expect(res.statusCode).toBe(404);
  });

  it('returns the owner their submission without the Step Functions task token', async () => {
    ddb().mockResolvedValueOnce({ Item: item } as any);
    const res: any = await getSubmission(event({ sub: 'owner' }, { pathParameters: { id: 'sub_1' } }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).taskToken).toBeUndefined();
  });

  it('lets a ward admin read any submission', async () => {
    ddb().mockResolvedValueOnce({ Item: item } as any);
    const res: any = await getSubmission(
      event({ sub: 'officer', 'cognito:groups': '[ward_admin]' }, { pathParameters: { id: 'sub_1' } }),
    );
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /v1/onboarding: never wipes an existing profile', () => {
  it('returns the existing profile (200) instead of overwriting balance/XP', async () => {
    ddb().mockRejectedValueOnce(conditionalFail()); // PutCommand with attribute_not_exists
    ddb().mockResolvedValueOnce({ Item: { PK: 'USER#u1', SK: 'PROFILE', userId: 'u1', balanceGC: 420 } } as any);
    const res: any = await completeOnboarding(
      event({ sub: 'u1', email: 'u1@x.in' }, { body: JSON.stringify({ language: 'en', latitude: 28.6, longitude: 77.2 }) }),
    );
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).balanceGC).toBe(420);
    expect((ddb().mock.calls[0][0] as any).input.ConditionExpression).toBe('attribute_not_exists(PK)');
  });
});

describe('PATCH /v1/me: no ghost profiles', () => {
  it('returns 404 for a user who has not onboarded', async () => {
    ddb().mockRejectedValueOnce(conditionalFail());
    const res: any = await updateMe(event({ sub: 'new-user' }, { body: JSON.stringify({ language: 'hi' }) }));
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /v1/collector/qr-token: server-issued rotating QR', () => {
  const source = { sourceId: 'qr_truck_vehicle_01', type: 'truck_rotating', name: 'Truck 1', secretKey: 'k'.repeat(64), collectorId: 'col-1' };

  it('is only available to collectors', async () => {
    const res: any = await getQrToken(event({ sub: 'citizen', 'cognito:groups': ['citizen'] }));
    expect(res.statusCode).toBe(403);
  });

  it('issues a token the scan endpoint accepts, and records the live position', async () => {
    ddb().mockResolvedValueOnce({ Item: { assignedSourceId: 'qr_truck_vehicle_01' } } as any); // profile
    ddb().mockResolvedValueOnce({ Item: source } as any); // QR source
    ddb().mockResolvedValueOnce({} as any); // live position update

    const res: any = await getQrToken(
      event({ sub: 'col-1', 'cognito:groups': ['collector'] }, { queryStringParameters: { lat: '28.61', lng: '77.21' } }),
    );
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(JSON.parse(body.qrPayload)).toEqual({ v: 1, sourceId: 'qr_truck_vehicle_01', token: body.token });
    expect(verifyRotatingQrToken(source.secretKey, source.sourceId, body.token).valid).toBe(true);
    expect(JSON.stringify(body)).not.toContain(source.secretKey); // secret never leaves AWS

    const update = (ddb().mock.calls[2][0] as any).input;
    expect(update.ExpressionAttributeValues[':lat']).toBe(28.61);
  });

  it("refuses another collector's truck", async () => {
    ddb().mockResolvedValueOnce({ Item: { assignedSourceId: 'qr_truck_vehicle_01' } } as any);
    ddb().mockResolvedValueOnce({ Item: source } as any);
    const res: any = await getQrToken(event({ sub: 'col-2', 'cognito:groups': ['collector'] }));
    expect(res.statusCode).toBe(403);
  });
});

describe('IST streak day (3 AM cutoff)', () => {
  it('counts 1:30 AM IST as the previous day and 3:30 AM IST as the new day', () => {
    // 1:30 AM IST on 12 Oct = 20:00 UTC on 11 Oct
    expect(istDayString(new Date('2026-10-11T20:00:00Z'))).toBe('2026-10-11');
    // 3:30 AM IST on 12 Oct = 22:00 UTC on 11 Oct
    expect(istDayString(new Date('2026-10-11T22:00:00Z'))).toBe('2026-10-12');
  });
});
