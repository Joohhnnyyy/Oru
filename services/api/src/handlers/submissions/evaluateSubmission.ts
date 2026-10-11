import * as crypto from 'crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { RekognitionClient, DetectModerationLabelsCommand, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { GetCommand, PutCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { calculateRewards, CivicActionType } from '@saafsafari/game-rules';
import { AiEvaluationResult } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { s3Client } from '../../utils/s3.js';
import { clampTerritoryHealth, istDayString, ledgerSortKey } from '../../utils/territory.js';

const REGION = process.env.AWS_REGION || 'ap-south-1';
export const rekognitionClient = new RekognitionClient({ region: REGION });
export const bedrockClient = new BedrockRuntimeClient({ region: REGION });

/** Nova Lite through the APAC cross-region inference profile (works from ap-south-1). */
const NOVA_MODEL_ID = process.env.NOVA_MODEL_ID || 'apac.amazon.nova-lite-v1:0';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUTO_APPROVALS_PER_DAY = 3;
const AUTO_APPROVE_THRESHOLD = 0.75;
const REVIEW_THRESHOLD = 0.35;

export interface EvaluateSubmissionInput {
  submissionId?: string; // derived from the S3 key when started by the S3 → EventBridge rule
  s3Bucket: string;
  s3Key: string;
}

export interface EvaluateSubmissionOutput {
  submissionId: string;
  status: 'AUTO_APPROVED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED';
  confidenceScore: number;
  reasoning: string;
  creditsAwarded?: number;
  xpAwarded?: number;
}

type Decision = EvaluateSubmissionOutput['status'];

/** proofs/<userId>/<submissionId>.jpg → <submissionId> */
export function submissionIdFromKey(key: string): string | undefined {
  const match = /^proofs\/[^/]+\/(sub_[A-Za-z0-9]+)\.jpg$/.exec(decodeURIComponent(key));
  return match?.[1];
}

async function setStatus(
  submissionId: string,
  status: Decision,
  aiEvaluation: AiEvaluationResult,
  nowIso: string,
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `SUBMISSION#${submissionId}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :status, aiEvaluation = :ai, updatedAt = :now, GSI2PK = :gsi2pk, GSI2SK = :now',
      // Only the first evaluation counts (Step Functions retries / duplicate S3 events)
      ConditionExpression: '#status = :pending',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':ai': aiEvaluation,
        ':now': nowIso,
        ':gsi2pk': `STATUS#${status}`,
        ':pending': 'PENDING_UPLOAD',
      },
    }),
  );
}

