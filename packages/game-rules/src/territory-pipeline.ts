import * as h3 from 'h3-js';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import {
  TerritoryMetadata,
  TerritoryMascot,
  MASCOT_REGISTRY,
} from '@saafsafari/shared';
import { getMoodState } from './health.js';

// Curated authentic Delhi NCR municipal neighborhoods
export const DELHI_NEIGHBORHOODS: Array<{ name: string; ward: string; baseLat: number; baseLng: number }> = [
  { name: 'Connaught Place', ward: 'NDMC Central', baseLat: 28.6315, baseLng: 77.2167 },
  { name: 'Lodhi Gardens & Khan Market', ward: 'NDMC South', baseLat: 28.5933, baseLng: 77.2197 },
  { name: 'India Gate & Lutyens', ward: 'NDMC Central', baseLat: 28.6129, baseLng: 77.2295 },
  { name: 'Chanakyapuri Diplomatic Enclave', ward: 'NDMC West', baseLat: 28.5983, baseLng: 77.1856 },
  { name: 'Hauz Khas & Deer Park', ward: 'MCD South 34', baseLat: 28.5494, baseLng: 77.2001 },
  { name: 'Green Park & Safdarjung', ward: 'MCD South 35', baseLat: 28.5589, baseLng: 77.2075 },
  { name: 'Lajpat Nagar Central Market', ward: 'MCD South 38', baseLat: 28.5677, baseLng: 77.2433 },
  { name: 'Greater Kailash 1 & 2', ward: 'MCD South 42', baseLat: 28.5397, baseLng: 77.2384 },
  { name: 'Saket & Select Citywalk', ward: 'MCD South 45', baseLat: 28.5244, baseLng: 77.2167 },
  { name: 'Vasant Kunj Forest Fringe', ward: 'MCD South 48', baseLat: 28.5190, baseLng: 77.1578 },
  { name: 'Asola Bhatti Sanctuary Gate', ward: 'MCD South 51', baseLat: 28.4855, baseLng: 77.2290 },
  { name: 'Tughlakabad Fort Ridge', ward: 'MCD South 53', baseLat: 28.5089, baseLng: 77.2600 },
  { name: 'Nehru Place Electronics Hub', ward: 'MCD South 40', baseLat: 28.5494, baseLng: 77.2528 },
  { name: 'Okhla Industrial Area Phase 1', ward: 'MCD South 44', baseLat: 28.5284, baseLng: 77.2785 },
  { name: 'Kalkaji & Lotus Temple', ward: 'MCD South 41', baseLat: 28.5478, baseLng: 77.2589 },
  { name: 'Chandni Chowk Heritage', ward: 'MCD North 12', baseLat: 28.6562, baseLng: 77.2300 },
  { name: 'Red Fort & Daryaganj', ward: 'MCD North 14', baseLat: 28.6500, baseLng: 77.2400 },
  { name: 'Civil Lines & Delhi University', ward: 'MCD North 08', baseLat: 28.6833, baseLng: 77.2167 },
  { name: 'Kamla Nagar & Ridge Campus', ward: 'MCD North 09', baseLat: 28.6792, baseLng: 77.2025 },
  { name: 'Karol Bagh Market', ward: 'MCD Central 18', baseLat: 28.6517, baseLng: 77.1906 },
  { name: 'Paharganj Urban Core', ward: 'MCD Central 17', baseLat: 28.6433, baseLng: 77.2144 },
  { name: 'Rajendra Nagar & Pusa Ridge', ward: 'MCD Central 19', baseLat: 28.6400, baseLng: 77.1750 },
  { name: 'Mayur Vihar Phase 1 Wetlands', ward: 'MCD East 22', baseLat: 28.6080, baseLng: 77.2950 },
  { name: 'Mayur Vihar Phase 2', ward: 'MCD East 23', baseLat: 28.6189, baseLng: 77.3089 },
  { name: 'Laxmi Nagar Commercial Hub', ward: 'MCD East 25', baseLat: 28.6300, baseLng: 77.2778 },
  { name: 'Akshardham Yamuna Bank', ward: 'MCD East 21', baseLat: 28.6127, baseLng: 77.2773 },
  { name: 'Preet Vihar & Karkardooma', ward: 'MCD East 27', baseLat: 28.6419, baseLng: 77.2969 },
  { name: 'Shahdara Heritage Quarter', ward: 'MCD East 29', baseLat: 28.6739, baseLng: 77.2894 },
  { name: 'Yamuna Vihar Riverside', ward: 'MCD East 31', baseLat: 28.7056, baseLng: 77.2722 },
  { name: 'Dwarka Sector 6 & 10', ward: 'MCD West 62', baseLat: 28.5833, baseLng: 77.0500 },
  { name: 'Dwarka Sector 21 Transportation Hub', ward: 'MCD West 65', baseLat: 28.5522, baseLng: 77.0583 },
  { name: 'Janakpuri District Center', ward: 'MCD West 58', baseLat: 28.6219, baseLng: 77.0878 },
  { name: 'Tilak Nagar Market', ward: 'MCD West 57', baseLat: 28.6364, baseLng: 77.0964 },
  { name: 'Rajouri Garden Central', ward: 'MCD West 55', baseLat: 28.6492, baseLng: 77.1219 },
  { name: 'Punjabi Bagh Green Enclave', ward: 'MCD West 52', baseLat: 28.6683, baseLng: 77.1300 },
  { name: 'Pitampura TV Tower', ward: 'MCD North-West 71', baseLat: 28.6989, baseLng: 77.1406 },
  { name: 'Rohini Sector 7 & 8', ward: 'MCD North-West 75', baseLat: 28.7119, baseLng: 77.1200 },
  { name: 'Rohini Sector 15 & 16', ward: 'MCD North-West 78', baseLat: 28.7300, baseLng: 77.1278 },
  { name: 'Model Town & Naini Lake', ward: 'MCD North 05', baseLat: 28.7025, baseLng: 77.1939 },
  { name: 'Shalimar Bagh Orchards', ward: 'MCD North-West 73', baseLat: 28.7153, baseLng: 77.1644 },
  { name: 'Paschim Vihar Outer Ring', ward: 'MCD West 60', baseLat: 28.6667, baseLng: 77.0917 },
  { name: 'Najafgarh Rural Fringe', ward: 'MCD South-West 82', baseLat: 28.6089, baseLng: 76.9856 },
  { name: 'Narela Industrial Ward', ward: 'MCD North 88', baseLat: 28.8525, baseLng: 77.0928 },
  { name: 'Bawana Clean Green Belt', ward: 'MCD North 86', baseLat: 28.7981, baseLng: 77.0325 },
  { name: 'Alipur Heritage GT Road', ward: 'MCD North 84', baseLat: 28.8000, baseLng: 77.1333 },
  { name: 'Mehrauli Archaeological Park', ward: 'MCD South 47', baseLat: 28.5200, baseLng: 77.1850 },
  { name: 'Sultanpur Bird Corridor South', ward: 'MCD South-West 90', baseLat: 28.4900, baseLng: 77.1200 },
  { name: 'Sonia Vihar Water Works', ward: 'MCD North-East 15', baseLat: 28.7250, baseLng: 77.2500 },
  { name: 'Sarita Vihar & Jasola', ward: 'MCD South 43', baseLat: 28.5300, baseLng: 77.2950 },
  { name: 'Badarpur Border Green Hub', ward: 'MCD South 46', baseLat: 28.5000, baseLng: 77.3000 },
  { name: 'CR Park Bengali Colony', ward: 'MCD South 39', baseLat: 28.5400, baseLng: 77.2500 },
  { name: 'Vasant Vihar Embassy Belt', ward: 'MCD South 36', baseLat: 28.5600, baseLng: 77.1600 },
  { name: 'RK Puram Government Quarters', ward: 'MCD South 37', baseLat: 28.5700, baseLng: 77.1800 },
  { name: 'Moti Bagh & Shanti Path', ward: 'NDMC South-West', baseLat: 28.5800, baseLng: 77.1700 },
  { name: 'Dhaula Kuan Army Ridge', ward: 'Cantonment 01', baseLat: 28.5950, baseLng: 77.1550 },
  { name: 'Delhi Cantonment Sadar Bazar', ward: 'Cantonment 02', baseLat: 28.6000, baseLng: 77.1300 },
  { name: 'Naraina Industrial Area', ward: 'MCD West 54', baseLat: 28.6250, baseLng: 77.1400 },
  { name: 'Kirti Nagar Furniture Market', ward: 'MCD West 53', baseLat: 28.6500, baseLng: 77.1450 },
  { name: 'Patel Nagar East', ward: 'MCD Central 20', baseLat: 28.6550, baseLng: 77.1650 },
  { name: 'Shadipur Depot Hub', ward: 'MCD Central 16', baseLat: 28.6500, baseLng: 77.1550 },
  { name: 'Jangpura & Nizamuddin Dargah', ward: 'MCD South 33', baseLat: 28.5850, baseLng: 77.2450 },
  { name: 'Sunder Nursery Ecological Park', ward: 'MCD South 32', baseLat: 28.5950, baseLng: 77.2450 },
  { name: 'Pragati Maidan & Bharat Mandapam', ward: 'NDMC East', baseLat: 28.6180, baseLng: 77.2420 },
  { name: 'ITO Press Enclave', ward: 'MCD Central 15', baseLat: 28.6300, baseLng: 77.2400 },
  { name: 'Geeta Colony Riverfront', ward: 'MCD East 24', baseLat: 28.6480, baseLng: 77.2700 },
  { name: 'Gandhi Nagar Garment Hub', ward: 'MCD East 26', baseLat: 28.6600, baseLng: 77.2700 },
  { name: 'Dilshad Garden Health Hub', ward: 'MCD East 30', baseLat: 28.6850, baseLng: 77.3150 },
  { name: 'Anand Vihar Railway & Bus Terminal', ward: 'MCD East 28', baseLat: 28.6500, baseLng: 77.3150 },
];

