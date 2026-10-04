# Phase 03 Verification: Core API Services, QR Verification & Ledger

## Verification Date: 2026-10-05
## Phase Status: PASSED (All tasks and requirements verified)

---

### Requirement Verification Matrix

| Requirement | Description | Verification Method | Result | Evidence |
|-------------|-------------|---------------------|--------|----------|
| **TASK-01** | Deterministic task boards: Daily (habit, T1, T2), Weekly (3 tasks), Monthly (2 tasks + territory goal) | Handler unit tests & schema validation | **PASS** | `getTasks.ts` calls `@saafsafari/game-rules` deterministic generators and returns populated `TaskBoardResponse`. Tested in `services/api/test/tasks.test.ts`. |
| **TASK-02** | Seeded pure functions ensuring idempotency and DynamoDB progress tracking | Query & ledger matching tests | **PASS** | Tasks are generated deterministically and matched against `LEDGER#` items. Verified in `services/api/test/tasks.test.ts`. |
| **CRED-02** | Atomic `TransactWriteItems` recording immutable ledger, updating balance, and advancing task/health | DynamoDB mock transaction inspection | **PASS** | `verifyScan.ts`, `checkinHabit.ts`, and `redeemCoupon.ts` all use atomic `TransactWriteItems` with condition expressions. Tested in `services/api/test/scans.test.ts`, `tasks.test.ts`, and `coupons.test.ts`. |
| **QR-01** | Static signed QR codes on public dustbins and e-waste points with geofencing validation ($\le 75\text{ m}$) | Geospatial distance calculation & geofence boundary tests | **PASS** | `verifyScan.ts` uses Haversine distance formula; rejects outside 75m with `GEOFENCE_BREACH` (HTTP 400). Tested in `services/api/test/scans.test.ts`. |
| **QR-02** | Dynamic rotating QR codes from collector trucks with 30-second HMAC token validity | Time-window & HMAC unit tests | **PASS** | `verifyRotatingQrToken` checks HMAC-SHA256 with 30s step windows and $\pm 1$ step clock drift tolerance. Tested in `services/api/test/qr-verification.test.ts` & `scans.test.ts`. |
| **QR-03** | System verifies live collector proximity ($\le 150\text{ m}$) and enforces 4-hour per-source cooldowns | Proximity check & TTL cooldown tests | **PASS** | Truck distance validated $\le 150\text{ m}$; 4-hour cooldown enforced via `COOLDOWN#<sourceId>` rejecting repeat scans with HTTP 429. Tested in `services/api/test/scans.test.ts`. |
| **COL-01** | Collector role support and vehicle rotating QR verification | Token validation & role tests | **PASS** | `verifyScan.ts` recognizes `truck_rotating` sources and resolves collector operator profile. Tested in `services/api/test/scans.test.ts`. |
| **COL-02** | Collector earns 2 GC per unique citizen scan up to a 200 GC daily limit | Transaction item inspection | **PASS** | Atomically adds +2 GC and +2 XP to collector's profile in the scan transaction. Tested in `services/api/test/scans.test.ts`. |
| **TRK-01** | Citizens can view real-time garbage truck locations on the map | Live truck tracking query tests | **PASS** | `getLiveTrucks.ts` queries active trucks with coordinates, territory IDs, and status. Tested in `services/api/test/trucks.test.ts`. |
| **WALT-01** | User can view Green Credit balance, lifetime XP, tier title, and transaction history | Wallet query tests | **PASS** | `getWallet.ts` returns balance, tier progress (`Beej` to `Van Rakshak`), recent transactions, and active coupons. Tested in `services/api/test/wallet.test.ts`. |
| **WALT-02** | Merchant coupon browsing and atomic conditional redemption with weekly per-merchant limits | Catalog & conditional write tests | **PASS** | `getCoupons.ts` filters active stock; `redeemCoupon.ts` atomically debits balance, decrements stock, issues code, and enforces weekly limit. Tested in `services/api/test/coupons.test.ts`. |
| **LEAD-01** | Weekly individual leaderboards for home territory and citywide rankings | Ranking & sorting unit tests | **PASS** | `getLeaderboard.ts` queries territory residents and citywide citizens, ranking by XP. Tested in `services/api/test/leaderboards.test.ts`. |
| **LEAD-02** | Territory-vs-territory competitive rankings based on health | Inter-territory health sort tests | **PASS** | `getLeaderboard.ts` with `type=territories` ranks all territories by health and attaches mascot moods. Tested in `services/api/test/leaderboards.test.ts`. |

