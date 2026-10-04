import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import * as h3 from 'h3-js';
import {
  CreateSubmissionRequestSchema,
  CreateSubmissionResponse,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { s3Client, PROOFS_BUCKET_NAME } from '../../utils/s3.js';

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

  const parseResult = CreateSubmissionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid submission payload.')),
    };
  }

  const { actionType, latitude, longitude, description } = parseResult.data;

  // Validate coordinates within Delhi NCR bounding box (28.2 to 29.0 N, 76.7 to 77.6 E)
  if (latitude < 28.2 || latitude > 29.0 || longitude < 76.7 || longitude > 77.6) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('LOCATION_OUT_OF_BOUNDS', 'Proof submission coordinates must be located within Delhi NCR region.')),
    };
  }

  try {
    const territoryId = parseResult.data.territoryId || h3.latLngToCell(latitude, longitude, 7);
    const submissionId = `sub_${crypto.randomBytes(6).toString('hex')}`;
    const s3Key = `proofs/${userId}/${submissionId}.jpg`;
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // 1. Generate presigned PUT URL
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: PROOFS_BUCKET_NAME,
        Key: s3Key,
        ContentType: 'image/jpeg',
      }),
      { expiresIn: 900 },
    );

    // 2. Persist initial submission record in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `SUBMISSION#${submissionId}`,
          SK: 'METADATA',
          GSI1PK: `USER#${userId}`,
          GSI1SK: nowIso,
          GSI2PK: 'STATUS#PENDING_UPLOAD',
          GSI2SK: nowIso,
          submissionId,
          userId,
          actionType,
          status: 'PENDING_UPLOAD',
          s3Key,
          latitude,
          longitude,
          territoryId,
          description,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      }),
    );

    const responsePayload: CreateSubmissionResponse = {
      submissionId,
      uploadUrl,
      s3Key,
      expiresAt,
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to initialize submission upload.')),
    };
  }
};
