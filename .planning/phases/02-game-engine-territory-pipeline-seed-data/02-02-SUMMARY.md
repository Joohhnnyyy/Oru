# Plan 02-02 Summary: Delhi NCR Territory Classification & GeoJSON Pipeline

## Overview
Built the geospatial territory generation and land-cover mascot classification pipeline for Delhi NCR. Generated 68 authentic municipal neighborhood territories indexed at Uber H3 resolution 7 (~5.16 km² area), mapped each to one of 5 regional animal mascots with mood states, and exported a MapLibre-ready GeoJSON FeatureCollection artifact.

## Key Deliverables
- **Territory Zod Schemas (`packages/shared/src/schemas/territory.ts`):**
  - `TerritoryMascotSchema`: `nilgai`, `blackbuck`, `peafowl`, `macaque`, `jackal`.
  - `MASCOT_REGISTRY`: Localized English/Hindi names, habitat descriptions, and UI hex color tokens for all 5 mascots.
  - `TerritoryMoodSchema`: `sick`, `recovering`, `thriving`, `legendary`.
  - `TerritoryMetadataSchema`: Validates `h3Index`, `name`, `ward`, `mascot`, `health`, `mood`, `cleanIndex`, center coordinates, and polygon boundary coordinates.
- **Delhi NCR Territory Pipeline (`packages/game-rules/src/territory-pipeline.ts`):**
  - Curated 68 authentic Delhi NCR municipal neighborhoods across NDMC, MCD South, MCD North, MCD East, MCD Central, MCD West, and Cantonment.
  - Ecosystem land-cover classifier:
    - *Blackbuck*: Yamuna River floodplains and wetland corridors.
    - *Nilgai*: Southern Ridge, Tughlakabad, and Asola Bhatti forest fringe.
    - *Indian Peafowl*: Central Lutyens, Lodhi Gardens, and urban green spaces.
    - *Rhesus Macaque*: Historic dense urban hubs (Chandni Chowk, Karol Bagh, Paharganj).
    - *Golden Jackal*: Semi-arid scrublands and outer fringes (Najafgarh, Narela, Bawana).
  - Health seed distribution spanning all 4 mood states (healths 22–93).
- **MapLibre-Ready GeoJSON (`packages/game-rules/src/data/delhi-territories.geojson`):**
  - 80KB valid GeoJSON `FeatureCollection` with closed polygon rings formatted in `[lng, lat]` coordinates.
  - Embedded properties for client rendering: mascot details, theme colors, health, mood, and clean index.
- **Verification:**
  - 5/5 Vitest unit tests in `packages/game-rules/src/tests/territory-pipeline.test.ts`.
  - Total 20/20 tests passing in `@saafsafari/game-rules`.
