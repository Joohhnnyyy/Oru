# Roadmap: SaafSafari

## Overview

SaafSafari is engineered as an AWS-native, serverless civic gamification monorepo delivering an end-to-end verified loop: a user scans a waste pickup QR code or submits a photo, gets immediate Green Credits via an idempotent DynamoDB transaction, observes their local H3 territory's animal mascot evolve, and redeems credits for merchant coupons. The roadmap follows a strict 5-phase dependency sequence taking the project from foundational CDK infrastructure and Cognito authentication to the complete demo-ready submission with AI photo evaluation and municipal operations.

## Phases

- [ ] **Phase 1: Foundation, CDK Infrastructure & Authentication** - Monorepo scaffolding, CDK stacks, Cognito Email OTP auth, and shared Zod/type packages.
- [ ] **Phase 2: Game Engine, Territory Map & QR Verification (P0 Core Loop)** - Pure game math, H3 territory map, task board, static/rotating QR scan API, wallet, and coupon redemption.
- [ ] **Phase 3: Collector Mode & Live Tracking** - Mobile collector mode, Amazon Location live truck tracker, proximity check, and arrival push notifications.
- [ ] **Phase 4: AI Photo Proof Pipeline & Municipal Console** - Step Functions vision pipeline (Rekognition + Bedrock Nova Lite), hotspot bounties, and web admin console with review queue.
- [ ] **Phase 5: Leaderboards, Seed Data & Demo Polish** - Competitive individual/territory leaderboards, high-density Delhi NCR seed data, and 3-minute video rehearsal polish.

## Phase Details

### Phase 1: Foundation, CDK Infrastructure & Authentication
**Goal**: Provision the base AWS CDK infrastructure, establish monorepo workspaces, configure Cognito Email OTP authentication, and create shared domain packages.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Monorepo builds cleanly with pnpm (`infra`, `services/api`, `apps/web`, `apps/mobile`, `packages/shared`, `packages/game-rules`).
  2. CDK stacks (`AuthStack`, `DataStack`, `ApiStack`) deploy successfully to `ap-south-1`.
  3. A user can request and verify a passwordless email OTP code through Cognito and obtain a valid JWT session.
  4. Onboarding endpoint assigns user to an H3 res-7 cell based on provided GPS coordinates.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Monorepo setup, TypeScript configs, pnpm workspaces, and shared Zod/type contracts.
- [ ] 01-02: AWS CDK infrastructure stacks (Cognito User Pool, DynamoDB single-table, API Gateway HTTP API).
- [ ] 01-03: User onboarding Lambda handlers and Cognito Email OTP client integration.

### Phase 2: Game Engine, Territory Map & QR Verification (P0 Core Loop)
**Goal**: Build the P0 core loop: pure game rules engine, H3 territory map, task board generation, QR verification endpoint with geofence, credit transactions, wallet, and coupon redemption.
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, TASK-01, TASK-02, CRED-01, CRED-02, QR-01, QR-02, QR-03, WALT-01, WALT-02
**Success Criteria** (what must be TRUE):
  1. Pure math in `packages/game-rules` passes 100% of unit tests for credit calculations, multipliers, and daily health decay.
  2. Web and mobile map interfaces render interactive H3 hexagons with animal mascot mood indicators.
  3. Scanning a signed QR code against the API verifies geofence bounds and atomically updates balance, ledger, and task progress via `TransactWriteItems`.
  4. User can browse merchant coupons and execute an atomic redemption that deducts credits.
**Plans**: 4 plans

Plans:
- [ ] 02-01: Pure game rules engine implementation and comprehensive unit test suite in `packages/game-rules`.
- [ ] 02-02: Territory map visualization with MapLibre GL and H3 geometry rendering on web and mobile.
- [ ] 02-03: QR verification endpoint (`POST /v1/scans`), HMAC signature validation, and Amazon Location geofencing.
- [ ] 02-04: Wallet and coupon redemption APIs and UI components with conditional transaction safety.

### Phase 3: Collector Mode & Live Tracking
**Goal**: Build the mobile collector interface for truck drivers and kabadiwalas, stream device positions to Amazon Location Tracker, and trigger territory arrival notifications.
**Depends on**: Phase 2
**Requirements**: COL-01, COL-02, TRK-01
**Success Criteria** (what must be TRUE):
  1. Collector role user can activate Collector Mode in the mobile app, generating a dynamic rotating QR code with a 30-second TTL.
  2. Collector device streams GPS coordinates to Amazon Location Tracker in real time.
  3. Scan verification verifies user proximity (within 150 m) to collector's live coordinates and awards 2 GC collector reward.
  4. Moving garbage truck appears as a live icon on citizen maps, triggering arrival alerts upon entering their H3 cell.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Mobile Collector Mode UI with rotating HMAC QR generator and Amazon Location tracker streaming.
- [ ] 03-02: Proximity validation in `scanHandler` and EventBridge truck arrival alert pipeline.

### Phase 4: AI Photo Proof Pipeline & Municipal Console
**Goal**: Implement the AWS Step Functions photo verification pipeline (Rekognition + Bedrock Nova Lite), hotspot bounty reporting, and the web municipal admin console.
**Depends on**: Phase 3
**Requirements**: AI-01, AI-02, AI-03, HOT-01, HOT-02, ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. User can upload a photo proof to S3 via presigned URL with EXIF timestamp and GPS validation.
  2. Step Functions workflow checks Rekognition labels/moderation and prompts Bedrock Nova Lite to evaluate cleanup before/after photos.
  3. Ambiguous submissions pause in Step Functions and surface in the Municipal Console review queue for one-click admin approval/rejection.
  4. Citizen hotspot reports generate territory health penalties and spawn nearby bounty cleanup tasks.
  5. Ward admin console displays ward-level health heatmaps and manages registered QR codes with printable downloads.
**Plans**: 3 plans

Plans:
- [ ] 04-01: S3 presigned upload endpoint, metadata validation, and Step Functions AI verification state machine.
- [ ] 04-02: Citizen garbage hotspot reporting endpoint, validation logic, and bounty task auto-generation.
- [ ] 04-03: Web Municipal Console with MapLibre heatmap, QR source manager, and review queue with callback resolution.

### Phase 5: Leaderboards, Seed Data & Demo Polish
**Goal**: Build leaderboard services, generate rich seed datasets for Delhi NCR, and finalize the application for demo recording and judging.
**Depends on**: Phase 4
**Requirements**: LEAD-01, LEAD-02
**Success Criteria** (what must be TRUE):
  1. Leaderboard API queries DynamoDB GSIs to return territory, citywide, and territory-vs-territory weekly health gain rankings.
  2. Seed scripts populate 60+ Delhi NCR H3 territories, 40 QR sources, 6 merchants, and 25 active users with historical actions.
  3. End-to-end 3-minute demo script executes smoothly from sick mascot onboarding to live scan, mascot evolution, and coupon redemption.
**Plans**: 2 plans

Plans:
- [ ] 05-01: DynamoDB GSI leaderboard endpoints, caching, and leaderboard UI screens.
- [ ] 05-02: Comprehensive Delhi NCR seed data generation script and demo video flow verification.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, CDK Infrastructure & Authentication | 0/3 | Not started | - |
| 2. Game Engine, Territory Map & QR Verification | 0/4 | Not started | - |
| 3. Collector Mode & Live Tracking | 0/2 | Not started | - |
| 4. AI Photo Proof Pipeline & Municipal Console | 0/3 | Not started | - |
| 5. Leaderboards, Seed Data & Demo Polish | 0/2 | Not started | - |
