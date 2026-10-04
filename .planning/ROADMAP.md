# Roadmap: SaafSafari

## Overview

Following a strict **Backend-First Development Strategy** (DEC-11), all cloud infrastructure, data schemas, pure game rules, core APIs, asynchronous EventBridge/Step Functions workflows, and seed data pipelines will be completely built, deployed to AWS `ap-south-1`, and verified with end-to-end integration tests before any frontend (Web/Mobile) client application development begins. Once the backend foundation is validated live on AWS, client applications will be developed against the operational backend endpoints.

## Milestones

- 🚧 **Milestone 1: Backend & Infrastructure** - Phases 1–5 (Current Focus)
- 📋 **Milestone 2: Frontend Client Applications** - Phases 6–8 (Initialized after Backend completion)

---

## Milestone 1: Backend & Infrastructure

### Phase 1: Foundation, CDK Infrastructure & Authentication
**Goal**: Monorepo scaffolding, AWS CDK stacks (Auth, Data, Geo, Api), DynamoDB single-table design, Cognito Email OTP auth, and shared Zod/type contracts.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Monorepo builds cleanly with pnpm (`infra`, `services/api`, `packages/shared`, `packages/game-rules`).
  2. CDK stacks (`AuthStack`, `DataStack`, `GeoStack`, `ApiStack`) synthesize and deploy cleanly to `ap-south-1`.
  3. Cognito User Pool handles passwordless email OTP sign-in and issues valid JWTs.
  4. DynamoDB single-table schema with GSI1, GSI2, and TTL is provisioned.
**Plans**: 3 plans
- [ ] 01-01: Monorepo workspace setup, TypeScript configs, pnpm configuration, and shared domain contracts in `packages/shared`.
- [ ] 01-02: AWS CDK infrastructure stacks (Cognito User Pool, DynamoDB single-table, Amazon Location map/geofence/tracker, API Gateway HTTP API).
- [ ] 01-03: User authentication and onboarding Lambda handlers with Cognito Email OTP verification.

### Phase 2: Game Engine, Territory Pipeline & Seed Data
**Goal**: Pure game rules engine in `packages/game-rules` (100% unit-tested), Uber H3 territory generation script, and database seed scripts for territories, QR sources, merchants, and demo users.
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, TASK-01, TASK-02, CRED-01
**Success Criteria** (what must be TRUE):
  1. Pure credit calculations, multipliers, and health decay pass 100% of unit tests with vitest in `packages/game-rules`.
  2. Python/TypeScript script generates 60+ H3 res-7 Delhi NCR territories classified with animal mascots into GeoJSON and DynamoDB items.
  3. Database seed script populates 40 initial QR sources, 6 merchants, and 25 active users with historical actions.
**Plans**: 3 plans
- [ ] 02-01: Pure game rules engine implementation and comprehensive unit test suite in `packages/game-rules`.
- [ ] 02-02: Delhi NCR OSM to Uber H3 res-7 territory classification and GeoJSON generator.
- [ ] 02-03: DynamoDB seed scripts for territories, QR sources, merchants, and demo users.

### Phase 3: Core API Services, QR Verification & Ledger
**Goal**: Implement and test all core REST endpoints: user profile, task boards, static/rotating QR scan verification, atomic credit ledger transactions, wallet, and coupon redemption.
**Depends on**: Phase 2
**Requirements**: CRED-02, QR-01, QR-02, QR-03, COL-01, COL-02, TRK-01, WALT-01, WALT-02, LEAD-01, LEAD-02
**Success Criteria** (what must be TRUE):
  1. `POST /v1/scans` verifies static QR signatures and checks Amazon Location geofence (within 75 m).
  2. `POST /v1/scans` verifies collector rotating QR tokens (30s TTL) and checks Amazon Location Tracker distance (within 150 m).
  3. All balance modifications execute via idempotent `TransactWriteItems`, atomically updating user balance, ledger, and collector rewards.
  4. Endpoints for `/v1/me`, `/v1/tasks`, `/v1/wallet`, `/v1/coupons/redeem`, and `/v1/leaderboards` respond with valid schema outputs.
**Plans**: 3 plans
- [ ] 03-01: Core user, periodic task assignment, and leaderboard Lambda handlers.
- [ ] 03-02: QR verification Lambda handler with HMAC verification, Amazon Location geofencing, and proximity checks.
- [ ] 03-03: Wallet and coupon redemption Lambda handlers with conditional DynamoDB transaction guarantees.

### Phase 4: Async Workflows, AI Photo Pipeline & Admin Services
**Goal**: Implement S3 presigned proof upload, Step Functions AI verification pipeline (Rekognition + Bedrock Nova Lite), EventBridge nightly health decay scheduler, and municipal admin endpoints.
**Depends on**: Phase 3
**Requirements**: AI-01, AI-02, AI-03, HOT-01, HOT-02, ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. `POST /v1/submissions` provides presigned S3 PUT URL and records submission metadata.
  2. Step Functions workflow triggers on upload, executes Rekognition moderation/labels, calls Bedrock Nova Lite, and auto-approves or enqueues for review.
  3. Municipal admin endpoints (`/v1/admin/review-queue`, `/v1/admin/qr-sources`, `/v1/admin/bounties`) execute with Cedar authorization.
  4. EventBridge Scheduler executes nightly 3% territory health decay and triggers daily task rotation.
