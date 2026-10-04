# SaafSafari

## What This Is

SaafSafari is a gamified, territory-based civic engagement platform built for Indian cities where citizens complete and verify daily waste segregation and energy conservation actions in their neighbourhood. By scanning QR codes on garbage trucks, public bins, and kabadiwala carts, or submitting AI-verified photos of cleanups and home segregation, citizens earn Green Credits redeemable for local coupons, while their local territory's indigenous Indian animal mascot visibly evolves from Sick to Legendary as the neighbourhood cleans up.

## Core Value

Verifiable civic waste and energy actions directly tied to immediate, local feedback: a real-world scan or photo instantly awards credits, moves territory health, evolves an animal mascot, and unlocks community rewards.

## Business Context

- **Event**: Environmental Hacks — WeMakeDevs × AWS Bharat Builds Tour Event 02 (Oct 8–11, 2026).
- **Track**: Track 03 — Waste and Energy ("What we throw away, and how we power what we keep").
- **Target Users**: Urban Indian citizens, informal waste collectors (kabadiwalas, truck drivers), and municipal ward officers/RWAs.
- **Success Metric**: 100% working deployed flow on AWS (scan → credit → mascot evolution → coupon redemption) captured in a compelling 3-minute video demo.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH-01**: Cognito email OTP passwordless login and Google OAuth federation.
- [ ] **MAP-01**: Uber H3 resolution-7 hexagonal territory map with animal mascot indicators.
- [ ] **TASK-01**: Dynamic server-generated daily, weekly, and monthly civic action tasks.
- [ ] **QR-01**: Static signed QR verification with Amazon Location geofencing (bins, e-waste points).
- [ ] **QR-02**: Dynamic rotating HMAC QR verification with collector live proximity checks (trucks, kabadiwalas).
- [ ] **CRED-01**: Idempotent transactional Green Credit (GC) and XP ledger using DynamoDB TransactWriteItems.
- [ ] **WALT-01**: Wallet interface and atomic coupon redemption with demo partner merchants.
- [ ] **HLTH-01**: Asynchronous territory health tracking (0–100) via DynamoDB Streams and nightly 3% decay.
- [ ] **COL-01**: Collector mobile mode with 30-second rotating QR tokens and collector credit incentives.
- [ ] **TRK-01**: Live garbage truck tracking on map via Amazon Location Tracker and territory arrival events.
- [ ] **AI-01**: Multi-stage photo verification pipeline (S3 → Step Functions → Rekognition + Bedrock Nova Lite).
- [ ] **HOT-01**: Garbage vulnerable point (hotspot) reporting and automatic bounty task generation.
- [ ] **ADM-01**: Municipal ward console for territory health heatmaps, QR source registration, and review queue.
- [ ] **LEAD-01**: Weekly territory, citywide, and territory-vs-territory competitive leaderboards.

### Out of Scope

- **Real monetary transactions / carbon credit trading**: Unverifiable claims; focus is strictly on verified civic actions and merchant coupons.
- **Native iOS application**: Web app + Expo Android APK is sufficient for judging and demo recording.
- **Custom ML model training**: Utilize turnkey AWS Bedrock (Nova Lite) and Rekognition APIs.
- **Multi-city deployment**: Restrict demo scope to Delhi NCR (East Delhi & Ghaziabad) with high-density seed data.
- **SMS OTP**: TRAI DLT registration in India has multi-week lead times; use passwordless Email OTP instead.
- **Costly continuous AWS services**: NAT Gateway, EC2, RDS/Aurora, ElastiCache, OpenSearch, Kinesis, and Pinpoint are banned to stay within free credits.

## Context

- Indian cities generate ~1.5 lakh+ tonnes of municipal solid waste daily, where source segregation compliance is low and informal recyclers remain unintegrated into municipal records.
- Bharat Builds evaluation emphasizes deep native AWS service integration (Cognito, Location Service, Bedrock, DynamoDB, CDK, Step Functions, Powertools) over shallow multi-cloud or mock-heavy prototypes.
- The repository is organized as a pnpm monorepo containing `apps/web`, `apps/mobile`, `services/api`, `infra`, and shared packages (`game-rules`, `shared`, `ui-tokens`).

## Constraints

- **Tech Stack**: TypeScript, Node.js 22 (arm64) AWS Lambdas, API Gateway HTTP API, DynamoDB single-table, AWS CDK, React 19, Expo React Native.
- **Budget / Cloud Limits**: AWS Free Plan account with up to $200 in credits in region `ap-south-1` (Mumbai).
- **Latency / Trust**: Verification trust ladder enforces strict weight multipliers (rotating QR 1.2, static 1.0, AI photo 1.0, self-declared 0.5 capped at 15 GC/day).
- **Security & RBAC**: Fine-grained authorization enforced via AWS Cedar (`@cedar-policy/cedar-wasm`) within Lambda functions.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| DEC-01: Cognito Email OTP + Google Sign-In | Indian SMS OTP requires lengthy TRAI DLT registration; Email OTP is instant and zero cost | ✓ Good |
| DEC-02: Serverless Node.js 22 Lambdas + CDK | Rapid iteration, TypeScript end-to-end, zero idle server cost | ✓ Good |
| DEC-03: Single-Table DynamoDB + TransactWriteItems | Atomic credit balance and ledger updates prevent double-spending without relational DB overhead | ✓ Good |
| DEC-04: Event-Driven with EventBridge Bus | Decouples verification from asynchronous territory health recalculation and notifications | ✓ Good |
| DEC-05: Uber H3 Res-7 Hexagonal Territories | Optimal cell size (~5 km²) for neighbourhood civic pride, walkability, and animal mascot binding | ✓ Good |
| DEC-06: Verification Trust Ladder & Multipliers | Deters gaming and farming while providing high incentives for verified high-effort actions | ✓ Good |
| DEC-07: Step Functions + Rekognition + Bedrock Nova Lite | Cheapest multimodal vision verification with caching by perceptual hash to minimize inference spend | ✓ Good |
| DEC-08: pnpm Monorepo with Shared Game Rules | Pure TypeScript game math isolated in `packages/game-rules` with 100% unit test coverage | ✓ Good |
| DEC-09: Cedar Authorization in Lambda | Enforces strict ward-level tenancy for ward admins and collector equipment isolation | ✓ Good |
| DEC-10: Amazon Location Service for Maps & Geofences | Deep AWS integration replacing third-party Mapbox/Google Maps with native vector tiles and trackers | ✓ Good |
| DEC-11: Backend-First Development Sequence | User directive: Complete 100% of backend & infra on AWS before initializing frontend development | ✓ Good |

---
*Last updated: 2026-10-04 after adopting backend-first phased sequencing*