/**
 * Classifies dominant mascot based on geographic location and eco-corridors
 */
export function classifyMascot(lat: number, lng: number): TerritoryMascot {
  // 1. River Yamuna corridor & wetlands -> Blackbuck
  if (lng >= 77.23 && lng <= 77.33 && lat >= 28.58 && lat <= 28.73) {
    return 'blackbuck';
  }

  // 2. Southern Ridge & Asola Bhatti Forest -> Nilgai (Blue Bull)
  if (lat <= 28.53 && lng <= 77.25) {
    return 'nilgai';
  }

  // 3. Central Lutyens, Lodhi, Chanakyapuri Green Pockets -> Indian Peafowl
  if (lat >= 28.56 && lat <= 28.64 && lng >= 77.16 && lng <= 77.24) {
    return 'peafowl';
  }

  // 4. Dense Historic & Commercial Urban Markets -> Rhesus Macaque
  if (lat >= 28.63 && lat <= 28.69 && lng >= 77.18 && lng <= 77.28) {
    return 'macaque';
  }

  // 5. Semi-arid outskirts, scrublands, western fringe -> Golden Jackal
  return 'jackal';
}

/**
 * Predefined realistic health scores across Delhi territories to showcase all 4 mood states
 */
const HEALTH_SEED_DISTRIBUTION = [
  78, 88, 92, 72, 84, 68, 54, 76, 62, 82, 28, 48, 64, 25, 58, 22, 38, 70, 65, 45,
  35, 60, 52, 66, 32, 74, 59, 29, 44, 79, 81, 71, 55, 63, 77, 85, 87, 89, 73, 67,
  56, 31, 26, 42, 49, 83, 90, 39, 47, 34, 75, 86, 69, 80, 91, 93, 57, 51, 61, 53,
  68, 84, 82, 77, 43, 37, 50, 46,
];

