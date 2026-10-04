import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getUserTier } from '@saafsafari/game-rules';
import {
  WalletResponse,
  LedgerItem,
  UserCoupon,
  createErrorResponse,
} from '@saafsafari/shared';
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

  try {
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

    // 2. Fetch recent ledger transactions (last 25)
    const ledgerRes = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'LEDGER#',
        },
        ScanIndexForward: false,
        Limit: 25,
      }),
    );

    const recentTransactions: LedgerItem[] = (ledgerRes.Items || []).map((item: any) => ({
      id: item.SK,
      timestamp: item.timestamp,
      actionType: item.actionType,
      creditsEarned: item.creditsEarned,
      xpEarned: item.xpEarned || 0,
      sourceId: item.sourceId,
      couponId: item.couponId,
      merchantId: item.merchantId,
      territoryId: item.territoryId,
    }));

    // 3. Fetch active redeemed coupons
    const couponsRes = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'COUPON#',
        },
        ScanIndexForward: false,
      }),
    );

    const activeCoupons: UserCoupon[] = (couponsRes.Items || []).map((item: any) => ({
      redemptionId: item.redemptionId,
      couponId: item.couponId,
      merchantId: item.merchantId,
      title: item.title,
      discountText: item.discountText,
      redemptionCode: item.redemptionCode,
      costGC: item.costGC,
      redeemedAt: item.redeemedAt,
      expiresAt: item.expiresAt,
      status: item.status || 'active',
    }));

    const tierProgress = getUserTier(user.lifetimeXP || 0);

    const responsePayload: WalletResponse = {
      balanceGC: user.balanceGC || 0,
      lifetimeXP: user.lifetimeXP || 0,
      tier: {
        currentTier: {
          key: tierProgress.currentTier.key,
          titleEn: tierProgress.currentTier.titleEn,
          titleHi: tierProgress.currentTier.titleHi,
          badge: tierProgress.currentTier.badge,
        },
        progressPercent: tierProgress.progressPercent,
      },
      streakDays: user.streakDays || 0,
      recentTransactions,
      activeCoupons,
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
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve wallet information.')),
    };
  }
};
