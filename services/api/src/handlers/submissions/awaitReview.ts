import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

/**
 * Step Functions task (WAIT_FOR_TASK_TOKEN): stores the callback token on a flagged
 * submission. The execution then pauses until a ward officer resolves it via
 * POST /v1/admin/review-queue/resolve, which calls SendTaskSuccess with this token.
 */
export const handler = async (input: { submissionId: string; taskToken: string }): Promise<void> => {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `SUBMISSION#${input.submissionId}`, SK: 'METADATA' },
      UpdateExpression: 'SET taskToken = :t',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: { ':t': input.taskToken },
    }),
  );
};
