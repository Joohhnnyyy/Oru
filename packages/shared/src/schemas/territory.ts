import { z } from 'zod';

export const TerritoryMascotSchema = z.enum([
  'nilgai',    // Forest / Ridge
  'blackbuck', // River / Yamuna Wetland
  'peafowl',   // Urban Parks / Green Pockets
  'macaque',   // Dense Urban
  'jackal',    // Semi-Arid / Scrub
]);
export type TerritoryMascot = z.infer<typeof TerritoryMascotSchema>;

export interface MascotInfo {
  key: TerritoryMascot;
  nameEn: string;
  nameHi: string;
  habitatEn: string;
  habitatHi: string;
  colorHex: string;
}

export const MASCOT_REGISTRY: Record<TerritoryMascot, MascotInfo> = {
  nilgai: {
    key: 'nilgai',
    nameEn: 'Nilgai (Blue Bull)',
    nameHi: 'नीलगाय',
    habitatEn: 'Southern Ridge & Forest Corridors',
    habitatHi: 'दक्षिणी रिज और वन क्षेत्र',
    colorHex: '#10B981', // Emerald green
  },
  blackbuck: {
    key: 'blackbuck',
    nameEn: 'Blackbuck',
    nameHi: 'काला हिरण',
    habitatEn: 'Yamuna Floodplains & Wetlands',
    habitatHi: 'यमुना खादर और दलदली क्षेत्र',
    colorHex: '#06B6D4', // Cyan
  },
  peafowl: {
    key: 'peafowl',
    nameEn: 'Indian Peafowl',
    nameHi: 'भारतीय मोर',
    habitatEn: 'Urban Parks & Lutyens Green Belt',
    habitatHi: 'शहरी पार्क और लुटियंस हरित क्षेत्र',
    colorHex: '#3B82F6', // Blue
  },
  macaque: {
    key: 'macaque',
    nameEn: 'Rhesus Macaque',
    nameHi: 'बंदर',
    habitatEn: 'Dense Urban Hubs & Markets',
    habitatHi: 'घने शहरी केंद्र और बाजार',
    colorHex: '#F59E0B', // Amber
  },
  jackal: {
    key: 'jackal',
    nameEn: 'Golden Jackal',
    nameHi: 'सियार',
    habitatEn: 'Semi-Arid Scrublands & Outskirts',
    habitatHi: 'शुष्क झाड़ियां और बाहरी क्षेत्र',
    colorHex: '#8B5CF6', // Purple
  },
};

export const TerritoryMoodSchema = z.enum(['sick', 'recovering', 'thriving', 'legendary']);
export type TerritoryMood = z.infer<typeof TerritoryMoodSchema>;

export const TerritoryMetadataSchema = z.object({
  h3Index: z.string().min(1, 'H3 Index is required'),
  name: z.string().min(1, 'Territory name is required'),
  ward: z.string().min(1, 'Ward name is required'),
  mascot: TerritoryMascotSchema,
  health: z.number().int().min(0).max(100),
  mood: TerritoryMoodSchema,
  cleanIndex: z.number().min(0).max(10),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  boundary: z.array(z.tuple([z.number(), z.number()])).min(6), // Hexagon vertices [lat, lng]
});
export type TerritoryMetadata = z.infer<typeof TerritoryMetadataSchema>;
