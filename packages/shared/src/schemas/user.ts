import { z } from 'zod';

export const UserLanguageSchema = z.enum(['en', 'hi']);
export type UserLanguage = z.infer<typeof UserLanguageSchema>;

export const UserRoleSchema = z.enum(['citizen', 'collector', 'ward_admin', 'merchant']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const OnboardingRequestSchema = z.object({
  language: UserLanguageSchema,
  latitude: z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90'),
  longitude: z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
});
export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;

export const UserProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  language: UserLanguageSchema,
  homeTerritoryId: z.string().min(1, 'Home territory ID is required'),
  balanceGC: z.number().int().nonnegative('Green Credits balance must be non-negative'),
  lifetimeXP: z.number().int().nonnegative('Lifetime XP must be non-negative'),
  streakDays: z.number().int().nonnegative('Streak days must be non-negative'),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateUserPreferencesSchema = z.object({
  language: UserLanguageSchema.optional(),
});
export type UpdateUserPreferences = z.infer<typeof UpdateUserPreferencesSchema>;
