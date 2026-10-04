import { z } from 'zod';

export const LeaderboardTypeSchema = z.enum(['territory', 'citywide', 'territories']);
export type LeaderboardType = z.infer<typeof LeaderboardTypeSchema>;

export const LeaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  id: z.string().min(1),
  name: z.string().min(1),
  score: z.number().int().nonnegative(),
  mascot: z.string().optional(),
  mood: z.string().optional(),
  tier: z.string().optional(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const LeaderboardResponseSchema = z.object({
  type: LeaderboardTypeSchema,
  periodKey: z.string().min(1),
  territoryId: z.string().optional(),
  entries: z.array(LeaderboardEntrySchema),
  userRank: LeaderboardEntrySchema.optional(),
});
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;