export const handler = async (input: EvaluateSubmissionInput): Promise<EvaluateSubmissionOutput> => {
  const { s3Bucket, s3Key } = input;
  const submissionId = input.submissionId || submissionIdFromKey(s3Key);
  if (!submissionId) throw new Error(`Cannot derive submissionId from key '${s3Key}'`);

  const nowIso = new Date().toISOString();

  // 1. Load submission; skip if it was already evaluated (idempotent)
  const submission = (
    await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `SUBMISSION#${submissionId}`, SK: 'METADATA' } }))
  ).Item;
  if (!submission) throw new Error(`Submission '${submissionId}' not found.`);
  if (submission.status !== 'PENDING_UPLOAD') {
    return {
      submissionId,
      status: submission.status === 'REJECTED' ? 'REJECTED' : submission.status === 'AUTO_APPROVED' ? 'AUTO_APPROVED' : 'FLAGGED_FOR_REVIEW',
      confidenceScore: submission.aiEvaluation?.confidenceScore ?? 0,
      reasoning: 'Already evaluated.',
    };
  }
  const userId: string = submission.userId;
  const territoryId: string = submission.territoryId;
  const actionType: CivicActionType = submission.actionType || 'COMMUNITY_CLEANUP_PROOF';

  const finish = async (
    status: Decision,
    confidenceScore: number,
    reasoning: string,
    extra: Partial<AiEvaluationResult> = {},
  ): Promise<EvaluateSubmissionOutput> => {
    const ai: AiEvaluationResult = {
      isGenuine: status === 'AUTO_APPROVED',
      confidenceScore,
      detectedLabels: [],
      moderationFlags: [],
      reasoning,
      evaluatedAt: nowIso,
      ...extra,
    };
    await setStatus(submissionId, status, ai, nowIso);
    console.log('[evaluateSubmission] decision', { submissionId, status, confidenceScore });
    return { submissionId, status, confidenceScore, reasoning };
  };

  // 2. Read the photo (size-limited)
  const object = await s3Client.send(new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key }));
  if ((object.ContentLength ?? 0) > MAX_IMAGE_BYTES) {
    return finish('REJECTED', 0, 'Photo is larger than 5 MB.');
  }
  const bytes = await object.Body!.transformToByteArray();

  // 3. Duplicate-photo check: the same image can only ever earn once
  const imageHash = crypto.createHash('sha256').update(bytes).digest('hex');
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { PK: `IMGHASH#${imageHash}`, SK: 'METADATA', submissionId, userId, createdAt: nowIso },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') {
      return finish('REJECTED', 0, 'This exact photo was already submitted.');
    }
    throw err;
  }

  // 4. Rekognition: moderation + labels. Any failure → human review (fail closed).
  let detectedLabels: string[] = [];
  try {
    const mod = await rekognitionClient.send(new DetectModerationLabelsCommand({ Image: { Bytes: bytes }, MinConfidence: 60 }));
    const moderationFlags = (mod.ModerationLabels || []).map((l) => l.Name || '').filter(Boolean);
    if (moderationFlags.length > 0) {
      return finish('REJECTED', 0, 'Image contains prohibited content.', { moderationFlags });
    }
    const labels = await rekognitionClient.send(
      new DetectLabelsCommand({ Image: { Bytes: bytes }, MaxLabels: 15, MinConfidence: 65 }),
    );
    detectedLabels = (labels.Labels || []).map((l) => l.Name || '').filter(Boolean);
  } catch (err: any) {
    console.error('[evaluateSubmission] Rekognition failed', { submissionId, error: err?.message });
    return finish('FLAGGED_FOR_REVIEW', 0.5, 'Automatic image screening was unavailable; sent to a ward officer.');
  }

  // 5. Bedrock Nova Lite looks at the actual photo (multimodal)
  let confidenceScore: number;
  let isGenuine: boolean;
  let reasoning: string;
  try {
    const prompt = `You verify civic waste-action photos for Oru, a Delhi civic app.
Claimed action: ${actionType === 'HABIT_SEGREGATION' ? 'household waste segregated into separate wet and dry bins' : 'a community litter cleanup (collected / bagged waste, cleaned public spot)'}.
User note: ${String(submission.description || '').slice(0, 300) || 'none'}
Rekognition labels: ${detectedLabels.join(', ') || 'none'}.
Judge ONLY what is visible in the image. Screenshots, photos of screens, stock images, or unrelated scenes are not genuine.
Reply with JSON only: {"isGenuine": boolean, "confidenceScore": number between 0 and 1, "reasoning": "one short sentence"}`;

    const res = await bedrockClient.send(
      new ConverseCommand({
        modelId: NOVA_MODEL_ID,
        messages: [{ role: 'user', content: [{ image: { format: 'jpeg', source: { bytes } } }, { text: prompt }] }],
        inferenceConfig: { maxTokens: 300, temperature: 0.1 },
      }),
    );
    const text = res.output?.message?.content?.find((c) => 'text' in c && c.text)?.text || '';
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    if (typeof parsed.confidenceScore !== 'number' || typeof parsed.isGenuine !== 'boolean') {
      throw new Error(`Unparseable model output: ${text.slice(0, 120)}`);
    }
    confidenceScore = Math.min(1, Math.max(0, parsed.confidenceScore));
    isGenuine = parsed.isGenuine;
    reasoning = String(parsed.reasoning || 'Evaluated by Amazon Nova.').slice(0, 300);
  } catch (err: any) {
    console.error('[evaluateSubmission] Bedrock failed', { submissionId, error: err?.message });
    return finish('FLAGGED_FOR_REVIEW', 0.5, 'AI verification was unavailable; sent to a ward officer.', { detectedLabels });
  }

  const extra = { detectedLabels, isGenuine };
  if (!isGenuine || confidenceScore < REVIEW_THRESHOLD) {
    return finish('REJECTED', confidenceScore, reasoning, { ...extra, isGenuine: false });
  }
  if (confidenceScore < AUTO_APPROVE_THRESHOLD) {
    return finish('FLAGGED_FOR_REVIEW', confidenceScore, reasoning, extra);
  }

  // 6. Auto-approve: reward with the user's real streak and territory health
  const [userRes, terrRes] = await Promise.all([
    docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${userId}`, SK: 'PROFILE' } })),
    docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `TERRITORY#${territoryId}`, SK: 'METADATA' } })),
  ]);
  const reward = calculateRewards({
    actionType,
    streakDays: userRes.Item?.streakDays || 0,
    territoryHealth: terrRes.Item?.health ?? 75,
  });
  const ai: AiEvaluationResult = {
    isGenuine: true,
    confidenceScore,
    detectedLabels,
    moderationFlags: [],
    reasoning,
    evaluatedAt: nowIso,
  };
  const today = istDayString(new Date());

  const items: any[] = [
    {
      Update: {
        TableName: TABLE_NAME,
        Key: { PK: `SUBMISSION#${submissionId}`, SK: 'METADATA' },
        UpdateExpression:
          'SET #status = :approved, aiEvaluation = :ai, creditsAwarded = :gc, xpAwarded = :xp, updatedAt = :now, GSI2PK = :gsi2pk, GSI2SK = :now',
        ConditionExpression: '#status = :pending',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':approved': 'AUTO_APPROVED',
          ':ai': ai,
          ':gc': reward.creditsEarned,
          ':xp': reward.xpEarned,
          ':now': nowIso,
          ':gsi2pk': 'STATUS#AUTO_APPROVED',
          ':pending': 'PENDING_UPLOAD',
        },
      },
    },
    // Daily cap on auto-approved photos (above it, a human reviews)
    {
      Update: {
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `PHOTO_LIMIT#${today}` },
        UpdateExpression: 'ADD approvedCount :one SET #ttl = :ttl',
        ConditionExpression: 'attribute_not_exists(approvedCount) OR approvedCount < :max',
        ExpressionAttributeNames: { '#ttl': 'ttl' },
        ExpressionAttributeValues: {
          ':one': 1,
          ':max': MAX_AUTO_APPROVALS_PER_DAY,
          ':ttl': Math.floor(Date.now() / 1000) + 2 * 86400,
        },
      },
    },
    {
      Update: {
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET balanceGC = balanceGC + :gc, lifetimeXP = lifetimeXP + :xp, updatedAt = :now',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':gc': reward.creditsEarned, ':xp': reward.xpEarned, ':now': nowIso },
      },
    },
    {
      Put: {
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: ledgerSortKey(nowIso),
          GSI1PK: `ACTION#${actionType}`,
          GSI1SK: nowIso,
          userId,
          actionType,
          creditsEarned: reward.creditsEarned,
          xpEarned: reward.xpEarned,
          submissionId,
          territoryId,
          timestamp: nowIso,
        },
      },
    },
  ];
  if (terrRes.Item) {
    items.push({
      Update: {
        TableName: TABLE_NAME,
        Key: { PK: `TERRITORY#${territoryId}`, SK: 'METADATA' },
        UpdateExpression: 'SET health = health + :gain, totalActions = if_not_exists(totalActions, :zero) + :one',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':gain': 1.0, ':zero': 0, ':one': 1 },
      },
    });
  }

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: items }));
  } catch (err: any) {
    const reasons: Array<{ Code?: string }> = err?.CancellationReasons || [];
    if (err?.name === 'TransactionCanceledException' && reasons[1]?.Code === 'ConditionalCheckFailed') {
      // Daily auto-approval cap reached: a ward officer decides instead
      return finish('FLAGGED_FOR_REVIEW', confidenceScore, `${reasoning} (Daily auto-approval limit reached.)`, extra);
    }
    throw err;
  }
  await clampTerritoryHealth(territoryId);

  console.log('[evaluateSubmission] decision', { submissionId, status: 'AUTO_APPROVED', confidenceScore });
  return {
    submissionId,
    status: 'AUTO_APPROVED',
    confidenceScore,
    reasoning,
    creditsAwarded: reward.creditsEarned,
    xpAwarded: reward.xpEarned,
  };
};
