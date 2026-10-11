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

// Mock Step Functions client
const mockSfnSend = vi.fn();
vi.mock('@aws-sdk/client-sfn', () => ({
  SFNClient: vi.fn().mockImplementation(() => ({
    send: (...args: any[]) => mockSfnSend(...args),
  })),
  SendTaskSuccessCommand: vi.fn().mockImplementation((input) => ({ input })),
}));

import { evaluateCedarPolicy } from '../src/utils/cedar.js';
import { handler as getTerritoryOverviewHandler } from '../src/handlers/admin/getTerritoryOverview.js';
import { handler as manageQrSourcesHandler } from '../src/handlers/admin/manageQrSources.js';
import { handler as getReviewQueueHandler } from '../src/handlers/admin/getReviewQueue.js';
import { handler as resolveReviewQueueHandler } from '../src/handlers/admin/resolveReviewQueue.js';

describe('Municipal Admin Console & Cedar Authorization (ADM-01, ADM-02, ADM-03)', () => {
  const adminClaims = {
    sub: 'adm_ward123456',
    'cognito:groups': ['ward_admin'],
  };

  const citizenClaims = {
    sub: 'usr_citizen123',
    'cognito:groups': ['citizen'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cedar Authorization Policy (DEC-09)', () => {
    it('denies access when authentication claims are missing', () => {
      const decision = evaluateCedarPolicy({
        claims: undefined,
        action: 'viewTerritoryOverview',
      });
      expect(decision.decision).toBe('DENY');
    });

    it('denies access to citizens lacking ward_admin role', () => {
      const decision = evaluateCedarPolicy({
        claims: citizenClaims,
        action: 'viewTerritoryOverview',
      });
      expect(decision.decision).toBe('DENY');
      expect(decision.reason).toContain('ward_admin');
    });

    it('allows access to ward_admin for permitted actions', () => {
      const decision = evaluateCedarPolicy({
        claims: adminClaims,
        action: 'viewTerritoryOverview',
      });
      expect(decision.decision).toBe('ALLOW');
    });

    it('denies access if ward tenancy boundary is violated', () => {
      const scopedAdminClaims = {
        sub: 'adm_ward1',
        'cognito:groups': ['ward_admin'],
        'custom:assigned_ward': '8728308281fffff',
      };
      const decision = evaluateCedarPolicy({
        claims: scopedAdminClaims,
        action: 'manageQrSources',
        resource: '8728308282fffff', // different ward
      });
      expect(decision.decision).toBe('DENY');
      expect(decision.reason).toContain('scoped to ward');
    });
  });

  describe('getTerritoryOverview handler (ADM-01)', () => {
    it('returns 403 Forbidden for non-admin citizens', async () => {
      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          authorizer: {
            jwt: { claims: citizenClaims, scopes: [] },
          },
        } as any,
      };

      const res: any = await getTerritoryOverviewHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(403);
    });

    it('returns territory health metrics and hotspot counts for ward admin', async () => {
      // Mock territory scan
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'TERRITORY#8728308281fffff',
            SK: 'METADATA',
            territoryId: '8728308281fffff',
            name: 'Connaught Place',
            health: 80,
            moodState: 'thriving',
          },
          {
            PK: 'TERRITORY#8728308282fffff',
            SK: 'METADATA',
            territoryId: '8728308282fffff',
            name: 'Chandni Chowk',
            health: 60,
            moodState: 'recovering',
          },
        ],
      });

      // Mock open hotspots query
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'HOTSPOT#h1',
            territoryId: '8728308281fffff',
            status: 'OPEN',
          },
          {
            PK: 'HOTSPOT#h2',
            territoryId: '8728308281fffff',
            status: 'OPEN',
          },
        ],
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
      };

      const res: any = await getTerritoryOverviewHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.totalTerritories).toBe(2);
      expect(body.averageHealth).toBe(70);
      expect(body.totalActiveHotspots).toBe(2);
      expect(body.moodDistribution.thriving).toBe(1);
      expect(body.moodDistribution.recovering).toBe(1);

      // Territory 1 has 2 hotspots
      expect(body.territories[0].activeHotspotsCount).toBe(2);
      // Territory 2 has 0 hotspots
      expect(body.territories[1].activeHotspotsCount).toBe(0);
    });
  });

  describe('manageQrSources handler (ADM-02)', () => {
    it('returns 403 Forbidden for non-admin users', async () => {
      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          http: { method: 'POST' } as any,
          authorizer: {
            jwt: { claims: citizenClaims, scopes: [] },
          },
        } as any,
      };

      const res: any = await manageQrSourcesHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(403);
    });

    it('creates a new QR source with printable payload', async () => {
      mockSend.mockResolvedValueOnce({});

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          http: { method: 'POST' } as any,
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
        body: JSON.stringify({
          type: 'dustbin_static',
          name: 'Janpath Smart Bin 04',
          territoryId: '8728308281fffff',
          latitude: 28.6200,
          longitude: 77.2180,
          radiusMeters: 75,
        }),
      };

      const res: any = await manageQrSourcesHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(201);

      const body = JSON.parse(res.body);
      expect(body.qrId).toMatch(/^qr_[0-9a-f]{12}$/);
      expect(body.type).toBe('dustbin_static');
      expect(body.name).toBe('Janpath Smart Bin 04');
      expect(body.qrPayload).toContain(body.qrId);

      // Verify DynamoDB PutCommand
      expect(mockSend).toHaveBeenCalledTimes(1);
      const putItem = mockSend.mock.calls[0][0].input.Item;
      expect(putItem.PK).toBe(`QR#${body.qrId}`);
      expect(putItem.SK).toBe('METADATA');
      expect(putItem.geofenceRadiusMeters).toBe(75);
    });

    it('lists registered QR sources', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'QR#qr_112233445566',
            SK: 'METADATA',
            sourceId: 'qr_112233445566',
            type: 'dustbin_static',
            name: 'Central Park Bin',
            h3TerritoryId: '8728308281fffff',
            latitude: 28.6139,
            longitude: 77.2090,
            geofenceRadiusMeters: 75,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          http: { method: 'GET' } as any,
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
      };

      const res: any = await manageQrSourcesHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.count).toBe(1);
      expect(body.qrSources[0].qrId).toBe('qr_112233445566');
    });
  });

  describe('getReviewQueue & resolveReviewQueue handlers (ADM-03)', () => {
    it('getReviewQueue returns flagged submissions for review', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            PK: 'SUBMISSION#sub_123456789012',
            SK: 'METADATA',
            submissionId: 'sub_123456789012',
            userId: 'usr_citizen1',
            territoryId: '8728308281fffff',
            actionType: 'SEGREGATED_DISPOSAL',
            s3Key: 'proofs/usr_citizen1/sub_123456789012.jpg',
            aiEvaluation: {
              confidenceScore: 65,
              moderationFlags: [],
              bedrockReasoning: 'Borderline segregation quality: wet waste visible with loose dry plastics.',
            },
            taskToken: 'AAAA-task-token-1234',
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
      };

      const res: any = await getReviewQueueHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.count).toBe(1);
      expect(body.reviewQueue[0].submissionId).toBe('sub_123456789012');
      expect(body.reviewQueue[0].taskToken).toBe('AAAA-task-token-1234');
    });

    it('resolveReviewQueue approves submission, credits user, and signals Step Functions task token', async () => {
      // 1. Mock Get submission
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'SUBMISSION#sub_123456789012',
          SK: 'METADATA',
          submissionId: 'sub_123456789012',
          userId: 'usr_citizen1',
          territoryId: '8728308281fffff',
          status: 'FLAGGED_FOR_REVIEW',
          actionType: 'COMMUNITY_CLEANUP_PROOF',
          taskToken: 'AAAA-task-token-1234',
        },
      });

      // 2. Mock Get citizen profile
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'USER#usr_citizen1',
          SK: 'PROFILE',
          balanceGC: 150,
          lifetimeXP: 600,
          currentTier: 'ANKUR',
        },
      });

      // 3. Mock TransactWriteItems
      mockSend.mockResolvedValueOnce({});

      // 4. Mock SFN task token callback
      mockSfnSend.mockResolvedValueOnce({});

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
        body: JSON.stringify({
          submissionId: 'sub_123456789012',
          decision: 'APPROVE',
          reason: 'Verified by municipal officer: Segregation acceptable.',
          awardedGC: 100,
          awardedXP: 250,
        }),
      };

      const res: any = await resolveReviewQueueHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.decision).toBe('APPROVE');
      expect(body.awardedGC).toBe(100);
      expect(body.awardedXP).toBe(250);
      expect(body.resolvedBy).toBe(adminClaims.sub);

      // Verify TransactWriteItems call
      const transactCall = mockSend.mock.calls[2][0];
      const items = transactCall.input.TransactItems;
      expect(items).toHaveLength(4);

      // Item 0: Update submission to ADMIN_APPROVED
      expect(items[0].Update.ExpressionAttributeValues[':status']).toBe('ADMIN_APPROVED');

      // Item 1: Credit user balance and XP
      expect(items[1].Update.ExpressionAttributeValues[':gc']).toBe(100);
      expect(items[1].Update.ExpressionAttributeValues[':xp']).toBe(250); // atomic add, no read-modify-write

      // Item 0 is conditional on the submission still awaiting review (no double payout)
      expect(items[0].Update.ConditionExpression).toBe('#st = :flagged');

      // Item 2: Ledger entry uses the same schema as every other credit
      expect(items[2].Put.Item.PK).toBe('USER#usr_citizen1');
      expect(items[2].Put.Item.SK).toMatch(/^LEDGER#/);
      expect(items[2].Put.Item.creditsEarned).toBe(100);
      expect(items[2].Put.Item.actionType).toBe('COMMUNITY_CLEANUP_PROOF');

      // Item 3: Bump territory health (+2)
      expect(items[3].Update.ExpressionAttributeValues[':healthGain']).toBe(2);

      // Verify Step Functions task token callback was sent
      expect(mockSfnSend).toHaveBeenCalledTimes(1);
      const sfnCall = mockSfnSend.mock.calls[0][0];
      expect(sfnCall.input.taskToken).toBe('AAAA-task-token-1234');
    });

    it('resolveReviewQueue rejects submission with admin reason', async () => {
      // 1. Mock Get submission
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'SUBMISSION#sub_reject999',
          SK: 'METADATA',
          submissionId: 'sub_reject999',
          userId: 'usr_citizen1',
          territoryId: '8728308281fffff',
          status: 'FLAGGED_FOR_REVIEW',
          taskToken: 'BBBB-task-token-5678',
        },
      });

      // 2. Mock UpdateCommand for rejection
      mockSend.mockResolvedValueOnce({});

      // 3. Mock SFN task token callback
      mockSfnSend.mockResolvedValueOnce({});

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: {
          authorizer: {
            jwt: { claims: adminClaims, scopes: [] },
          },
        } as any,
        body: JSON.stringify({
          submissionId: 'sub_reject999',
          decision: 'REJECT',
          reason: 'Photo is blurry and does not display waste bin segregation.',
        }),
      };

      const res: any = await resolveReviewQueueHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.body);
      expect(body.decision).toBe('REJECT');
      expect(body.awardedGC).toBe(0);

      // Verify UpdateCommand called with REJECTED
      const updateCall = mockSend.mock.calls[1][0];
      expect(updateCall.input.ExpressionAttributeValues[':status']).toBe('REJECTED');
      expect(updateCall.input.ExpressionAttributeValues[':reason']).toContain('blurry');

      // Verify SFN task token was signaled
      expect(mockSfnSend).toHaveBeenCalledTimes(1);
    });

    it('resolveReviewQueue refuses to pay twice for an already-resolved submission', async () => {
      mockSend.mockResolvedValueOnce({
        Item: {
          PK: 'SUBMISSION#sub_done',
          SK: 'METADATA',
          submissionId: 'sub_done',
          userId: 'usr_citizen1',
          territoryId: '8728308281fffff',
          status: 'ADMIN_APPROVED',
        },
      });

      const event: Partial<APIGatewayProxyEventV2> = {
        requestContext: { authorizer: { jwt: { claims: adminClaims, scopes: [] } } } as any,
        body: JSON.stringify({ submissionId: 'sub_done', decision: 'APPROVE', reason: 'Approving again' }),
      };

      const res: any = await resolveReviewQueueHandler(event as APIGatewayProxyEventV2);
      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res.body).error.code).toBe('ALREADY_RESOLVED');
      expect(mockSend).toHaveBeenCalledTimes(1); // no write attempted
    });
  });
});
