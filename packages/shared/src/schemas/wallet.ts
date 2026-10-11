import { z } from 'zod';

export const LedgerItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  actionType: z.string(),
  creditsEarned: z.number().int(),
  xpEarned: z.number().int().default(0),
  sourceId: z.string().optional(),
  couponId: z.string().optional(),
  merchantId: z.string().optional(),
  territoryId: z.string().optional(),
});
export type LedgerItem = z.infer<typeof LedgerItemSchema>;

export const UserCouponSchema = z.object({
  redemptionId: z.string(),
  couponId: z.string(),
  merchantId: z.string(),
  title: z.string(),
  discountText: z.string(),
  redemptionCode: z.string(),
  costGC: z.number().int().positive(),
  redeemedAt: z.string(),
  expiresAt: z.string(),
  status: z.enum(['active', 'used', 'expired']),
});
export type UserCoupon = z.infer<typeof UserCouponSchema>;

export const WalletResponseSchema = z.object({
  balanceGC: z.number().int().nonnegative(),
  lifetimeXP: z.number().int().nonnegative(),
  tier: z.object({
    currentTier: z.object({
      key: z.string(),
      titleEn: z.string(),
      titleHi: z.string(),
      badge: z.string(),
    }),
    progressPercent: z.number(),
  }),
  streakDays: z.number().int().nonnegative(),
  recentTransactions: z.array(LedgerItemSchema),
  activeCoupons: z.array(UserCouponSchema),
});
export type WalletResponse = z.infer<typeof WalletResponseSchema>;

export const CouponRedemptionRequestSchema = z.object({
  couponId: z.string().min(1, 'Coupon ID is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
});
export type CouponRedemptionRequest = z.infer<typeof CouponRedemptionRequestSchema>;

export const CouponRedemptionResponseSchema = z.object({
  success: z.boolean(),
  redemption: UserCouponSchema,
  newBalanceGC: z.number().int().nonnegative(),
  message: z.string().optional(),
});
export type CouponRedemptionResponse = z.infer<typeof CouponRedemptionResponseSchema>;
