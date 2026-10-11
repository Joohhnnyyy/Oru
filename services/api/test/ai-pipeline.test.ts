import { describe, it, expect, vi, beforeEach } from 'vitest';
import { docClient } from '../src/utils/dynamo.js';
import { s3Client } from '../src/utils/s3.js';
import {
  handler as evaluateSubmission,
  rekognitionClient,
  secretsClient,
  submissionIdFromKey,
} from '../src/handlers/submissions/evaluateSubmission.js';

vi.mock('../src/utils/dynamo.js', () => ({
  docClient: { send: vi.fn() },
  TABLE_NAME: 'SaafSafariMainTest',
}));

describe('AI Photo Verification Pipeline (AI-02 & AI-03)', () => {
  const mockSubmissionId = 'sub_9876543210ab';
  const mockUserId = 'usr_citizen_delhi';
  const mockTerritory = '8760824b4ffffff';
  const s3Key = `proofs/${mockUserId}/${mockSubmissionId}.jpg`;
  const input = { s3Bucket: 'saafsafari-proofs-test', s3Key };

  const baseSubmission = {
    PK: `SUBMISSION#${mockSubmissionId}`,
    SK: 'METADATA',
    submissionId: mockSubmissionId,
    userId: mockUserId,
    actionType: 'COMMUNITY_CLEANUP_PROOF',
    territoryId: mockTerritory,
    s3Key,
    status: 'PENDING_UPLOAD',
  };
  const photoBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);

  const groqSays = (verdict: { isGenuine: boolean; confidenceScore: number; reasoning: string }) =>
    new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(verdict) } }] }), {status: 200});

  const ddb = () => vi.mocked(docClient.send);
  const conditionalFail = () => Object.assign(new Error('conditional'), { name: 'ConditionalCheckFailedException' });

  beforeEach(() => {
    vi.restoreAllMocks();
    ddb().mockReset();
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(secretsClient, 'send').mockResolvedValue({ SecretString: 'test-only-key' } as any);
    vi.spyOn(s3Client, 'send').mockResolvedValue({
      ContentLength: photoBytes.length,
      Body: { transformToByteArray: async () => photoBytes },
    } as any);
  });

  /** Queue: get submission → put image hash (unique) */
  const queueSubmissionAndHash = (submission: any = baseSubmission) => {
    ddb().mockResolvedValueOnce({ Item: submission } as any); // GetCommand submission
    ddb().mockResolvedValueOnce({} as any); // PutCommand IMGHASH (first time)
  };

  it('derives the submission id from the S3 key (EventBridge-started executions)', () => {
    expect(submissionIdFromKey(s3Key)).toBe(mockSubmissionId);
    expect(submissionIdFromKey('proofs/x/not-a-sub.png')).toBeUndefined();
  });

  it('rejects immediately if Rekognition detects moderation flags', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send').mockResolvedValueOnce({
      ModerationLabels: [{ Name: 'Explicit Nudity', Confidence: 95 }],
    } as any);
    ddb().mockResolvedValueOnce({} as any); // status update

    const result = await evaluateSubmission(input);

    expect(result.status).toBe('REJECTED');
    expect(result.confidenceScore).toBe(0);
    const update = ddb().mock.calls[2][0] as any;
    expect(update.input.ExpressionAttributeValues[':status']).toBe('REJECTED');
    expect(update.input.ConditionExpression).toBe('#status = :pending'); // only the first evaluation counts
  });

  it('auto-approves high-confidence genuine proof: Groq sees the photo, credits are capped per day', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Waste' }, { Name: 'Garbage' }, { Name: 'Park' }] } as any);
    const groqSpy = vi.mocked(fetch)
      .mockResolvedValueOnce(groqSays({ isGenuine: true, confidenceScore: 0.88, reasoning: 'Bagged litter, cleaned spot.' }));
    ddb().mockResolvedValueOnce({ Item: { PK: `USER#${mockUserId}`, streakDays: 5 } } as any); // user
    ddb().mockResolvedValueOnce({ Item: { PK: `TERRITORY#${mockTerritory}`, health: 25 } } as any); // territory
    ddb().mockResolvedValueOnce({} as any); // TransactWrite
    ddb().mockResolvedValue({} as any); // health clamp writes

    const result = await evaluateSubmission(input);

    expect(result.status).toBe('AUTO_APPROVED');
    expect(result.confidenceScore).toBe(0.88);
    expect(result.creditsAwarded).toBeGreaterThan(0);
    expect(result.creditsAwarded).toBeLessThan(60); // photo proof never out-earns verified QR actions by much

    // The image bytes go to Groq, with the credential in a header rather than the URL.
    const [url, request] = groqSpy.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(JSON.parse(request?.body as string).model).toBe('qwen/qwen3.8-27b');
    expect(url).not.toContain('test-only-key');
    const body = JSON.parse(request?.body as string);
    expect(body.messages[0].content[1].image_url.url).toBe('data:image/jpeg;base64,' + Buffer.from(photoBytes).toString('base64'));
    expect(request?.headers).toMatchObject({ Authorization: 'Bearer test-only-key' });

    const tx = ddb().mock.calls[4][0] as any;
    const items = tx.input.TransactItems;
    expect(items).toHaveLength(5); // submission, daily cap, balance, ledger, territory
    expect(items[0].Update.ConditionExpression).toBe('#status = :pending');
    expect(items[1].Update.Key.SK).toMatch(/^PHOTO_LIMIT#/);
    expect(items[3].Put.Item.SK).toMatch(/^LEDGER#/);
  });

  it('flags borderline submissions for human review', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Plant' }] } as any);
    vi.mocked(fetch).mockResolvedValueOnce(
      groqSays({ isGenuine: true, confidenceScore: 0.52, reasoning: 'Bags visible but activity unclear.' }),
    );
    ddb().mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission(input);

    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(result.confidenceScore).toBe(0.52);
    const update = ddb().mock.calls[2][0] as any;
    expect(update.input.ExpressionAttributeValues[':gsi2pk']).toBe('STATUS#FLAGGED_FOR_REVIEW');
  });

  it('rejects low-confidence or non-genuine images', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Car' }] } as any);
    vi.mocked(fetch).mockResolvedValueOnce(
      groqSays({ isGenuine: false, confidenceScore: 0.15, reasoning: 'Traffic photo, no waste activity.' }),
    );
    ddb().mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission(input);
    expect(result.status).toBe('REJECTED');
    expect(result.confidenceScore).toBe(0.15);
  });

  it('FAILS CLOSED: a Rekognition error sends the photo to human review, never auto-approves', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send').mockRejectedValueOnce(new Error('AccessDenied'));
    const groqSpy = vi.mocked(fetch);
    ddb().mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission(input);

    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(groqSpy).not.toHaveBeenCalled();
    expect(ddb()).toHaveBeenCalledTimes(3); // get, hash, status update — no credit transaction
  });

  it('FAILS CLOSED: a Groq error sends the photo to human review', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Waste' }, { Name: 'Trash' }] } as any);
    vi.mocked(fetch).mockRejectedValueOnce(new Error('ThrottlingException'));
    ddb().mockResolvedValueOnce({} as any);

    const result = await evaluateSubmission(input);
    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(ddb()).toHaveBeenCalledTimes(3);
  });

  it('rejects a photo that was already submitted (SHA-256 dedupe)', async () => {
    ddb().mockResolvedValueOnce({ Item: baseSubmission } as any);
    ddb().mockRejectedValueOnce(conditionalFail()); // IMGHASH already exists
    ddb().mockResolvedValueOnce({} as any);
    const rekSpy = vi.spyOn(rekognitionClient, 'send');

    const result = await evaluateSubmission(input);
    expect(result.status).toBe('REJECTED');
    expect(result.reasoning).toMatch(/already submitted/);
    expect(rekSpy).not.toHaveBeenCalled();
  });

  it.each([
    new Response('unavailable', { status: 429 }),
    new Response(JSON.stringify({ choices: [{ finish_reason: 'length', message: { content: '{"isGenuine":true,"confidenceScore":0.99,"reasoning":"Incomplete"}' } }] })),
    new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: '{"isGenuine":true,"confidenceScore":2,"reasoning":"Invalid score"}' } }] })),
  ])('sends unavailable or invalid Groq decisions to review without rewarding', async (response) => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [] } as any);
    vi.mocked(fetch).mockImplementation(async () => response.clone());
    ddb().mockResolvedValueOnce({} as any);
    expect((await evaluateSubmission(input)).status).toBe('FLAGGED_FOR_REVIEW');
    expect(ddb()).toHaveBeenCalledTimes(3);
  });

  it('is idempotent: an already-evaluated submission is not re-scored or re-paid', async () => {
    ddb().mockResolvedValueOnce({ Item: { ...baseSubmission, status: 'AUTO_APPROVED' } } as any);
    const s3Spy = vi.mocked(s3Client.send);

    const result = await evaluateSubmission(input);
    expect(result.status).toBe('AUTO_APPROVED');
    expect(s3Spy).not.toHaveBeenCalled();
    expect(ddb()).toHaveBeenCalledTimes(1);
  });

  it('routes to human review once the daily auto-approval cap is reached', async () => {
    queueSubmissionAndHash();
    vi.spyOn(rekognitionClient, 'send')
      .mockResolvedValueOnce({ ModerationLabels: [] } as any)
      .mockResolvedValueOnce({ Labels: [{ Name: 'Waste' }] } as any);
    vi.mocked(fetch).mockResolvedValueOnce(
      groqSays({ isGenuine: true, confidenceScore: 0.9, reasoning: 'Clear cleanup.' }),
    );
    ddb().mockResolvedValueOnce({ Item: { streakDays: 0 } } as any);
    ddb().mockResolvedValueOnce({ Item: { health: 60 } } as any);
    ddb().mockRejectedValueOnce(
      Object.assign(new Error('cancelled'), {
        name: 'TransactionCanceledException',
        CancellationReasons: [{ Code: 'None' }, { Code: 'ConditionalCheckFailed' }],
      }),
    );
    ddb().mockResolvedValueOnce({} as any); // status update to FLAGGED

    const result = await evaluateSubmission(input);
    expect(result.status).toBe('FLAGGED_FOR_REVIEW');
    expect(result.reasoning).toMatch(/Daily auto-approval limit/);
  });
});
