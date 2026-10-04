import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  ReviewQueueItem,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { evaluateCedarPolicy } from '../../utils/cedar.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;

  // 1. Evaluate Cedar authorization policy
  const authDecision = evaluateCedarPolicy({
    claims,
    action: 'getReviewQueue',
    resource: 'system',
  });

  if (authDecision.decision !== 'ALLOW') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('FORBIDDEN', authDecision.reason || 'Unauthorized administrative access.')),
    };
  }

  try {
    // 2. Query DynamoDB GSI2 for submissions flagged for human review
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': 'STATUS#FLAGGED_FOR_REVIEW',
        },
      }),
    );

    const items = (result.Items || []).filter((item) => item.PK?.startsWith('SUBMISSION#'));

    const reviewQueue: ReviewQueueItem[] = items.map((item) => ({
      submissionId: item.submissionId,
      userId: item.userId,
      territoryId: item.territoryId,
      actionType: item.actionType,
      s3Key: item.s3Key,
      photoUrl: item.photoUrl,
      aiConfidence: item.aiEvaluation?.confidenceScore ?? item.confidenceScore ?? 50,
      moderationFlags: item.aiEvaluation?.moderationFlags ?? item.moderationFlags ?? [],
      bedrockReasoning: item.aiEvaluation?.bedrockReasoning ?? item.bedrockReasoning ?? 'Pending human review',
      taskToken: item.taskToken,
      submittedAt: item.createdAt || new Date().toISOString(),
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewQueue,
        count: reviewQueue.length,
      }),
    };
  } catch (error: any) {
    console.error('Error retrieving review queue:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve municipal review queue.')),
    };
  }
};