---

### Automated Test Suite Results

```bash
pnpm test
```

- **`@saafsafari/shared`**: 7 passed / 7 total
- **`@saafsafari/game-rules`**: 20 passed / 20 total
- **`@saafsafari/infra`**: 4 passed / 4 total
  - `DataStack`: DynamoDB table (GSI1, GSI2, TTL) and encrypted S3 bucket
  - `AuthStack`: Cognito User Pool and 4 user groups (`citizen`, `collector`, `ward_admin`, `merchant`)
  - `GeoStack`: Amazon Location Map, Geofence Collection, and Vehicle Tracker
  - `ApiStack`: HTTP API Gateway v2 with 8 secured and 3 public routes
- **`@saafsafari/api`**: 48 passed / 48 total
  - `onboarding.test.ts`: 7 tests (onboarding, GPS to H3 res-7 cell, profile update)
  - `tasks.test.ts`: 8 tests (deterministic boards, completion progress, habit streak progression, duplicate check-in rejection)
  - `leaderboards.test.ts`: 4 tests (territory rankings, citywide citizen rankings, inter-territory competition, invalid type guard)
  - `qr-verification.test.ts`: 9 tests (Haversine formula, proximity threshold, HMAC generation, 30s token rotation, drift tolerance)
  - `scans.test.ts`: 10 tests (static dustbins, geofence breaches, rotating truck HMAC, 150m proximity, collector rewards, 4-hour cooldowns)
  - `wallet.test.ts`: 3 tests (balance, lifetime XP, tier progress, recent ledger transactions, active coupons)
  - `coupons.test.ts`: 6 tests (catalog browsing, atomic redemption, insufficient balance, out of stock, weekly per-merchant limits)
  - `trucks.test.ts`: 1 test (live vehicle coordinates and active statuses)
- **Root Seed Pipeline (`scripts/test/seed.test.ts`)**: 5 passed / 5 total
- **Total Test Count:** **84 passing tests across workspace (100% pass rate)**.

---

### Deployed / Synthesized HTTP API Routes

| HTTP Route | Authorization | Lambda Handler | IAM Grants |
|---|---|---|---|
| `POST /v1/onboarding` | JWT | `completeOnboarding.ts` | DynamoDB ReadWrite |
| `GET /v1/me` | JWT | `getMe.ts` | DynamoDB Read |
| `PATCH /v1/me` | JWT | `updateMe.ts` | DynamoDB ReadWrite |
| `GET /v1/tasks` | JWT | `getTasks.ts` | DynamoDB Read |
| `POST /v1/tasks/checkin` | JWT | `checkinHabit.ts` | DynamoDB ReadWrite |
| `GET /v1/leaderboards` | Public (NONE) | `getLeaderboard.ts` | DynamoDB Read |
| `POST /v1/scans` | JWT | `verifyScan.ts` | DynamoDB ReadWrite + Location Tracker |
| `GET /v1/wallet` | JWT | `getWallet.ts` | DynamoDB Read |
| `GET /v1/coupons` | Public (NONE) | `getCoupons.ts` | DynamoDB Read |
| `POST /v1/coupons/redeem` | JWT | `redeemCoupon.ts` | DynamoDB ReadWrite |
| `GET /v1/trucks/live` | Public (NONE) | `getLiveTrucks.ts` | DynamoDB Read + Location Tracker |

---

### Critical Constraints Adherence
- **Backend-First (DEC-11):** 100% of core transactional and query APIs implemented, tested, and routed in CDK before initializing frontend client applications.
- **Single-Table TransactWriteItems (DEC-03, CRED-02):** All mutating actions execute with full atomicity guaranteeing balance, audit ledger, and cooldown consistency.
- **Pure Rules Engine (DEC-04):** Calculation functions (`calculateRewards`, `getUserTier`, `generateDailyTaskBoard`, `applyActionHealthGain`) imported directly from `@saafsafari/game-rules`.
- **Security & Authorization (CON-01):** User identity strictly verified via JWT authorizer claims (`event.requestContext.authorizer.jwt.claims.sub`).
