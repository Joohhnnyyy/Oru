# Oru (SaafSafari): Full Codebase Audit, Issues and Break Points

Audited: 11 Oct 2026 (submission day). This supersedes nothing; read it alongside `06-BACKEND-REVIEW-AND-XFACTOR.md`, which has the code fixes.

## What was checked
- **TypeScript typecheck run on every package:** `shared`, `game-rules`, `services/api`, `infra`, `apps/mobile`, `apps/web`. **All pass with 0 errors.**
- **Unit tests were not re-run.** The installed `node_modules` contain macOS-only binaries (rollup/esbuild), so they can't run in the Linux sandbox. Run `pnpm test` on the Mac to confirm.
- **Read:** all 20 API handlers, utils, shared schemas, game rules, all 6 CDK stacks, `seed.ts`, `setup-demo-users.ts`, `amplify.yml`, `.gitignore`, and the mobile app (services, context, screens, telemetry, QR utility).

Severity: 🔴 breaks the demo or pitch · 🟠 security/economy exploit · 🟡 correctness bug · ⚪ hygiene

---

## A. Demo blockers 🔴

| # | Issue | Where | What breaks |
|---|---|---|---|
| A1 | **The mobile app is a static prototype.** Every screen uses hard-coded arrays (`TASKS`, `REWARDS_DATA`, `CITIZEN_RANKS`, `TERRITORY_RANKS`, `DELHI_TERRITORIES`, `AREAS`). The scan button calls `handleSimulateScan()`. Photo proof is a `setTimeout`. | `screens/citizen/*`, `components/PhotoProofModal.tsx` | Nothing on the phone touches AWS. The video can't show a real end-to-end flow. |
| A2 | **No camera, GPS or photo libraries are installed.** `expo-camera`, `expo-location` and `expo-image-picker` are missing from `apps/mobile/package.json`. | `apps/mobile/package.json` | A real QR scan, geofence check or photo upload is impossible until they're added. |
| A3 | **Fake auth.** It uses the hard-coded token `demo-jwt-token-aarav`. The real API Gateway JWT authorizer rejects it with 401. | `context/AuthContext.tsx:66-74` | Every real API call would fail. |
| A4 | **The API client doesn't match the backend.** It calls `/v1/auth/otp/*`, `/v1/territories` and `/v1/trucks/telemetry`, none of which exist. The scan sends `{qrData}` instead of `{sourceId,qrPayload,latitude,longitude}`. Redeem has no `merchantId`. `getLiveTrucks` expects an array but gets `{trucks,count}`. | `services/api.ts` | 404 / 400 errors once it's wired up. |
| A5 | **Telemetry spam.** `telemetry.ts` POSTs a simulated route to `/v1/trucks/telemetry` (a 404) on an interval, with the fake token. | `services/telemetry.ts` | Constant failed requests in Collector mode. |
| A6 | **The rotating QR can never verify.** The collector app uses a 32-bit JS hash with secret `demo-secret-key-mcd-truck`; the server uses HMAC-SHA256 with per-truck secrets. The default `sourceId` `truck-dl1m-4821` doesn't exist (seed uses `qr_truck_vehicle_01…10`). | `utils/totp.ts`, `CollectorHomeScreen.tsx` | The headline handshake always fails. |
| A7 | **The web app is the Butter Video clone.** `apps/web` has **197 "Butter" mentions and 0 Oru/SaafSafari content**. `amplify.yml` deploys exactly this folder. | `apps/web/src/**`, `amplify.yml` | If judges open the web URL they see another company's brand. That's a copyright/branding risk and doesn't show a municipal console. Don't link it in the submission unless rebranded or replaced. |
| A8 | **The photo pipeline never runs.** No S3 event or `StartExecution` starts the Step Functions workflow. | `workflow-stack.ts`, `createSubmission.ts` | Submissions stay `PENDING_UPLOAD` forever. |
| A9 | **Admins can't see the photo they're reviewing.** The review queue returns only `s3Key` (private bucket), not a presigned GET URL. `bedrockReasoning` reads a field that's never written (it's saved as `aiEvaluation.reasoning`), so it always shows "Pending human review". | `admin/getReviewQueue.ts` | The review demo shows no image and no AI reasoning. |
| A10 | **The map isn't AWS.** The mobile map is Google Maps 3D in a WebView, while the pitch names Amazon Location for maps. | `components/Google3DMap.tsx` | The claim doesn't match the demo. Either say "Google 3D map + Amazon Location tracker", or switch to the Amazon Location map. |

---

## B. Security and economy exploits 🟠

