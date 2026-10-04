import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as crypto from 'crypto';
import { GetCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SFNClient, SendTaskSuccessCommand } from '@aws-sdk/client-sfn';
import { getUserTier } from '@saafsafari/game-rules';
import {
  ResolveReviewQueueRequestSchema,
  ResolveReviewQueueResponse,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { evaluateCedarPolicy } from '../../utils/cedar.js';

const sfnClient = new SFNClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const adminId = claims?.sub;

  // 1. Evaluate Cedar authorization policy
  const authDecision = evaluateCedarPolicy({
    claims,
    action: 'resolveReviewQueue',
    resource: 'system',
  });

  if (authDecision.decision !== 'ALLOW') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('FORBIDDEN', authDecision.reason || 'Unauthorized administrative access.')),
    };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INVALID_JSON', 'Request body must be valid JSON.')),
    };
  }

  const parseResult = ResolveReviewQueueRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid review resolution payload.')),
    };
  }

  const { submissionId, decision, reason, awardedGC, awardedXP } = parseResult.data;
  const nowIso = new Date().toISOString();

  try {
    // 2. Fetch the flagged submission record
    const subResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `SUBMISSION#${submissionId}`,
          SK: 'METADATA',
        },
      }),
    );

    const submission = subResult.Item;
    if (!submission) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('NOT_FOUND', `Submission '${submissionId}' not found.`)),
      };
    }

    const { userId, territoryId, taskToken } = submission;

    if (decision === 'APPROVE') {
      const finalGC = awardedGC ?? 100;
      const finalXP = awardedXP ?? 250;

      // 3. Fetch citizen profile to compute tier progression
      const userResult = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
          },
        }),
      );
      const user = userResult.Item || {};
      const currentXP = (user.lifetimeXP || 0) + finalXP;
      const tierProgression = getUserTier(currentXP);

      const txId = `tx_${crypto.randomBytes(8).toString('hex')}`;

      // 4. Atomic transaction: Update submission, credit user wallet, record ledger, update territory health
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `SUBMISSION#${submissionId}`,
                  SK: 'METADATA',
                },
                UpdateExpression: 'SET #st = :status, GSI2PK = :gsi2pk, adminDecision = :decision, adminReason = :reason, resolvedBy = :adminId, resolvedAt = :now, awardedGC = :gc, awardedXP = :xp',
                ExpressionAttributeNames: {
                  '#st': 'status',
                },
                ExpressionAttributeValues: {
                  ':status': 'ADMIN_APPROVED',
                  ':gsi2pk': 'STATUS#ADMIN_APPROVED',
                  ':decision': 'APPROVE',
                  ':reason': reason,
                  ':adminId': adminId,
                  ':now': nowIso,
                  ':gc': finalGC,
                  ':xp': finalXP,
                },
              },
            },
            {
              Update: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `USER#${userId}`,
                  SK: 'PROFILE',
                },
                UpdateExpression: 'SET balanceGC = if_not_exists(balanceGC, :zero) + :gc, lifetimeCredits = if_not_exists(lifetimeCredits, :zero) + :gc, lifetimeXP = :lifetimeXP, currentTier = :tier, xpProgressInTier = :xpProgress, xpToNextTier = :xpNext, updatedAt = :now',
                ExpressionAttributeValues: {
                  ':zero': 0,
                  ':gc': finalGC,
                  ':lifetimeXP': currentXP,
                  ':tier': tierProgression.currentTier.key,
                  ':xpProgress': tierProgression.progressPercent,
                  ':xpNext': tierProgression.xpNeededForNextTier ?? 0,
                  ':now': nowIso,
                },
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `LEDGER#${userId}`,
                  SK: `TX#${nowIso}#${txId}`,
                  GSI1PK: `USER#${userId}`,
                  GSI1SK: nowIso,
                  txId,
                  userId,
                  type: 'ADMIN_APPROVED_PROOF',
                  amountGC: finalGC,
                  amountXP: finalXP,
                  submissionId,
                  adminId,
                  createdAt: nowIso,
                },
              },
            },
            {
              Update: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `TERRITORY#${territoryId}`,
                  SK: 'METADATA',
                },
                UpdateExpression: 'SET health = if_not_exists(health, :initialHealth) + :healthGain, lastUpdated = :now',
                ExpressionAttributeValues: {
                  ':initialHealth': 100,
                  ':healthGain': 2,
                  ':now': nowIso,
                },
              },
            },
          ],
        }),
      );

      // 5. Send task success to Step Functions if suspended on task token callback
      if (taskToken) {
        try {
          await sfnClient.send(
            new SendTaskSuccessCommand({
              taskToken,
              output: JSON.stringify({
                status: 'AUTO_APPROVED',
                decision: 'ADMIN_APPROVED',
                resolvedBy: adminId,
                resolvedAt: nowIso,
              }),
            }),
          );
        } catch (sfnErr) {
          console.warn('Could not signal Step Functions task token callback:', sfnErr);
        }
      }

      const response: ResolveReviewQueueResponse = {
        submissionId,
        decision: 'APPROVE',
        resolvedBy: adminId,
        resolvedAt: nowIso,
        awardedGC: finalGC,
        awardedXP: finalXP,
        reason,
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      };
    } else {
      // DECISION: REJECT
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `SUBMISSION#${submissionId}`,
            SK: 'METADATA',
          },
          UpdateExpression: 'SET #st = :status, GSI2PK = :gsi2pk, adminDecision = :decision, adminReason = :reason, resolvedBy = :adminId, resolvedAt = :now',
          ExpressionAttributeNames: {
            '#st': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'REJECTED',
            ':gsi2pk': 'STATUS#REJECTED',
            ':decision': 'REJECT',
            ':reason': reason,
            ':adminId': adminId,
            ':now': nowIso,
          },
        }),
      );

      // Signal Step Functions task token callback if present
      if (taskToken) {
        try {
          await sfnClient.send(
            new SendTaskSuccessCommand({
              taskToken,
              output: JSON.stringify({
                status: 'REJECTED',
                decision: 'ADMIN_REJECTED',
                reason,
                resolvedBy: adminId,
                resolvedAt: nowIso,
              }),
            }),
          );
        } catch (sfnErr) {
          console.warn('Could not signal Step Functions task token callback:', sfnErr);
        }
      }

      const response: ResolveReviewQueueResponse = {
        submissionId,
        decision: 'REJECT',
        resolvedBy: adminId,
        resolvedAt: nowIso,
        awardedGC: 0,
        awardedXP: 0,
        reason,
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      };
    }
  } catch (error: any) {
    console.error('Error resolving review queue submission:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to resolve municipal review item.')),
    };
  }
};
