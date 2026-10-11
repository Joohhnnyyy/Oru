import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Coupon, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

type CatalogCoupon = Coupon & { merchantName?: string; category?: string };

export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const res = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        // Coupons plus merchant profiles, so each coupon can carry its merchant's name and category
        FilterExpression: 'begins_with(SK, :skPrefix) OR (SK = :profile AND begins_with(PK, :merchantPrefix))',
        ExpressionAttributeValues: {
          ':skPrefix': 'COUPON#',
          ':profile': 'PROFILE',
          ':merchantPrefix': 'MERCHANT#',
        },
      }),
    );

    const now = new Date().toISOString();
    const allItems = res.Items || [];
    const merchants = new Map<string, { name?: string; category?: string }>();
    for (const m of allItems) {
      if (m.SK === 'PROFILE' && typeof m.PK === 'string' && m.PK.startsWith('MERCHANT#')) {
        merchants.set(m.merchantId || m.PK.slice('MERCHANT#'.length), { name: m.name, category: m.category });
      }
    }
    // Catalog coupons live under MERCHANT#…; USER#… COUPON# rows are redemptions, not offers
    const items = allItems.filter(
      (item: any) => typeof item.SK === 'string' && item.SK.startsWith('COUPON#') && !String(item.PK || '').startsWith('USER#'),
    );

    // Filter available coupons (stock > 0 and not expired)
    const availableCoupons: CatalogCoupon[] = items
      .filter((item: any) => item.stock > 0 && item.expiresAt > now)
      .map((item: any) => ({
        couponId: item.couponId,
        merchantId: item.merchantId,
        title: item.title,
        discountText: item.discountText,
        costGC: item.costGC,
        expiresAt: item.expiresAt,
        stock: item.stock,
        merchantName: merchants.get(item.merchantId)?.name,
        category: merchants.get(item.merchantId)?.category,
      }))
      .sort((a, b) => a.costGC - b.costGC);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupons: availableCoupons, count: availableCoupons.length }),
    };
  } catch (error: any) {
    console.error('[getCoupons] failed', { error: error?.message, name: error?.name });
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve coupon catalog.')),
    };
  }
};