| # | Issue | Where | Exploit |
|---|---|---|---|
| B1 | **Photos earn the highest reward, so the trust ladder is inverted.** `COMMUNITY_CLEANUP_PROOF` = 100 base × T3 weight 2.0 = **200 GC** per approved photo. A verified truck handover = 25 × 1.5 = **37 GC**. The design doc gives photos the lowest trust (1.0). | `game-rules/credits.ts` | The least-verifiable action pays the most, which contradicts the X-factor pitch. |
| B2 | **Fails open, auto-approving 200 GC.** A Rekognition error substitutes fake "Waste, Plastic" labels, scoring 0.85 and auto-approving. There's no daily cap on submissions. | `evaluateSubmission.ts` | Unlimited credits during any AI or permission error. |
| B3 | **Admins can double-pay.** `resolveReviewQueue` doesn't check status, so the same submission can be approved repeatedly (100 GC each time). | `admin/resolveReviewQueue.ts` | Repeated payouts. |
| B4 | **IDOR (any user can read other users' submissions):** `GET /v1/submissions/{id}` has no owner check and exposes GPS, `s3Key` and `taskToken`. | `submissions/getSubmission.ts` | Data leak. |
| B5 | **Static QR codes are unsigned.** Bins and e-waste points are verified by `sourceId` plus GPS only, and the IDs are guessable (`qr_bin_delhi_01…`). | `scans/verifyScan.ts` | Credits with a spoofed GPS position and no physical visit. |
| B6 | **Truck secrets are predictable and committed to git** (`sec_truck_hmac_secret_key_${i}`). | `scripts/seed.ts` | Anyone with the repo can forge valid rotating QR tokens. |
| B7 | **The cooldown has a race condition.** It's read-then-write, and the cooldown `Put` has no condition. | `verifyScan.ts` | Parallel requests get paid twice. |
| B8 | **Hotspot griefing.** There's no rate limit: −5 health per report with no floor, plus an auto-created 120 GC bounty per report. | `hotspots/reportHotspot.ts` | Sink a rival territory, or spam bounties. |
| B9 | **The public hotspot API leaks reporter IDs** (Cognito `sub`) on an unauthenticated route. | `hotspots/getHotspots.ts` | Privacy leak. |
| B10 | **No API throttling.** There's no route throttling or WAF on the HTTP API, and many public routes run full-table scans. | `infra/lib/api-stack.ts` | Cheap to flood; burns credits. |
| B11 | **"Cedar" is if/else, and ward scoping never triggers.** `custom:assigned_ward` isn't defined in Cognito, and every handler passes `resource:'system'`. | `utils/cedar.ts`, `auth-stack.ts` | Any ward admin can manage every ward. |

---

## C. Correctness bugs / break points 🟡

| # | Issue | Where | Effect |
|---|---|---|---|
| C1 | **Re-onboarding wipes the profile.** `PutCommand` has no condition, so calling `/v1/onboarding` again resets balance, XP and streak to 0 and lets users change their home territory at any time (the spec says once per 30 days). | `onboarding/completeOnboarding.ts` | Data loss; a farming loophole for the Explorer bonus. |
| C2 | **`PATCH /v1/me` before onboarding creates a "ghost" profile without `balanceGC`/`lifetimeXP`.** The next scan's `balanceGC + :gc` then throws a ValidationException, which returns a generic 500. | `me/updateMe.ts` | The user can never earn credits. |
| C3 | **The truck scan depends on the collector profile.** The transaction requires `USER#collector_… PROFILE` to exist. No seeded truck has a `collectorId`, so all 10 trucks fall back to `collector_ramesh_kumar`. If that profile were missing, every truck scan would 409. | `verifyScan.ts`, `seed.ts` | One collector gets all the credit; a fragile coupling. |
| C4 | **Health is unbounded.** It goes above 100 (`+gain`, and admin approval starts at `if_not_exists(…,100)+2`) and below 0 (hotspot −5). | 5 handlers | The mood and leaderboard maths drift. |
| C5 | **The ledger uses two schemas.** Admin approvals write `PK=LEDGER#…`; everything else writes `USER#…/LEDGER#…`. | `resolveReviewQueue.ts` | The wallet history and task progress miss admin-approved credits. |
| C6 | **Ledger key collisions.** `SK = LEDGER#<ISO ms>`, so two writes in the same millisecond overwrite each other. | scan, evaluate, checkin, redeem | A lost ledger row. |
| C7 | **Nightly decay overwrites whole items** (`BatchWrite` Put) and ignores `UnprocessedItems`. | `scheduler/nightlyHealthDecay.ts` | Scans landing at midnight are lost; some territories randomly skip decay. |
| C8 | **Mood field names differ:** decay writes `moodState`, but the seed/GeoJSON use `mood`. | decay vs seed | The UI reads a stale mood. |
| C9 | **Full-table scans without pagination.** Leaderboard (citywide, territory), live trucks, admin QR list and territory overview read only the first 1 MB page. | several handlers | Results silently go incomplete as the table grows (the ledger rows grow fastest). |
| C10 | **GSI2 is shared** by hotspots and submissions (`STATUS#OPEN/REJECTED…`) with `Limit 50` then filtered. | `getHotspots.ts` | Fewer hotspots than expected; mixed partitions. |
| C11 | **Task rewards are never paid.** Tasks only show progress; there's no claim or bonus. "Weekly" means a rolling 7 days, not the ISO week; monthly counts only the last 50 ledger rows. | `tasks/getTasks.ts` | Completing a task gives no reward, which hurts retention. |
| C12 | **Streak issues.** Only the habit check-in counts; the day uses UTC (it flips at 5:30 AM IST); the multiplier formula differs from the design doc. | `tasks/checkinHabit.ts`, `credits.ts` | Unfair streak loss. |
| C13 | **Auto-approved photos ignore the user's streak and the territory health** (hard-coded `0` and `70`). | `evaluateSubmission.ts` | Wrong rewards. |
| C14 | **The review queue confidence fallback is `50`**, on a 0–1 scale. | `getReviewQueue.ts` | A display bug. |
| C15 | **Live trucks are static.** The tracker is deployed but unused; proximity is checked against the registered location. | `getLiveTrucks.ts`, `verifyScan.ts` | The "live" claim is false. |
| C16 | **The human review callback is fake.** There's no `WAIT_FOR_TASK_TOKEN`, so `taskToken` is always null. | `workflow-stack.ts` | Step Functions does no orchestration. |

---

## D. Infrastructure, ops and hygiene ⚪

| # | Issue | Where |
|---|---|---|
| D1 | **The DynamoDB table has `RemovalPolicy.DESTROY` and PITR off; the S3 bucket has `autoDeleteObjects`.** A `cdk destroy` or a stack replacement deletes all data permanently. Fine for the demo; change before any pilot. | `data-stack.ts` |
| D2 | **No logging.** Powertools Logger is installed and never used; catches swallow errors and return a generic 500. No CloudWatch alarms; log retention is unlimited. | all handlers, infra |
| D3 | **Presigned PUT has no size or type limit; bucket CORS is `*`.** | `createSubmission.ts`, `data-stack.ts` |
| D4 | **Auth config doesn't match the docs.** No email OTP and no Google IdP; password flows are enabled. | `auth-stack.ts` |
| D5 | **The AWS account ID is hard-coded** in `package.json` scripts and `infra/bin/app.ts`; the demo password `REMOVED_CREDENTIAL` is printed in a committed script. Low risk, but tidy before making the repo public. | root `package.json`, `scripts/setup-demo-users.ts` |
| D6 | **Google Maps API key ships in the app bundle** (`EXPO_PUBLIC_…`). This is expected for client keys, so **restrict it** in Google Cloud to your Android package and web domain. | `.env`, `Google3DMap.tsx` |
| D7 | **89 uncommitted changes** in `apps/mobile` (new screens and icons, deleted `.jpg` icons). **Commit before any edits.** | git |
| D8 | `.gitignore` correctly excludes `.env` and `cdk-outputs.json` ✅ | |

---

## E. What's solid ✅
- Every package typechecks cleanly.
- Coupon redemption is properly atomic, with conditional balance and stock checks and the weekly limit.
- The HMAC verifier (server side) uses `timingSafeEqual` and a drift window.
- Every API input is validated with zod.
- The game rules are a pure, unit-tested package.
- Infrastructure is fully in CDK, on Node 22 arm64, with ESM bundling.

---

## F. Fix order for today (to get one honest end-to-end demo)

1. **Commit the current work** (D7).
2. **Mobile: real login and API contract** (A3, A4). Sign in with Cognito using the demo users; align `api.ts`; turn off telemetry (A5).
3. **Handshake** (A6 + B6): a server-issued QR endpoint, then the collector screen shows it, then the citizen screen scans it with `expo-camera` and `expo-location` (A2).
4. **Photo pipeline** (A8, B2, A9): S3 → EventBridge → Step Functions; Nova sees the image; fail closed; presigned GET for admins.
5. **One-line security fixes** (B3, B4, B7, C1, C2, C4): each is a single `ConditionExpression` or check.
6. **Rebalance rewards** (B1): photo weight ≤ QR weight, plus a daily photo cap.
7. **Don't show `apps/web` as-is** (A7). Rebrand it to Oru or leave it out of the submission.
