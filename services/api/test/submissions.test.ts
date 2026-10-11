import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { docClient } from '../src/utils/dynamo.js';
import { handler as createSubmission } from '../src/handlers/submissions/createSubmission.js';
import { handler as getSubmission } from '../src/handlers/submissions/getSubmission.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: vi.fn().mockResolvedValue('https://saafsafari-proofs-test.s3.ap-south-1.amazonaws.com/upload?signature=xyz'),
  };
});

vi.mock('../src/utils/s3.js', () => {
  return {
    s3Client: {},
    PROOFS_BUCKET_NAME: 'saafsafari-proofs-test',
  };
});

describe('Submissions Handler (AI-01)', () => {
  const mockSub = 'user-sub-aarav';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEvent = (
    method: string,
    body: any = null,
    pathParams: Record<string, string> = {},
    sub: string | null = mockSub,
  ): APIGatewayProxyEventV2 => {
    const event: any = {
      version: '2.0',
      routeKey: `${method} /v1/submissions`,
      rawPath: '/v1/submissions',
      rawQueryString: '',
      headers: { 'content-type': 'application/json' },
      pathParameters: pathParams,
      requestContext: {
        accountId: '123456789012',
        apiId: 'test-api',
        http: { method, path: '/v1/submissions', protocol: 'HTTP/1.1' },
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

  describe('createSubmission handler', () => {
    it('returns 401 when request is unauthenticated', async () => {
      const event = createEvent('POST', { actionType: 'COMMUNITY_CLEANUP_PROOF', latitude: 28.6, longitude: 77.2 }, {}, null);
      const res: any = await createSubmission(event);
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when GPS coordinates are outside Delhi NCR', async () => {
      // Mumbai coordinates (outside Delhi NCR)
      const event = createEvent('POST', {
        actionType: 'COMMUNITY_CLEANUP_PROOF',
        latitude: 19.076,
        longitude: 72.8777,
      });

      const res: any = await createSubmission(event);
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('LOCATION_OUT_OF_BOUNDS');
    });

    it('successfully generates presigned S3 upload URL and saves initial DynamoDB record', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

      const event = createEvent('POST', {
        actionType: 'COMMUNITY_CLEANUP_PROOF',
        latitude: 28.6328, // Connaught Place
        longitude: 77.2195,
        description: 'Cleaned plastic litter in park',
      });

      const res: any = await createSubmission(event);
      expect(res.statusCode).toBe(201);

      const body = JSON.parse(res.body);
      expect(body.submissionId).toMatch(/^sub_[0-9a-f]{12}$/);
      expect(body.uploadUrl).toContain('amazonaws.com');
      expect(body.s3Key).toContain(`proofs/${mockSub}/`);
      expect(body.expiresAt).toBeDefined();

      // Verify DynamoDB PutCommand call
      const putCall = vi.mocked(docClient.send).mock.calls[0][0] as any;
      expect(putCall.input.Item.PK).toBe(`SUBMISSION#${body.submissionId}`);
      expect(putCall.input.Item.status).toBe('PENDING_UPLOAD');
      expect(putCall.input.Item.actionType).toBe('COMMUNITY_CLEANUP_PROOF');
    });
  });

  describe('getSubmission handler', () => {
    it('returns 404 if submission does not exist', async () => {
      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: undefined } as any);

      const event = createEvent('GET', null, { id: 'sub_nonexistent' });
      const res: any = await getSubmission(event);
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('SUBMISSION_NOT_FOUND');
    });

    it('returns 200 with submission metadata', async () => {
      const mockSubmission = {
        PK: 'SUBMISSION#sub_123456789012',
        SK: 'METADATA',
        submissionId: 'sub_123456789012',
        userId: mockSub,
        actionType: 'COMMUNITY_CLEANUP_PROOF',
        status: 'AUTO_APPROVED',
        s3Key: `proofs/${mockSub}/sub_123456789012.jpg`,
        latitude: 28.6328,
        longitude: 77.2195,
        territoryId: '8760824b4ffffff',
        creditsAwarded: 100,
        xpAwarded: 250,
      };

      vi.mocked(docClient.send).mockResolvedValueOnce({ Item: mockSubmission } as any);

      const event = createEvent('GET', null, { id: 'sub_123456789012' });
      const res: any = await getSubmission(event);

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.submissionId).toBe('sub_123456789012');
      expect(body.status).toBe('AUTO_APPROVED');
      expect(body.creditsAwarded).toBe(100);
      expect(body.PK).toBeUndefined(); // internal keys stripped
    });
  });
});
