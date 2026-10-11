import { z } from 'zod';

export const MerchantCategorySchema = z.enum([
  'food_beverage',
  'groceries',
  'fashion',
  'services',
  'dairy',
]);
export type MerchantCategory = z.infer<typeof MerchantCategorySchema>;

export const MerchantSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  name: z.string().min(1, 'Merchant name is required'),
  category: MerchantCategorySchema,
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  ward: z.string().min(1, 'Ward is required'),
  logoUrl: z.string().optional(),
});
export type Merchant = z.infer<typeof MerchantSchema>;

export const CouponSchema = z.object({
  couponId: z.string().min(1, 'Coupon ID is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  title: z.string().min(1, 'Title is required'),
  discountText: z.string().min(1, 'Discount text is required'),
  costGC: z.number().int().positive('Cost must be positive Green Credits'),
  expiresAt: z.string().datetime(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});
export type Coupon = z.infer<typeof CouponSchema>;
