import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as crypto from 'crypto';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import {
  RegisterQrSourceRequestSchema,
  RegisterQrSourceResponse,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { evaluateCedarPolicy } from '../../utils/cedar.js';
import { generateStaticQrSignature } from '../../utils/hmac.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;

  // 1. Evaluate Cedar authorization policy
  const authDecision = evaluateCedarPolicy({
    claims,
    action: 'manageQrSources',
    resource: 'system',
  });

  if (authDecision.decision !== 'ALLOW') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('FORBIDDEN', authDecision.reason || 'Unauthorized administrative access.')),
    };
  }

  const httpMethod = event.requestContext.http.method.toUpperCase();

  // Handle GET /v1/admin/qr-sources
  if (httpMethod === 'GET') {
    try {
      const scanResult = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'SK = :sk AND begins_with(PK, :prefix)',
          ExpressionAttributeValues: {
            ':sk': 'METADATA',
            ':prefix': 'QR#',
          },
        }),
      );

      const qrSources = (scanResult.Items || []).map((item) => ({
        qrId: item.sourceId || item.qrId,
        type: item.type,
        name: item.name,
        territoryId: item.h3TerritoryId || item.territoryId,
        latitude: item.latitude,
        longitude: item.longitude,
        radiusMeters: item.geofenceRadiusMeters || item.radiusMeters || 75,
        isActive: item.isActive !== false,
        qrPayload: item.type !== 'truck_rotating' && item.secretKey
          ? JSON.stringify({ v: 1, sourceId: item.sourceId || item.qrId, token: generateStaticQrSignature(item.secretKey, item.sourceId || item.qrId) })
          : undefined,
        createdAt: item.createdAt,
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrSources,
          count: qrSources.length,
        }),
      };
    } catch (error: any) {
      console.error('Error listing QR sources:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve registered QR sources.')),
      };
    }
  }

  // Handle POST /v1/admin/qr-sources
  if (httpMethod === 'POST') {
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

    const parseResult = RegisterQrSourceRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid QR source payload.')),
      };
    }

    const { type, name, territoryId, latitude, longitude, radiusMeters, assignedCollectorId } = parseResult.data;

    try {
      const qrId = `qr_${crypto.randomBytes(6).toString('hex')}`;
      const secretKey = crypto.randomBytes(16).toString('hex');
      const nowIso = new Date().toISOString();

      // Encode standard QR payload format
      const qrPayload = JSON.stringify({
        v: 1,
        sourceId: qrId,
        ...(type === 'truck_rotating' ? { mode: 'rotating' } : { token: generateStaticQrSignature(secretKey, qrId) }),
      });

      // Persist in DynamoDB
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `QR#${qrId}`,
            SK: 'METADATA',
            GSI1PK: `TERRITORY#${territoryId}`,
            GSI1SK: nowIso,
            GSI2PK: `TYPE#${type}`,
            GSI2SK: nowIso,
            sourceId: qrId,
            qrId,
            type,
            name,
            territoryId,
            h3TerritoryId: territoryId,
            latitude,
            longitude,
            secretKey,
            geofenceRadiusMeters: radiusMeters,
            radiusMeters,
            assignedCollectorId: assignedCollectorId || null,
            isActive: true,
            qrPayload,
            createdAt: nowIso,
          },
        }),
      );

      const response: RegisterQrSourceResponse = {
        qrId,
        type,
        name,
        territoryId,
        latitude,
        longitude,
        radiusMeters,
        qrPayload,
        createdAt: nowIso,
      };

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      };
    } catch (error: any) {
      console.error('Error creating QR source:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to register municipal QR source.')),
      };
    }
  }

  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createErrorResponse('METHOD_NOT_ALLOWED', 'Supported methods are GET and POST.')),
  };
};
