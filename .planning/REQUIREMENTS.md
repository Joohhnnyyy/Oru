# Requirements: SaafSafari

**Defined:** 2026-10-04
**Core Value:** Verifiable civic waste and energy actions directly tied to immediate, local feedback: a real-world scan or photo instantly awards credits, moves territory health, evolves an animal mascot, and unlocks community rewards.

## v1 Requirements

### Authentication & Onboarding

- [x] **AUTH-01**: User can authenticate passwordlessly via Cognito Email OTP or Google OAuth federation.
- [x] **AUTH-02**: User can select language (English or Hindi) and configure notification preferences.
- [x] **AUTH-03**: User receives automatic home territory assignment (H3 res-7 cell) based on device GPS coordinates during onboarding.

### Territory Map & Mascots

- [ ] **MAP-01**: User can view an interactive MapLibre map displaying H3 res-7 hexagonal cells colored by land-cover mascot.
- [ ] **MAP-02**: User can inspect territory details including current Health (0–100), active animal mascot, and 4 mood states (Sick, Recovering, Thriving, Legendary).
- [ ] **MAP-03**: Territory health decays 3% nightly via EventBridge Scheduler and recalculates from daily verified actions via DynamoDB Streams.

### Tasks & Game Engine

- [ ] **TASK-01**: User receives daily task board (3 tasks: 1 segregation habit, 1 T1, 1 T2), weekly board (3 tasks), and monthly board (2 tasks + 1 territory goal).
- [ ] **TASK-02**: Tasks are deterministically generated using pure functions seeded by userId and period key to guarantee idempotency.
- [ ] **CRED-01**: Green Credits (GC) and XP are computed via pure functions applying trust weights, capped multipliers (max 2.0x), and flat bonuses.
- [ ] **CRED-02**: Mutating actions use DynamoDB TransactWriteItems to atomically record immutable ledger entries, update user balance, and advance task progress.

### QR Code Verification

- [ ] **QR-01**: User can scan static signed QR codes on public dustbins and e-waste points with Amazon Location geofencing validation (within 75 m).
- [ ] **QR-02**: User can scan dynamic rotating QR codes from collector mobile devices with 30-second HMAC token validity.
- [ ] **QR-03**: System verifies user proximity to collector's live location (within 150 m via Amazon Location Tracker) and enforces per-source cooldowns.

### Collector Mode & Live Tracking

- [ ] **COL-01**: Collector role users can toggle mobile app into Collector Mode to broadcast rotating QR codes and stream GPS position.
- [ ] **COL-02**: Collector earns 2 GC per unique citizen scan up to a 200 GC daily limit.
- [ ] **TRK-01**: Citizens can view real-time garbage truck locations on the map and receive proximity arrival alerts when a truck enters their territory.

### Wallet & Rewards

- [ ] **WALT-01**: User can view current Green Credit balance, lifetime XP, tier title (Beej to Van Rakshak), and transaction history.
- [ ] **WALT-02**: User can browse merchant coupons and redeem rewards via atomic conditional writes with weekly per-merchant limits.

### AI Photo Verification

- [ ] **AI-01**: User can submit cleanup or segregation photo proof with presigned S3 upload, GPS coordinates, and timestamp validation.
- [ ] **AI-02**: Step Functions workflow verifies image moderation with Rekognition and evaluates proof validity using Amazon Bedrock Nova Lite.
- [ ] **AI-03**: Borderline submissions automatically suspend in Step Functions with task-token callback awaiting human review in the municipal console.

### Civic Reporting & Bounties

- [ ] **HOT-01**: Citizen can report illegal garbage dumping hotspots with geo-tagged photos and descriptions.
- [ ] **HOT-02**: Validated hotspots deduct territory health and automatically spawn high-reward cleanup Bounty tasks for nearby citizens.

### Municipal Console

- [ ] **ADM-01**: Ward admins can view ward-level territory health overview and a hotspot density heatmap.
- [ ] **ADM-02**: Ward admins can register and manage QR sources (bins, trucks, e-waste hubs) and export printable QR codes.
- [ ] **ADM-03**: Ward admins can review flagged photo submissions, approve/reject with feedback, and complete Step Functions callbacks.

