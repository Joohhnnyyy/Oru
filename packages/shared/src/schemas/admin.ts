import { z } from 'zod';
import { QrSourceTypeSchema } from './qr.js';

export const AdminTerritorySummarySchema = z.object({
  territoryId: z.string(),
  name: z.string(),
  health: z.number(),
  moodState: z.enum(['sick', 'recovering', 'thriving', 'legendary']),
  activeHotspotsCount: z.number(),
  lastUpdated: z.string(),
});
export type AdminTerritorySummary = z.infer<typeof AdminTerritorySummarySchema>;

export const AdminTerritoryOverviewSchema = z.object({
  totalTerritories: z.number(),
  averageHealth: z.number(),
  moodDistribution: z.record(z.string(), z.number()),
  totalActiveHotspots: z.number(),
  territories: z.array(AdminTerritorySummarySchema),
});
export type AdminTerritoryOverview = z.infer<typeof AdminTerritoryOverviewSchema>;

export const RegisterQrSourceRequestSchema = z.object({
  type: QrSourceTypeSchema,
  name: z.string().min(3).max(100),
  territoryId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(500).default(75),
  assignedCollectorId: z.string().optional(),
});
export type RegisterQrSourceRequest = z.infer<typeof RegisterQrSourceRequestSchema>;

export const RegisterQrSourceResponseSchema = z.object({
  qrId: z.string(),
  type: QrSourceTypeSchema,
  name: z.string(),
  territoryId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number(),
  secretKey: z.string().optional(),
  qrPayload: z.string(),
  createdAt: z.string().datetime(),
});
export type RegisterQrSourceResponse = z.infer<typeof RegisterQrSourceResponseSchema>;

export const ReviewQueueItemSchema = z.object({
  submissionId: z.string(),
  userId: z.string(),
  territoryId: z.string(),
  actionType: z.string(),
  s3Key: z.string(),
  photoUrl: z.string().optional(),
  aiConfidence: z.number(),
  moderationFlags: z.array(z.string()),
  bedrockReasoning: z.string(),
  taskToken: z.string().optional(),
  submittedAt: z.string().datetime(),
});
export type ReviewQueueItem = z.infer<typeof ReviewQueueItemSchema>;

export const ResolveReviewQueueRequestSchema = z.object({
  submissionId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().min(3).max(500),
  awardedGC: z.number().min(0).max(500).optional().default(100),
  awardedXP: z.number().min(0).max(1000).optional().default(250),
});
export type ResolveReviewQueueRequest = z.infer<typeof ResolveReviewQueueRequestSchema>;

export const ResolveReviewQueueResponseSchema = z.object({
  submissionId: z.string(),
  decision: z.enum(['APPROVE', 'REJECT']),
  resolvedBy: z.string(),
  resolvedAt: z.string().datetime(),
  awardedGC: z.number(),
  awardedXP: z.number(),
  reason: z.string(),
});
export type ResolveReviewQueueResponse = z.infer<typeof ResolveReviewQueueResponseSchema>;
