import { z } from 'zod';

export const TaskPeriodSchema = z.enum(['daily', 'weekly', 'monthly']);
export type TaskPeriod = z.infer<typeof TaskPeriodSchema>;

export const TaskItemSchema = z.object({
  id: z.string().min(1),
  period: TaskPeriodSchema,
  actionType: z.string().min(1),
  titleEn: z.string().min(1),
  titleHi: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionHi: z.string().min(1),
  targetCount: z.number().int().positive(),
  rewardGC: z.number().int().positive(),
  rewardXP: z.number().int().positive(),
  isTerritoryGoal: z.boolean().optional(),
});
export type TaskItem = z.infer<typeof TaskItemSchema>;

export const TaskProgressSchema = TaskItemSchema.extend({
  currentCount: z.number().int().nonnegative().default(0),
  completed: z.boolean().default(false),
});
export type TaskProgress = z.infer<typeof TaskProgressSchema>;

export const TaskBoardResponseSchema = z.object({
  daily: z.array(TaskProgressSchema),
  weekly: z.array(TaskProgressSchema),
  monthly: z.array(TaskProgressSchema),
  streakDays: z.number().int().nonnegative(),
  lastHabitCheckInDate: z.string().optional(),
});
export type TaskBoardResponse = z.infer<typeof TaskBoardResponseSchema>;

export const HabitCheckInResponseSchema = z.object({
  success: z.boolean(),
  creditsEarned: z.number().int().nonnegative(),
  xpEarned: z.number().int().nonnegative(),
  newBalanceGC: z.number().int().nonnegative(),
  newLifetimeXP: z.number().int().nonnegative(),
  streakDays: z.number().int().positive(),
  message: z.string().optional(),
});
export type HabitCheckInResponse = z.infer<typeof HabitCheckInResponseSchema>;