### Leaderboards

- [ ] **LEAD-01**: User can view weekly individual leaderboards for their home territory and citywide rankings.
- [ ] **LEAD-02**: User can view territory-vs-territory competitive rankings based on weekly health point gains.

---

## v2 Requirements

### Advanced AI Assistant

- **AIA-01**: "Saaf Mitra" conversational waste segregation assistant (item photo → bin destination + nearest drop point) built with Bedrock.
- **AIA-02**: Amazon Bedrock Guardrails filtering toxic or abusive content in hotspot reports.

### Utilities & OCR

- **UTIL-01**: Electricity bill upload and Textract AnalyzeExpense parsing to verify month-over-month energy reduction tasks.
- **UTIL-02**: Automated Hindi translation of admin-created custom tasks via Amazon Translate.

### Offline Resilience

- **OFF-01**: Mobile offline queue with SQLite to cache verification tokens and sync when network connectivity resumes.
- **OFF-02**: Referral tasks and community event check-ins.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real money payouts / Carbon credit trading | Complex regulatory and verification hurdles; coupons provide immediate tangible value without fraud risk |
| Native iOS application | Android Expo APK + responsive web app covers 100% of judge and demo requirements |
| Custom ML model training | Cloud APIs (Bedrock Nova Lite + Rekognition) eliminate training costs and operational overhead |
| Multi-city deployment | Focusing high-density seed data on Delhi NCR delivers a far more compelling demo experience |
| SMS OTP login | Indian TRAI DLT registration lead times exceed hackathon timeline; Cognito Email OTP is immediate |
| Long-running AWS infrastructure (EC2, RDS, ElastiCache) | Hourly provisioned charges deplete the $200 credit budget; serverless architecture remains within free tier |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1: Foundation & Authentication | Pending |
| AUTH-02 | Phase 1: Foundation & Authentication | Pending |
| AUTH-03 | Phase 1: Foundation & Authentication | Pending |
| MAP-01 | Phase 2: Game Engine & Seed Pipeline | Pending |
| MAP-02 | Phase 2: Game Engine & Seed Pipeline | Pending |
| MAP-03 | Phase 2: Game Engine & Seed Pipeline | Pending |
| TASK-01 | Phase 2: Game Engine & Seed Pipeline | Pending |
| TASK-02 | Phase 2: Game Engine & Seed Pipeline | Pending |
| CRED-01 | Phase 2: Game Engine & Seed Pipeline | Pending |
| CRED-02 | Phase 3: Core API Services & Ledger | Pending |
| QR-01 | Phase 3: Core API Services & Ledger | Pending |
| QR-02 | Phase 3: Core API Services & Ledger | Pending |
| QR-03 | Phase 3: Core API Services & Ledger | Pending |
| COL-01 | Phase 3: Core API Services & Ledger | Pending |
| COL-02 | Phase 3: Core API Services & Ledger | Pending |
| TRK-01 | Phase 3: Core API Services & Ledger | Pending |
| WALT-01 | Phase 3: Core API Services & Ledger | Pending |
| WALT-02 | Phase 3: Core API Services & Ledger | Pending |
| LEAD-01 | Phase 3: Core API Services & Ledger | Pending |
| LEAD-02 | Phase 3: Core API Services & Ledger | Pending |
| AI-01 | Phase 4: Async Workflows & Admin | Pending |
| AI-02 | Phase 4: Async Workflows & Admin | Pending |
| AI-03 | Phase 4: Async Workflows & Admin | Pending |
| HOT-01 | Phase 4: Async Workflows & Admin | Pending |
| HOT-02 | Phase 4: Async Workflows & Admin | Pending |
| ADM-01 | Phase 4: Async Workflows & Admin | Pending |
| ADM-02 | Phase 4: Async Workflows & Admin | Pending |
| ADM-03 | Phase 4: Async Workflows & Admin | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-04*
*Last updated: 2026-10-04 after backend-first realignment*
