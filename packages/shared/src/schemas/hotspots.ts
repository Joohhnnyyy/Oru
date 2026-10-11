import { z } from 'zod';

export const HotspotSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type HotspotSeverity = z.infer<typeof HotspotSeveritySchema>;

export const HotspotStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']);
export type HotspotStatus = z.infer<typeof HotspotStatusSchema>;

export const BountyStatusSchema = z.enum(['AVAILABLE', 'CLAIMED', 'COMPLETED']);
export type BountyStatus = z.infer<typeof BountyStatusSchema>;

export const ReportHotspotRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  title: z.string().min(3).max(100),
  description: z.string().min(5).max(500),
  severity: HotspotSeveritySchema.default('MEDIUM'),
  photoUrl: z.string().url().optional(),
  territoryId: z.string().optional(),
});
export type ReportHotspotRequest = z.infer<typeof ReportHotspotRequestSchema>;

export const ReportHotspotResponseSchema = z.object({
  hotspotId: z.string(),
  territoryId: z.string(),
  bountyId: z.string(),
  healthPenalty: z.number(),
  status: HotspotStatusSchema,
  bountyReward: z.object({
    greenCredits: z.number(),
    xp: z.number(),
  }),
  reportedAt: z.string().datetime(),
});
export type ReportHotspotResponse = z.infer<typeof ReportHotspotResponseSchema>;

export const HotspotItemSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  GSI1PK: z.string().optional(),
  GSI1SK: z.string().optional(),
  GSI2PK: z.string().optional(),
  GSI2SK: z.string().optional(),
  hotspotId: z.string(),
  reporterUserId: z.string().optional(), // omitted from the public API for privacy
  territoryId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  title: z.string(),
  description: z.string(),
  severity: HotspotSeveritySchema,
  status: HotspotStatusSchema,
  bountyId: z.string(),
  photoUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});
export type HotspotItem = z.infer<typeof HotspotItemSchema>;

export const BountyTaskSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  GSI1PK: z.string().optional(),
  GSI1SK: z.string().optional(),
  bountyId: z.string(),
  hotspotId: z.string(),
  territoryId: z.string(),
  title: z.string(),
  description: z.string(),
  rewardGC: z.number(),
  rewardXP: z.number(),
  status: BountyStatusSchema,
  claimedBy: z.string().optional(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type BountyTask = z.infer<typeof BountyTaskSchema>;
