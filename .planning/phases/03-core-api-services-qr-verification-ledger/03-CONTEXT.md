# Phase 3 Context: Core API Services, QR Verification & Ledger

## Purpose
Implement and test the core transactional engine and public/secured REST API services for SaafSafari:
1. Deterministic task boards and daily habit check-in with atomic streak progression (`GET /v1/tasks`, `POST /v1/tasks/checkin`).
2. Dual-mode QR verification engine (`POST /v1/scans`):
   - Static dustbin and e-waste QR verification with geospatial distance check ($\le 75\text{ m}$).
   - Collector truck rotating HMAC-SHA256 QR code verification (30s time-step validity window) with live vehicle proximity validation ($\le 150\text{ m}$).
   - Collector reward distribution (2 GC per unique citizen scan up to 200 GC daily limit).
3. DynamoDB `TransactWriteItems` atomic ledger mutations (`CRED-02`): all credit awards, cooldowns, territory health bumps, and balance updates commit atomically or roll back completely.
4. User wallet and transaction history (`GET /v1/wallet`), coupon catalog (`GET /v1/coupons`), and coupon redemption (`POST /v1/coupons/redeem`) with conditional stock decrements and weekly merchant limits.
5. Live collection vehicle tracker query (`GET /v1/trucks/live`).
6. Individual and territory competitive leaderboards (`GET /v1/leaderboards`).
7. Complete AWS CDK route wiring and IAM policy configuration in `infra/lib/api-stack.ts`.

## Requirements Covered
- **TASK-01**: Daily (3 tasks), weekly (3 tasks), and monthly (2 tasks + 1 territory goal) task boards served via API.
- **TASK-02**: Idempotent seeded task generation from pure rules engine combined with DynamoDB completion status.
- **CRED-02**: Atomic DynamoDB `TransactWriteItems` recording immutable ledger entries, user balance/XP, collector earnings, and territory health.
- **QR-01**: Static signed QR codes on public dustbins and e-waste points with geofencing validation ($\le 75\text{ m}$).
- **QR-02**: Dynamic rotating QR codes from collector trucks with 30-second HMAC token validity.
- **QR-03**: Proximity check to collector truck's live location ($\le 150\text{ m}$) and per-source 4-hour cooldown enforcement.
- **COL-01**: Collector role support and rotating QR validation for collection trucks.
- **COL-02**: Collector earns 2 GC per unique citizen scan up to a 200 GC daily limit.
- **TRK-01**: Real-time garbage truck locations query for citizen map view.
- **WALT-01**: User wallet endpoint returning Green Credit balance, lifetime XP, tier title, and paginated transaction history.
- **WALT-02**: Merchant coupon browsing and atomic conditional redemption with weekly per-merchant limits.
- **LEAD-01**: Weekly individual leaderboards for user's home territory and citywide rankings.
- **LEAD-02**: Territory-vs-territory competitive rankings based on health and civic activity.

## Locked Architecture & Decisions Honored
- **DEC-03 (Single-Table DynamoDB & TransactWriteItems):** Every mutating credit or redemption action executes via atomic `TransactWriteItems` with condition expressions (`attribute_exists(PK)` and `balanceGC >= costGC`).
- **DEC-04 (Pure Rules Engine Reusability):** Handlers import calculation functions (`calculateRewards`, `getUserTier`, `generateDailyTaskBoard`, `applyActionHealthGain`) directly from `@saafsafari/game-rules`.
- **DEC-06 (Trust Ladder & Multipliers):** Reward calculations apply trust levels (T0 to T3), streak bonuses (+0.05x/day), and territory urgency multipliers (1.25x for sick territories), capped at 2.0x.
- **DEC-11 (Backend-First):** Complete and test all backend API handlers and CDK integrations before initializing frontend applications.
- **CON-01 (Security & Identity):** Never trust `userId` from request body; extract verified subject claim from `event.requestContext.authorizer.jwt.claims.sub`.
