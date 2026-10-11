import { z } from 'zod';

export const SubmissionActionTypeSchema = z.enum([
  'COMMUNITY_CLEANUP_PROOF',
  'HABIT_SEGREGATION',
]);
export type SubmissionActionType = z.infer<typeof SubmissionActionTypeSchema>;

export const SubmissionStatusSchema = z.enum([
  'PENDING_UPLOAD',
  'PROCESSING',
  'AUTO_APPROVED',
  'FLAGGED_FOR_REVIEW',
  'APPROVED',
  'REJECTED',
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const CreateSubmissionRequestSchema = z.object({
  actionType: SubmissionActionTypeSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional(),
  territoryId: z.string().optional(),
});
export type CreateSubmissionRequest = z.infer<typeof CreateSubmissionRequestSchema>;

export const CreateSubmissionResponseSchema = z.object({
  submissionId: z.string(),
  uploadUrl: z.string(),
  s3Key: z.string(),
  expiresAt: z.string(),
});
export type CreateSubmissionResponse = z.infer<typeof CreateSubmissionResponseSchema>;

export const AiEvaluationResultSchema = z.object({
  isGenuine: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  detectedLabels: z.array(z.string()),
  moderationFlags: z.array(z.string()),
  reasoning: z.string(),
  evaluatedAt: z.string(),
});
export type AiEvaluationResult = z.infer<typeof AiEvaluationResultSchema>;

export const SubmissionMetadataSchema = z.object({
  submissionId: z.string(),
  userId: z.string(),
  actionType: SubmissionActionTypeSchema,
  status: SubmissionStatusSchema,
  s3Key: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  territoryId: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  aiEvaluation: AiEvaluationResultSchema.optional(),
  creditsAwarded: z.number().int().optional(),
  xpAwarded: z.number().int().optional(),
  adminFeedback: z.string().optional(),
  taskToken: z.string().optional(),
});
export type SubmissionMetadata = z.infer<typeof SubmissionMetadataSchema>;
