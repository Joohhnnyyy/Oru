import { z } from 'zod';

export const QrSourceTypeSchema = z.enum([
  'dustbin_static',   // Fixed public municipal dustbin
  'truck_rotating',   // Mobile waste collection vehicle with rotating QR
  'ewaste_static',    // Authorized e-waste dropoff center
]);
export type QrSourceType = z.infer<typeof QrSourceTypeSchema>;

export const QrSourceSchema = z.object({
  sourceId: z.string().min(1, 'Source ID is required'),
  type: QrSourceTypeSchema,
  name: z.string().min(1, 'Source name is required'),
  h3TerritoryId: z.string().min(1, 'H3 territory ID is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  secretKey: z.string().min(8, 'Secret key must be at least 8 chars'),
  geofenceRadiusMeters: z.number().int().positive(),
  isActive: z.boolean().default(true),
});
export type QrSource = z.infer<typeof QrSourceSchema>;
