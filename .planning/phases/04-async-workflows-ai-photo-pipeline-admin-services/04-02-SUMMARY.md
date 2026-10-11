# Plan 04-02 Summary: Civic Hotspot Reporting, Bounty Task Generation & Nightly EventBridge Scheduler

## Implementation Overview
Successfully delivered civic dumping hotspot reporting (`HOT-01`, `HOT-02`) and the automated territory health decay scheduler (`MAP-03`):

1. **Shared Domain Schemas (`packages/shared/src/schemas/hotspots.ts`)**:
   - `ReportHotspotRequestSchema`: Coordinates within Delhi NCR bounding box, title, description, severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), photo URL, optional territory ID.
   - `ReportHotspotResponseSchema`: Hotspot ID, territory ID, spawned bounty ID, health penalty (-5), status, bounty reward (120 GC, 250 XP), reported timestamp.
   - `HotspotItemSchema` & `BountyTaskSchema`: Single-table persistence models with GSI1/GSI2 indexing for territory and status lookups.

2. **Hotspot Reporting & Retrieval Handlers**:
   - `services/api/src/handlers/hotspots/reportHotspot.ts`:
     - Authenticates reporter via Cognito JWT authorizer claims.
     - Validates Delhi NCR geo-boundaries and resolves res-7 H3 cell.
     - Executes atomic `TransactWriteItems`:
       1. Records `HOTSPOT#<id>` in DynamoDB with `STATUS#OPEN`.
       2. Deducts 5 health points from territory (`PK: TERRITORY#<territoryId>`, `SK: METADATA`).
       3. Spawns high-reward cleanup Bounty task (`PK: BOUNTY#<bountyId>`) with 120 Green Credits and 250 XP reward.
   - `services/api/src/handlers/hotspots/getHotspots.ts`:
     - Enables citizens and administrators to list active hotspots filtered by territory (`GSI1`) or citywide status (`GSI2`).
   - Mounted routes on HTTP API Gateway v2 in `infra/lib/api-stack.ts`:
     - `POST /v1/hotspots` (Cognito JWT authorizer)
     - `GET /v1/hotspots` (Public)

3. **EventBridge Nightly Territory Health Decay Scheduler**:
   - `services/api/src/handlers/scheduler/nightlyHealthDecay.ts`:
     - Runs nightly, scanning all Delhi NCR territory metadata records.
     - Applies pure mathematical 3% decay using `applyNightlyDecay(currentHealth, 0.03)` from `@saafsafari/game-rules`.
     - Dynamically updates territory mascot mood states (`sick`, `recovering`, `thriving`, `legendary`) via `getMoodState`.
     - Batch writes updated territory items back to DynamoDB in 25-item chunks (`BatchWriteItemCommand`).
   - `infra/lib/scheduler-stack.ts`:
     - Provisions `SaafSafari-SchedulerStack` in AWS CDK.
     - Creates EventBridge Rule `saafsafari-nightly-health-decay` with cron expression `cron(0 0 * * ? *)` (midnight UTC / 5:30 AM IST).
     - Targets the `nightlyHealthDecayFn` Lambda function with 2-minute timeout and DynamoDB read/write permissions.
     - Wired into `infra/bin/app.ts` with explicit dependency on `DataStack`.

## Test Verification
- `services/api/test/hotspots.test.ts` (5 tests passing): Unauthorized access rejection, out-of-bounds rejection, atomic transaction execution (hotspot + health penalty + bounty creation), and territory/status filtering.
- `services/api/test/scheduler.test.ts` (3 tests passing): Empty table safety, 3% decay and mood transitions across 68 Delhi NCR territories, and 25-item batch write chunking.
- `infra/test/stacks.test.ts` (6 tests passing): Verified EventBridge Rule, cron expression, Lambda target, and HTTP API route registrations.
- Monorepo full test suite: 103 passed tests across all workspace packages.
