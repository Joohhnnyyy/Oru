import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import * as h3 from 'h3-js';
import {
  generateDelhiTerritories,
  generateTerritoriesGeoJson,
  classifyMascot,
} from '../territory-pipeline.js';
import { TerritoryMetadataSchema } from '@saafsafari/shared';

describe('Game Rules: Delhi NCR Territory Pipeline', () => {
  const territories = generateDelhiTerritories();
  const geojson = generateTerritoriesGeoJson(territories);

  it('generates at least 60 authentic H3 resolution-7 territories in Delhi NCR', () => {
    expect(territories.length).toBeGreaterThanOrEqual(60);

    // Verify each is a valid H3 resolution-7 cell
    territories.forEach((t) => {
      expect(h3.isValidCell(t.h3Index)).toBe(true);
      expect(h3.getResolution(t.h3Index)).toBe(7);
      expect(t.name).toBeDefined();
      expect(t.ward).toBeDefined();
    });
  });

  it('validates each territory against TerritoryMetadataSchema', () => {
    territories.forEach((t) => {
      const parsed = TerritoryMetadataSchema.safeParse(t);
      expect(parsed.success).toBe(true);
    });
  });

  it('accurately maps health scores to mood states', () => {
    territories.forEach((t) => {
      if (t.health <= 30) {
        expect(t.mood).toBe('sick');
      } else if (t.health <= 60) {
        expect(t.mood).toBe('recovering');
      } else if (t.health <= 85) {
        expect(t.mood).toBe('thriving');
      } else {
        expect(t.mood).toBe('legendary');
      }
    });
  });

  it('represents all 5 regional mascots across Delhi NCR ecosystems', () => {
    const mascots = new Set(territories.map((t) => t.mascot));
    expect(mascots.has('nilgai')).toBe(true);
    expect(mascots.has('blackbuck')).toBe(true);
    expect(mascots.has('peafowl')).toBe(true);
    expect(mascots.has('macaque')).toBe(true);
    expect(mascots.has('jackal')).toBe(true);
  });

  it('generates valid MapLibre GeoJSON FeatureCollection with closed polygon rings', () => {
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features.length).toBe(territories.length);

    geojson.features.forEach((feature) => {
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Polygon');
      const ring = feature.geometry.coordinates[0];
      expect(ring.length).toBeGreaterThanOrEqual(7); // Hexagon + closed point

      // Verify closed ring: first == last
      const first = ring[0];
      const last = ring[ring.length - 1];
      expect(first[0]).toBe(last[0]);
      expect(first[1]).toBe(last[1]);

      // Check properties
      expect(feature.properties).toBeDefined();
      expect(feature.properties?.mascotColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(feature.properties?.mascotNameEn).toBeDefined();
      expect(feature.properties?.mascotNameHi).toBeDefined();
    });

    // Save GeoJSON artifact for MapLibre client consumption
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const outputPath = path.join(dataDir, 'delhi-territories.geojson');
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), 'utf-8');
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
