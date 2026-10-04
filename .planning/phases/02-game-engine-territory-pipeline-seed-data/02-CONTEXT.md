# Phase 2 Context: Game Engine, Territory Pipeline & Seed Data

## Purpose
Build the core computational engine and geospatial territory pipeline for SaafSafari:
1. Pure TypeScript Game Rules Engine (`packages/game-rules`) with 100% test coverage for Green Credits, XP, streak multipliers, task board generation, and territory health decay.
2. Uber H3 resolution 7 territory generation and land-cover classification pipeline for Delhi NCR.
3. DynamoDB and GeoJSON seed scripts to populate 60+ territories, 40 QR sources, 6 merchants, and 25 demo users with historical action records.

## Requirements Covered
- **MAP-01**: MapLibre compatible GeoJSON representation of H3 res-7 hexagonal cells colored by land-cover mascot.
- **MAP-02**: Territory details including current Health (0–100), active animal mascot, and 4 mood states (Sick, Recovering, Thriving, Legendary).
- **MAP-03**: Territory health decay formula (3% nightly) and health recalculation from verified civic actions.
- **TASK-01**: Deterministic task board generation: Daily (3 tasks: habit, T1, T2), Weekly (3 tasks), and Monthly (2 tasks + 1 territory goal).
- **TASK-02**: Deterministic seeded pure functions using `userId` and `periodKey` (e.g. `YYYY-MM-DD`, `YYYY-WW`, `YYYY-MM`) to guarantee idempotency.
- **CRED-01**: Green Credits (GC) and XP calculation with trust weights, capped multipliers (max 2.0x), and flat streak bonuses.

## Locked Architecture & Decisions Honored
- **DEC-04 (Pure Game Rules Engine):** Package `packages/game-rules` must have zero AWS SDK dependencies. All functions are pure, portable, deterministic, and unit-tested with Vitest.
- **DEC-05 (Uber H3 Resolution 7):** Territory hexagons in Delhi NCR use H3 resolution 7 (~5.16 km² area).
- **DEC-06 (Trust Ladder & Multipliers):**
  - Trust level weights: T0 (0.5x), T1 (1.0x), T2 (1.5x), T3 (2.0x).
  - Streak multipliers: +0.05x per day of streak up to max 1.5x.
  - Neighborhood/territory boost: +0.1x to +0.3x.
  - Total combined multiplier is hard-capped at 2.0x.
- **DEC-07 (Mascots & Mood States):**
  - Mood states: `sick` (0–30), `recovering` (31–60), `thriving` (61–85), `legendary` (86–100).
  - Mascots:
    - *Nilgai* (Forest / Ridge)
    - *Blackbuck* (River / Yamuna Wetland)
    - *Indian Peafowl* (Urban Parks / Green Pockets)
    - *Rhesus Macaque* (Dense Urban)
    - *Golden Jackal* (Semi-Arid / Scrub)
- **DEC-09 (Database Seed Script):** Automated seed script using `@aws-sdk/lib-dynamodb` batch writes populating `SaafSafariMain` in `ap-south-1`.
- **DEC-11 (Backend-First):** 100% backend focus. Client UI will consume the generated GeoJSON and seed data in Milestone 2.
