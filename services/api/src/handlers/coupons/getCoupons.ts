import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Coupon, createErrorResponse } from '@saafsafari/shared';
import { docClient, TABLE_NAME } from '../../utils/dynamo.js';

export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: {
          ':gsi1pk': 'COUPONS',
        },
      }),
    );

    const now = new Date().toISOString();
    const items = res.Items || [];

    // Filter available coupons (stock > 0 and not expired)
    const availableCoupons: Coupon[] = items
      .filter((item: any) => item.stock > 0 && item.expiresAt > now)
      .map((item: any) => ({
        couponId: item.couponId,
        merchantId: item.merchantId,
        title: item.title,
        discountText: item.discountText,
        costGC: item.costGC,
        expiresAt: item.expiresAt,
        stock: item.stock,
      }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(availableCoupons),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createErrorResponse('INTERNAL_ERROR', 'Failed to retrieve coupon catalog.')),
    };
  }
};
