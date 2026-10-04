import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { UpdateUserPreferencesSchema, UserProfile, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

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

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INVALID_JSON', 'Malformed JSON in request body.')),
    };
  }

  const parseResult = UpdateUserPreferencesSchema.safeParse(body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', `Invalid profile update: ${errorDetails}`)),
    };
  }

  const updates = parseResult.data;
  if (!updates.language) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('NO_UPDATES', 'No valid update fields provided.')),
    };
  }

  const now = new Date().toISOString();
  const updateExpressions: string[] = ['#updatedAt = :updatedAt', '#language = :language'];
  const expressionAttributeNames: Record<string, string> = {
    '#updatedAt': 'updatedAt',
    '#language': 'language',
  };
  const expressionAttributeValues: Record<string, any> = {
    ':updatedAt': now,
    ':language': updates.language,
  };

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }),
    );

    const { PK, SK, GSI1PK, GSI1SK, ...profile } = result.Attributes || {};

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile as UserProfile),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to update user profile.')),
    };
  }
};
