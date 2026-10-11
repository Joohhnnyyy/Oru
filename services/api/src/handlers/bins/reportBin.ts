import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';
import { calculateHaversineDistance } from '../../utils/geo.js';
import { binStatus, estimateFill } from '../../utils/bins.js';
import { claimsOf, isLatLng, json, parseBody } from '../../utils/http.js';

const ISSUES = ['FULL', 'DAMAGED'] as const;
type Issue = (typeof ISSUES)[number];
/** Reporter must be near the bin, so reports reflect what people actually see. */
const MAX_REPORT_DISTANCE_M = 300;

/**
 * POST /v1/bins/{sourceId}/report  { issue: 'FULL' | 'DAMAGED', latitude, longitude }
 * A citizen flags a public bin. One report per user per bin per hour.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const userId = claimsOf(event)?.sub;
  if (!userId) return json(401, createErrorResponse('UNAUTHORIZED', 'Missing or invalid authentication token claims.'));

  const sourceId = event.pathParameters?.sourceId;
  if (!sourceId) return json(400, createErrorResponse('VALIDATION_ERROR', 'Bin id is required.'));
  const body = parseBody(event.body);
  if (!body) return json(400, createErrorResponse('INVALID_JSON', 'Request body must be valid JSON.'));
  const issue = body.issue as Issue;
  if (!ISSUES.includes(issue)) return json(400, createErrorResponse('VALIDATION_ERROR', "issue must be 'FULL' or 'DAMAGED'."));
  if (!isLatLng(body.latitude, body.longitude)) {
    return json(400, createErrorResponse('VALIDATION_ERROR', 'Your location is required to report a bin.'));
  }

  try {
    const bin = (await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `QR#${sourceId}`, SK: 'METADATA' } }))).Item;
    if (!bin || bin.type !== 'dustbin_static') return json(404, createErrorResponse('BIN_NOT_FOUND', 'That bin was not found.'));

    const distance = calculateHaversineDistance(body.latitude, body.longitude, bin.latitude, bin.longitude);
    if (distance > MAX_REPORT_DISTANCE_M) {
      return json(403, createErrorResponse('TOO_FAR', `You need to be near the bin to report it (you are ${distance} m away).`));
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const hourBucket = nowIso.slice(0, 13);
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `BINREPORT#${sourceId}#${hourBucket}`,
            issue,
            reportedAt: nowIso,
            ttl: Math.floor(now.getTime() / 1000) + 7 * 86400,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        }),
      );
    } catch (err: any) {
      if (err?.name === 'ConditionalCheckFailedException') {
        return json(429, createErrorResponse('ALREADY_REPORTED', 'You already reported this bin in the last hour.'));
      }
      throw err;
    }

    const res = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `QR#${sourceId}`, SK: 'METADATA' },
        UpdateExpression:
          issue === 'FULL'
            ? 'SET fillLevel = :full, fillUpdatedAt = :at, lastReportAt = :at, lastReportIssue = :issue ADD reportCount :one'
            : 'SET damagedAt = :at, lastReportAt = :at, lastReportIssue = :issue ADD reportCount :one',
        ExpressionAttributeValues: {
          ':at': nowIso,
          ':issue': issue,
          ':one': 1,
          ...(issue === 'FULL' ? { ':full': 100 } : {}),
        },
        ReturnValues: 'ALL_NEW',
      }),
    );

    const updated = res.Attributes || {};
    const fill = estimateFill(updated, now.getTime());
    return json(200, {
      sourceId,
      issue,
      fillLevel: fill,
      status: binStatus(updated, fill),
      message: issue === 'FULL' ? 'Thanks, the collection team has been alerted.' : 'Thanks, the bin has been flagged for repair.',
    });
  } catch (error: any) {
    console.error('[reportBin] failed', { sourceId, error: error?.message });
    return json(500, createErrorResponse('INTERNAL_ERROR', 'Failed to report the bin.'));
  }
};
