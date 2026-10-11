import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { SubmissionMetadata, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { hasGroup } from '../../utils/territory.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const userId = claims?.sub;

  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.')),
    };
  }

  const submissionId = event.pathParameters?.id;
  if (!submissionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('MISSING_PARAMETER', 'Submission ID is required in the path.')),
    };
  }

  try {
    const res = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `SUBMISSION#${submissionId}`,
          SK: 'METADATA',
        },
      }),
    );

    if (!res.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('SUBMISSION_NOT_FOUND', `Submission '${submissionId}' was not found.`)),
      };
    }

    // Only the owner (or a ward admin) may read a submission. 404 avoids confirming it exists.
    if (res.Item.userId !== userId && !hasGroup(claims, 'ward_admin')) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('SUBMISSION_NOT_FOUND', `Submission '${submissionId}' was not found.`)),
      };
    }

    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, taskToken, ...metadata } = res.Item;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata as SubmissionMetadata),
    };
  } catch (error: any) {
    console.error('[getSubmission] failed', { submissionId, error: error?.message });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve submission.')),
    };
  }
};
