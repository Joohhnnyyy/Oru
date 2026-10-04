import { describe, it, expect, vi, beforeEach } from 'vitest';
import { docClient } from '../src/utils/dynamo.js';
import {
  handler as evaluateSubmission,
  rekognitionClient,
  bedrockClient,
} from '../src/handlers/submissions/evaluateSubmission.js';

vi.mock('../src/utils/dynamo.js', () => {
  return {
    docClient: {
      send: vi.fn(),
    },
    TABLE_NAME: 'SaafSafariMainTest',
  };
});

describe('AI Photo Verification Pipeline (AI-02 & AI-03)', () => {
  const mockSubmissionId = 'sub_9876543210ab';
  const mockUserId = 'usr_citizen_delhi';
  const mockTerritory = '8760824b4ffffff';

  const baseSubmission = {
    PK: `SUBMISSION#${mockSubmissionId}`,
    SK: 'METADATA',
    submissionId: mockSubmissionId,
    userId: mockUserId,
    actionType: 'COMMUNITY_CLEANUP_PROOF',
    territoryId: mockTerritory,
    s3Key: `proofs/${mockUserId}/${mockSubmissionId}.jpg`,
    status: 'PENDING_UPLOAD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects submission immediately if Rekognition detects moderation flags', async () => {
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: baseSubmission } as any);

    // Mock Rekognition moderation returning inappropriate flags
    vi.spyOn(rekognitionClient, 'send').mockResolvedValueOnce({
      ModerationLabels: [{ Name: 'Explicit Nudity', Confidence: 95 }],
    } as any);

    // Mock DynamoDB update
    vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission({
      submissionId: mockSubmissionId,
      s3Bucket: 'saafsafari-proofs-test',
      s3Key: baseSubmission.s3Key,
    });

    expect(result.status).toBe('REJECTED');
    expect(result.confidenceScore).toBe(0);

    const updateCall = vi.mocked(docClient.send).mock.calls[1][0] as any;
    expect(updateCall.input.ExpressionAttributeValues[':rejected']).toBe('REJECTED');
  });

  it('auto-approves high-confidence genuine proof and awards credits atomically', async () => {
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: baseSubmission } as any);

    // 1. Rekognition moderation passes
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any) // moderation
      .mockResolvedValueOnce({
        Labels: [{ Name: 'Waste' }, { Name: 'Garbage' }, { Name: 'Park' }],
      } as any); // labels

    // 2. Bedrock Nova Lite returns high confidence
    const mockBedrockResponse = {
      output: {
        message: {
          content: [
            {
              text: JSON.stringify({
                isGenuine: true,
                confidenceScore: 0.88,
                reasoning: 'Clear evidence of community litter collection into waste bags.',
              }),
            },
          ],
        },
      },
    };

    vi.spyOn(bedrockClient, 'send').mockResolvedValueOnce({
      body: new TextEncoder().encode(JSON.stringify(mockBedrockResponse)),
    } as any);

    // 3. DynamoDB TransactWriteCommand succeeds
    vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission({
      submissionId: mockSubmissionId,
      s3Bucket: 'saafsafari-proofs-test',
      s3Key: baseSubmission.s3Key,
    });

    expect(result.status).toBe('AUTO_APPROVED');
    expect(result.confidenceScore).toBe(0.88);
    expect(result.creditsAwarded).toBeGreaterThan(0);
    expect(result.xpAwarded).toBeGreaterThan(0);

    // Verify TransactWriteItems call
    const txCall = vi.mocked(docClient.send).mock.calls[1][0] as any;
    expect(txCall.input.TransactItems).toHaveLength(4); // submission update, user balance, ledger entry, territory health
  });

  it('flags borderline submissions for human municipal review with taskToken', async () => {
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: baseSubmission } as any);

    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Plant' }, { Name: 'Ground' }] } as any);

    const mockBedrockResponse = {
      output: {
        message: {
          content: [
            {
              text: JSON.stringify({
                isGenuine: true,
                confidenceScore: 0.52,
                reasoning: 'Borderline proof: bags visible but cleanup activity partially obscured.',
              }),
            },
          ],
        },
      },
    };

    vi.spyOn(bedrockClient, 'send').mockResolvedValueOnce({
      body: new TextEncoder().encode(JSON.stringify(mockBedrockResponse)),
    } as any);

    vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission({
      submissionId: mockSubmissionId,
      s3Bucket: 'saafsafari-proofs-test',
      s3Key: baseSubmission.s3Key,
      taskToken: 'AAAA-task-token-1234',
    });

    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(result.confidenceScore).toBe(0.52);

    const updateCall = vi.mocked(docClient.send).mock.calls[1][0] as any;
    expect(updateCall.input.ExpressionAttributeValues[':flagged']).toBe('FLAGGED_FOR_REVIEW');
    expect(updateCall.input.ExpressionAttributeValues[':token']).toBe('AAAA-task-token-1234');
  });

  it('rejects submissions with low confidence or non-genuine images', async () => {
    vi.mocked(docClient.send).mockResolvedValueOnce({ Item: baseSubmission } as any);

    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Car' }, { Name: 'Highway' }] } as any);

    const mockBedrockResponse = {
      output: {
        message: {
          content: [
            {
              text: JSON.stringify({
                isGenuine: false,
                confidenceScore: 0.15,
                reasoning: 'Irrelevant image showing traffic with zero civic waste activity.',
              }),
            },
          ],
        },
      },
    };

    vi.spyOn(bedrockClient, 'send').mockResolvedValueOnce({
      body: new TextEncoder().encode(JSON.stringify(mockBedrockResponse)),
    } as any);

    vi.mocked(docClient.send).mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission({
      submissionId: mockSubmissionId,
      s3Bucket: 'saafsafari-proofs-test',
      s3Key: baseSubmission.s3Key,
    });

    expect(result.status).toBe('REJECTED');
    expect(result.confidenceScore).toBe(0.15);
  });
});