**Plans**: 3 plans
- [ ] 04-01: S3 presigned upload handler and Step Functions AI verification state machine with Bedrock Nova Lite.
- [ ] 04-02: Hotspot reporting, validation, and automated bounty task generation handlers.
- [ ] 04-03: Municipal admin APIs with Cedar authorization, QR source management, and human-in-the-loop review queue resolution.

### Phase 5: Backend Deployment & Integration Verification
**Goal**: Complete live deployment of all backend CDK stacks to AWS `ap-south-1` and run an automated end-to-end integration test suite validating every endpoint against live AWS resources.
**Depends on**: Phase 4
**Requirements**: AUTH-01, QR-01, QR-02, CRED-02, WALT-02, AI-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. Full backend stack deployed to AWS `ap-south-1` with zero local mock dependencies.
  2. Automated test suite runs against the deployed API Gateway endpoint: creates user, executes QR scan, verifies credit transaction in DynamoDB, and redeems a coupon.
  3. Photo proof submitted to deployed S3 bucket completes Step Functions execution and calls Bedrock live.
  4. Backend sign-off complete: Backend is 100% operational and ready for frontend initialization.
**Plans**: 2 plans
- [ ] 05-01: Complete AWS CDK deployment pipeline and environment configuration for `ap-south-1`.
- [ ] 05-02: Automated integration test harness executing end-to-end verification across all deployed endpoints.

---

## Milestone 2: Frontend Client Applications

### Phase 6: Web Applications (Citizen Portal & Municipal Console)
**Goal**: Build Vite + React 19 + Tailwind web apps: Citizen portal (onboarding, map, wallet, coupons) and Municipal Admin Console (heatmap, QR registry, review queue), deployed to AWS Amplify Hosting.
**Depends on**: Phase 5 (Backend Complete)
**Requirements**: MAP-01, MAP-02, WALT-01, WALT-02, ADM-01, ADM-02, ADM-03, LEAD-01, LEAD-02
**Plans**: 3 plans
- [ ] 06-01: Citizen web portal layout, authentication integration, and interactive MapLibre H3 territory map.
- [ ] 06-02: Task board, wallet, coupon redemption, and leaderboard web UI.
- [ ] 06-03: Municipal Admin Console with hotspot heatmap, QR source manager, review queue, and Amplify Hosting deployment.

### Phase 7: Mobile Application (Citizen & Collector Modes)
**Goal**: Build Expo React Native mobile app with camera QR scanning, bi-modal collector mode with rotating QR display and live GPS streaming, and build EAS Android APK.
**Depends on**: Phase 5 (Backend Complete)
**Requirements**: AUTH-01, QR-01, QR-02, COL-01, COL-02, TRK-01
**Plans**: 3 plans
- [ ] 07-01: Expo mobile app setup, Cognito auth integration, and home territory map screen.
- [ ] 07-02: Camera QR scanner, task completion flow, and photo proof submission.
- [ ] 07-03: Collector Mode with rotating HMAC QR generator, Amazon Location background GPS streaming, and EAS APK build.

### Phase 8: Demo Rehearsal & Submission Polish
**Goal**: Full end-to-end rehearsal across mobile, web, and municipal console; recording of the 3-minute demo video; architecture diagram asset generation; and AWS Builder Center blog post draft.
**Depends on**: Phase 6, Phase 7
**Requirements**: All v1 requirements
**Plans**: 2 plans
- [ ] 08-01: End-to-end flow dry-run with seeded Delhi NCR scenario (sick dolphin → verified scan & photo → evolving mascot → coupon redemption → municipal heatmap update).
- [ ] 08-02: 3-minute recorded video production, architecture slide diagrams, and hackathon submission packaging.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation, CDK Infrastructure & Auth | M1 (Backend) | 0/3 | Not started | - |
| 2. Game Engine, Territory Pipeline & Seed | M1 (Backend) | 0/3 | Not started | - |
| 3. Core API Services, QR Verification & Ledger | M1 (Backend) | 0/3 | Not started | - |
| 4. Async Workflows, AI Photo Pipeline & Admin | M1 (Backend) | 0/3 | Not started | - |
| 5. Backend Deployment & Integration Verification | M1 (Backend) | 0/2 | Not started | - |
| 6. Web Applications (Citizen & Municipal) | M2 (Frontend) | 0/3 | Not started | - |
| 7. Mobile Application (Citizen & Collector) | M2 (Frontend) | 0/3 | Not started | - |
| 8. Demo Rehearsal & Submission Polish | M2 (Frontend) | 0/2 | Not started | - |
