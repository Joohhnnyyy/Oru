# Plan 03-03 Summary: Wallet, Coupon Redemption, Live Truck Tracker & ApiStack Routing

## Execution Summary
- **Phase:** 03-core-api-services-qr-verification-ledger
- **Plan:** 03
- **Status:** Complete (84/84 workspace tests passing, CDK synthesis clean)

## Accomplishments
1. **Shared Domain Contracts:**
   - Defined `LedgerItemSchema`, `UserCouponSchema`, `WalletResponseSchema`, `CouponRedemptionRequestSchema`, and `CouponRedemptionResponseSchema` in `packages/shared/src/schemas/wallet.ts`.
   - Defined `LiveTruckSchema` and `LiveTrucksResponseSchema` in `packages/shared/src/schemas/trucks.ts`.
   - Exported all schemas and inferred TypeScript types in `packages/shared/src/index.ts`.
2. **Citizen Wallet Handler (`GET /v1/wallet`):**
   - Implemented `services/api/src/handlers/wallet/getWallet.ts`.
   - Returns current Green Credit balance, lifetime XP, tier progress (`Beej` to `Van Rakshak`), streak days, recent transactions, and active redeemed coupons.
3. **Coupon Catalog & Atomic Redemption Engine (`GET /v1/coupons`, `POST /v1/coupons/redeem`):**
   - Implemented `services/api/src/handlers/coupons/getCoupons.ts` querying available coupons with positive stock and valid expiration.
   - Implemented `services/api/src/handlers/coupons/redeemCoupon.ts` executing atomic `TransactWriteItems`:
     1. User balance debit with condition `balanceGC >= costGC`
     2. Coupon stock decrement with condition `stock > 0`
     3. Active user coupon item creation with alphanumeric redemption code (e.g. `SAF-KHAD-XXXXXX`)
     4. Immutable ledger spend audit record (`creditsEarned = -costGC`)
     5. Weekly per-merchant redemption limit item (`LIMIT#<merchantId>#<YYYY-WW>`) with `attribute_not_exists(PK)`
4. **Live Vehicle Tracking Handler (`GET /v1/trucks/live`):**
   - Implemented `services/api/src/handlers/trucks/getLiveTrucks.ts` scanning active municipal waste collection vehicles with GPS coordinates and territory assignments.
5. **AWS CDK Infrastructure Routing (`infra/lib/api-stack.ts` & `infra/bin/app.ts`):**
   - Wired `GeoStack` collection and tracker ARNs into `ApiStack`.
   - Built and mounted 11 Lambda handlers via `TsLambda` targeting Node.js 22 ARM64 with esbuild ESM bundling.
   - Mounted secured routes: `/v1/onboarding`, `/v1/me`, `/v1/tasks`, `/v1/tasks/checkin`, `/v1/scans`, `/v1/wallet`, `/v1/coupons/redeem`.
   - Mounted public routes: `/v1/leaderboards`, `/v1/coupons`, `/v1/trucks/live`.
   - Granted least-privilege DynamoDB (`ReadData` / `ReadWriteData`) and Amazon Location Service (`geo:GetDevicePosition`, `geo:BatchGetDevicePosition`) IAM policies.

## Verification
- Automated Vitest test suite (`test/wallet.test.ts`, `test/coupons.test.ts`, `test/trucks.test.ts`, and `infra/test/stacks.test.ts`) executed and passed cleanly.
- Full workspace test run verified 84 tests passing across all 5 modules with zero errors.
