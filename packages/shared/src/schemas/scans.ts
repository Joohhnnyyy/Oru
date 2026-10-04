import { z } from 'zod';

export const ScanRequestSchema = z.object({
  sourceId: z.string().min(1, 'Source ID is required'),
  qrPayload: z.string().optional(), // rotating QR token: "<timestampMs>.<hmacSignature>"
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type ScanRequest = z.infer<typeof ScanRequestSchema>;

export const ScanResultSchema = z.object({
  success: z.boolean(),
  actionType: z.string(),
  sourceId: z.string(),
  sourceName: z.string(),
  sourceType: z.string(),
  creditsEarned: z.number().int().nonnegative(),
  xpEarned: z.number().int().nonnegative(),
  newBalanceGC: z.number().int().nonnegative(),
  newLifetimeXP: z.number().int().nonnegative(),
  tier: z.object({
    currentTier: z.object({
      key: z.string(),
      titleEn: z.string(),
      titleHi: z.string(),
      badge: z.string(),
    }),
    progressPercent: z.number(),
  }),
  territoryId: z.string(),
  territoryHealth: z.number(),
  collectorReward: z
    .object({
      collectorId: z.string(),
      creditsEarned: z.number(),
    })
    .optional(),
  message: z.string().optional(),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;