/**
 * Generates comprehensive Delhi NCR H3 resolution-7 territory metadata
 */
export function generateDelhiTerritories(): TerritoryMetadata[] {
  const territories: TerritoryMetadata[] = [];
  const seenH3 = new Set<string>();

  for (let i = 0; i < DELHI_NEIGHBORHOODS.length; i++) {
    const item = DELHI_NEIGHBORHOODS[i];
    const h3Index = h3.latLngToCell(item.baseLat, item.baseLng, 7);

    // If duplicate hex from proximity, skip to ensure unique H3 cells
    if (seenH3.has(h3Index)) {
      continue;
    }
    seenH3.add(h3Index);

    // Get exact center of H3 cell
    const [centerLat, centerLng] = h3.cellToLatLng(h3Index);

    // Get polygon vertices [ [lat, lng], ... ]
    const boundary = h3.cellToBoundary(h3Index, false) as Array<[number, number]>;

    const mascot = classifyMascot(centerLat, centerLng);
    const health = HEALTH_SEED_DISTRIBUTION[i % HEALTH_SEED_DISTRIBUTION.length];
    const mood = getMoodState(health);
    const cleanIndex = Number((health / 10).toFixed(1));

    territories.push({
      h3Index,
      name: item.name,
      ward: item.ward,
      mascot,
      health,
      mood,
      cleanIndex,
      centerLat: Number(centerLat.toFixed(5)),
      centerLng: Number(centerLng.toFixed(5)),
      boundary,
    });
  }

  return territories;
}

/**
 * Converts territory metadata into standard GeoJSON FeatureCollection for MapLibre rendering
 */
export function generateTerritoriesGeoJson(territories: TerritoryMetadata[]): FeatureCollection<Polygon> {
  const features: Feature<Polygon>[] = territories.map((t) => {
    const mascotInfo = MASCOT_REGISTRY[t.mascot];

    // GeoJSON coordinates MUST be [lng, lat]
    const coordinates: [number, number][][] = [
      t.boundary.map(([lat, lng]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]),
    ];

    // Close the polygon if not closed
    const first = coordinates[0][0];
    const last = coordinates[0][coordinates[0].length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates[0].push([first[0], first[1]]);
    }

    return {
      type: 'Feature',
      id: t.h3Index,
      geometry: {
        type: 'Polygon',
        coordinates,
      },
      properties: {
        h3Index: t.h3Index,
        name: t.name,
        ward: t.ward,
        mascot: t.mascot,
        mascotNameEn: mascotInfo.nameEn,
        mascotNameHi: mascotInfo.nameHi,
        mascotHabitatEn: mascotInfo.habitatEn,
        mascotColor: mascotInfo.colorHex,
        health: t.health,
        mood: t.mood,
        cleanIndex: t.cleanIndex,
        centerLat: t.centerLat,
        centerLng: t.centerLng,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export type { TerritoryMetadata };
export const DELHI_TERRITORIES: TerritoryMetadata[] = generateDelhiTerritories();
