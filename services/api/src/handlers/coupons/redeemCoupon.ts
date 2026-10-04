import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import * as crypto from 'crypto';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  CouponRedemptionRequestSchema,
  CouponRedemptionResponse,
  UserCoupon,
  createErrorResponse,
} from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

function getIsoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

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

  const parseResult = CouponRedemptionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid coupon redemption request.')),
    };
  }

  const { couponId, merchantId } = parseResult.data;

  try {
    const now = new Date();
    const nowIso = now.toISOString();
    const weekStr = getIsoWeekString(now);

    // 1. Fetch user profile
    const userRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      }),
    );

    if (!userRes.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('USER_NOT_FOUND', 'Citizen profile not found. Please complete onboarding first.')),
      };
    }

    const user = userRes.Item;

    // 2. Fetch coupon metadata
    const couponRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `MERCHANT#${merchantId}`,
          SK: `COUPON#${couponId}`,
        },
      }),
    );

    if (!couponRes.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('COUPON_NOT_FOUND', 'Coupon was not found or is no longer available.')),
      };
    }

    const coupon = couponRes.Item;

    // Check expiration
    if (coupon.expiresAt && coupon.expiresAt <= nowIso) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('COUPON_EXPIRED', 'This coupon has expired.')),
      };
    }

    // Check stock
    if ((coupon.stock || 0) <= 0) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('OUT_OF_STOCK', 'This reward coupon is currently out of stock.')),
      };
    }

    // Check user balance
    if ((user.balanceGC || 0) < coupon.costGC) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('INSUFFICIENT_BALANCE', `You need ${coupon.costGC} Green Credits to redeem this coupon, but have ${user.balanceGC || 0}.`)),
      };
    }

    // 3. Check weekly per-merchant limit
    const limitRes = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `LIMIT#${merchantId}#${weekStr}`,
        },
      }),
    );

    if (limitRes.Item) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createErrorResponse('WEEKLY_LIMIT_EXCEEDED', 'You have already redeemed a reward from this merchant this week. Limit is 1 coupon per merchant per week.')),
      };
    }

    // 4. Generate redemption artifacts
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const merchantSuffix = merchantId.replace('merchant_', '').slice(0, 4).toUpperCase();
    const redemptionCode = `SAF-${merchantSuffix}-${randomHex}`;
    const redemptionId = `red_${crypto.randomUUID().slice(0, 8)}`;

    const userCoupon: UserCoupon = {
      redemptionId,
      couponId,
      merchantId,
      title: coupon.title,
      discountText: coupon.discountText,
      redemptionCode,
      costGC: coupon.costGC,
      redeemedAt: nowIso,
      expiresAt: coupon.expiresAt,
      status: 'active',
    };

    const newBalanceGC = user.balanceGC - coupon.costGC;

    // 5. Execute atomic transaction
    const transactItems = [
      // Debit user balance
      {
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
          UpdateExpression: 'SET balanceGC = balanceGC - :cost, updatedAt = :now',
          ConditionExpression: 'attribute_exists(PK) AND balanceGC >= :cost',
          ExpressionAttributeValues: {
            ':cost': coupon.costGC,
            ':now': nowIso,
          },
        },
      },
      // Decrement coupon stock
      {
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: `MERCHANT#${merchantId}`, SK: `COUPON#${couponId}` },
          UpdateExpression: 'SET stock = stock - :one',
          ConditionExpression: 'stock > :zero',
          ExpressionAttributeValues: {
            ':one': 1,
            ':zero': 0,
          },
        },
      },
      // Store user coupon
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `COUPON#${redemptionId}`,
            GSI1PK: 'COUPON_STATUS#active',
            GSI1SK: nowIso,
            ...userCoupon,
          },
        },
      },
      // Record immutable ledger spend entry
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `LEDGER#${nowIso}`,
            GSI1PK: 'ACTION#COUPON_REDEMPTION',
            GSI1SK: nowIso,
            userId,
            actionType: 'COUPON_REDEMPTION',
            creditsEarned: -coupon.costGC,
            xpEarned: 0,
            couponId,
            merchantId,
            timestamp: nowIso,
          },
        },
      },
      // Record weekly limit
      {
        Put: {
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${userId}`,
            SK: `LIMIT#${merchantId}#${weekStr}`,
            createdAt: nowIso,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
    ];

    try {
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        }),
      );
    } catch (txErr: any) {
      if (txErr.name === 'TransactionCanceledException') {
        return {
          statusCode: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createErrorResponse('REDEMPTION_CONFLICT', 'Could not complete redemption due to a balance change or out-of-stock condition.')),
        };
      }
      throw txErr;
    }

    const responsePayload: CouponRedemptionResponse = {
      success: true,
      redemption: userCoupon,
      newBalanceGC,
      message: `Coupon redeemed successfully! Show code ${redemptionCode} to the cashier.`,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to redeem coupon.')),
    };
  }
};
