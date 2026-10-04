import { z } from 'zod';

export const LiveTruckSchema = z.object({
  truckId: z.string(),
  sourceId: z.string(),
  name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  h3TerritoryId: z.string(),
  lastUpdated: z.string(),
  status: z.enum(['active', 'idle']),
});
export type LiveTruck = z.infer<typeof LiveTruckSchema>;

export const LiveTrucksResponseSchema = z.object({
  trucks: z.array(LiveTruckSchema),
  count: z.number().int().nonnegative(),
  timestamp: z.string(),
});
export type LiveTrucksResponse = z.infer<typeof LiveTrucksResponseSchema>;
