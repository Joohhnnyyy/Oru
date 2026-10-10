# SaafSafari — Backend Context

Stack: **TypeScript, Node.js 22 (arm64) Lambdas, API Gateway HTTP API, DynamoDB single-table, EventBridge, Step Functions, AWS CDK (TS), Powertools for AWS Lambda, zod, h3-js, Cedar (wasm)**. Monorepo with pnpm workspaces. Bundling via CDK `NodejsFunction` (esbuild).

Rules for the coding agent:
- All game math lives in `packages/game-rules` (pure, no AWS imports, 100% unit-tested with vitest). Handlers orchestrate; they never compute credits inline.
- **Never trust `userId` from the request body.** Take it from the JWT (`event.requestContext.authorizer.jwt.claims.sub`).
- Every write that changes a balance is a single `TransactWriteItems` with conditions. No read-modify-write.
- Every mutating endpoint accepts `Idempotency-Key` header; wrap with Powertools `makeIdempotent`.
- Validate every input with zod schemas from `packages/shared`.
- Errors: return `{ error: { code, message } }` with proper 4xx; never leak stack traces (the original blueprint returned `error.message` with 500 — don't).

---

## 1. Folder structure

```
saafsafari/
├── infra/
│   ├── bin/app.ts                         # instantiates all stacks
│   ├── lib/
│   │   ├── auth-stack.ts
│   │   ├── data-stack.ts
│   │   ├── geo-stack.ts
│   │   ├── api-stack.ts
│   │   ├── workflow-stack.ts
│   │   ├── ai-stack.ts
│   │   ├── observability-stack.ts
│   │   └── constructs/
│   │       ├── ts-lambda.ts               # NodejsFunction defaults: arm64, node22, Powertools env, tracing
│   │       └── route.ts                   # helper: add route + authorizer + lambda
│   ├── cdk.json
│   └── package.json
├── services/api/
│   ├── src/
│   │   ├── handlers/                      # thin Lambda entrypoints (1 file = 1 function)
│   │   │   ├── me/getMe.ts
│   │   │   ├── me/updateMe.ts             # language, home territory change
│   │   │   ├── onboarding/completeOnboarding.ts
│   │   │   ├── tasks/listTasks.ts
│   │   │   ├── scans/createScan.ts        # QR verification + credit
│   │   │   ├── submissions/createSubmission.ts   # presigned upload
│   │   │   ├── submissions/getSubmission.ts
│   │   │   ├── territories/listTerritories.ts
│   │   │   ├── territories/getTerritory.ts
│   │   │   ├── leaderboards/getLeaderboard.ts
│   │   │   ├── wallet/getWallet.ts
│   │   │   ├── coupons/listCoupons.ts
│   │   │   ├── coupons/redeemCoupon.ts
│   │   │   ├── hotspots/createHotspot.ts
│   │   │   ├── collector/getRotatingToken.ts
│   │   │   ├── collector/postPosition.ts
│   │   │   ├── trucks/listLiveTrucks.ts
│   │   │   ├── admin/qrSources.ts         # CRUD, printable QR
│   │   │   ├── admin/reviewQueue.ts       # list + approve/reject (SendTaskSuccess/Failure)
│   │   │   ├── admin/bounties.ts
│   │   │   ├── admin/wardReport.ts
│   │   │   ├── assistant/askSaafMitra.ts  # P2
│   │   │   ├── events/onActionVerified.territory.ts
│   │   │   ├── events/onActionVerified.leaderboard.ts
│   │   │   ├── events/onActionVerified.collector.ts
│   │   │   ├── jobs/taskRefresh.dispatch.ts   # Scheduler → SQS batches
│   │   │   ├── jobs/taskRefresh.worker.ts     # SQS → write tasks
│   │   │   ├── jobs/healthDecay.ts
│   │   │   ├── jobs/rotateQrKey.ts
│   │   │   └── workflow/                      # Step Functions task Lambdas
│   │   │       ├── exifAndHash.ts
│   │   │       ├── bedrockJudge.ts
│   │   │       ├── awardSubmission.ts
│   │   │       └── rejectSubmission.ts
│   │   ├── domain/
│   │   │   ├── credits.service.ts         # builds the transaction for any verified action
│   │   │   ├── scan.service.ts
│   │   │   ├── territory.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── coupon.service.ts
│   │   │   └── authz.ts                   # Cedar policy evaluation
│   │   ├── adapters/
│   │   │   ├── ddb.ts                     # DocumentClient, key builders, typed get/query
│   │   │   ├── location.ts                # Amazon Location SDK wrappers
│   │   │   ├── bedrock.ts                 # Converse API wrapper, JSON-mode prompt
│   │   │   ├── rekognition.ts
│   │   │   ├── events.ts                  # PutEvents helper with typed detail
│   │   │   ├── s3.ts                      # presign
│   │   │   └── secrets.ts                 # cached HMAC keys from SSM
│   │   ├── lib/
│   │   │   ├── http.ts                    # parse body, zod validate, respond, error mapping
│   │   │   ├── auth.ts                    # claims → {userId, groups}
│   │   │   ├── qr-token.ts                # sign/verify
│   │   │   ├── phash.ts                   # perceptual hash (sharp + dhash)
│   │   │   └── time.ts                    # IST period keys: day/week/month
│   │   └── policies/
│   │       ├── schema.cedarschema
│   │       └── policies.cedar
│   ├── statemachines/verify-proof.asl.json
│   ├── test/                              # vitest + aws-sdk-client-mock
│   └── package.json
├── packages/
│   ├── shared/src/{schemas,types,constants}.ts
│   └── game-rules/src/{constants,credits,health,mood,levels,tasks,catalog}.ts (+ tests)
└── scripts/
    ├── territories/{fetch_osm.py, classify.py, export.py}   # OSM → H3 → GeoJSON + seed JSON
    └── seed/{seed-territories.ts, seed-qr-sources.ts, seed-merchants.ts, seed-demo-users.ts}
```

## 2. DynamoDB single-table design

Table `SaafSafari` — PK `PK` (S), SK `SK` (S), on-demand, TTL attribute `ttl`, Streams `NEW_IMAGE`.

| Entity | PK | SK | Key attributes |
|---|---|---|---|
| User profile | `USER#<sub>` | `PROFILE` | name, email, lang, homeTerritory (h3), homeChangedAt, balance, xp, level, streakDays, lastActiveDay, roles[], referralCode |
| Task instance | `USER#<sub>` | `TASK#<period>#<periodKey>#<taskId>` | period (D/W/M), catalogId, tier, target, progress, status (OPEN/DONE), expiresAt, ttl |
| Ledger entry (immutable) | `USER#<sub>` | `LEDGER#<isoTs>#<txId>` | amount (±), type (EARN/REDEEM/BONUS/COLLECTOR), source (scan/submission/...), refId, territory, breakdown{} |
| Cooldown | `USER#<sub>` | `COOLDOWN#<sourceId>` | ttl = now + cooldown (conditional put `attribute_not_exists(PK)` enforces it) |
| Daily cap counter | `USER#<sub>` | `CAP#<yyyy-mm-dd>` | photoSelfCredits, selfCount, ttl 2 days |
| Visited territory | `USER#<sub>` | `VISIT#<h3>` | firstAt (for first-visit bonus) |
| User voucher | `USER#<sub>` | `VOUCHER#<couponId>` | merchantId, code, status, claimedAt |
| Territory | `TERRITORY#<h3>` | `META` | name, animal, colour, landcover{}, health, mood, legendaryStreak, wardId, neighbors[] |
| Territory daily stats | `TERRITORY#<h3>` | `STATS#<yyyy-mm-dd>` | creditsEarned, actions, activeUsers(set size), hotspotsResolved |
| QR source | `QRSOURCE#<id>` | `META` | type (BIN/TRUCK/KABADI/EWASTE/HAZARD/REFILL/MLP/EVENT/REPAIR), mode (STATIC/ROTATING), h3, lat, lng, radiusM, ownerSub (collector), cooldownH, wardId, active |
| Submission | `SUB#<id>` | `META` | userSub, taskId, s3Key, status (PENDING/APPROVED/REVIEW/REJECTED), aiVerdict{}, labels[], phash, taskToken (for review) |
| Image hash | `PHASH#<prefix16>` | `SUB#<id>` | full hash (bucketed by prefix for near-dup lookup) |
| Hotspot | `HOTSPOT#<id>` | `META` | h3, lat, lng, status (REPORTED/VALIDATED/BOUNTY/RESOLVED), reporterSub, bountyTaskId |
| Merchant | `MERCHANT#<id>` | `META` | name, category, logoKey |
| Coupon | `MERCHANT#<id>` | `COUPON#<couponId>` | code, priceGC, status (AVAILABLE/CLAIMED), claimedBy |
| Idempotency (Powertools) | separate table `SaafSafariIdem` | — | managed by Powertools |

### GSIs
| GSI | PK | SK | Used for |
|---|---|---|---|
| **GSI1** (leaderboards) | `GSI1PK = LB#<scope>#<periodKey>` e.g. `LB#T#872830828ffffff#2026-W41`, `LB#CITY#2026-W41` | `GSI1SK = <score zero-padded 10>#<sub>` | Query descending, Limit 50. Item: `LBENTRY` written per user per scope per period (PK `USER#<sub>`, SK `LB#<scope>#<period>`) |
| **GSI2** (queues / listings) | `GSI2PK` e.g. `SUBSTATUS#REVIEW#<wardId>`, `HOTSPOT#<h3>`, `COUPONS#AVAILABLE#<merchantId>`, `QRSRC#WARD#<wardId>` | `GSI2SK` = createdAt | Admin review queue, hotspot list per territory, next available coupon |

Hot-partition note: per-territory leaderboard partitions are small at demo scale. For production, shard `LB#CITY` keys by `#<0-9>` suffix and merge.

### Credit transaction (core pattern)
`credits.service.ts → buildAwardTransaction(ctx)` returns items for one `TransactWriteItems` (max 100 items; we use ≤ 6):
1. `Put COOLDOWN#<sourceId>` with `ConditionExpression: attribute_not_exists(PK) OR #ttl < :now` → enforces cooldown atomically.
2. `Put LEDGER#...` with `attribute_not_exists(PK)`.
3. `Update PROFILE`: `ADD balance :c, xp :c SET lastActiveDay = :d, streakDays = :s` (streak computed beforehand from lastActiveDay).
4. `Update TASK#...` progress (`ADD progress :one`, `SET #status = if_not_exists...` resolved in code).
5. `Update CAP#<day>` with `ConditionExpression: attribute_not_exists(photoSelfCredits) OR photoSelfCredits <= :capMinusC` for capped sources.
6. `Put VISIT#<h3>` if first visit (condition `attribute_not_exists`).
On `TransactionCanceledException` map the failing index → `COOLDOWN_ACTIVE` / `DAILY_CAP_REACHED` / `DUPLICATE`.
After commit: `PutEvents ActionVerified { userSub, territory, credits, sourceType, taskIds, at }`.

## 3. QR token spec

Static (printed) and rotating (collector phone) share one format:

```
saaf://v1/<base64url(payload)>.<base64url(hmacSHA256(payload, key[kv]))>
payload = { s: sourceId, kv: keyVersion, iat: epochSec, exp: epochSec|null, n: nonce }
```
- Static QR: `exp = null`, `iat` = print time. Security comes from geofence + cooldown + per-source rate limit. Key versions for static QRs never rotate (a separate `static` key); can revoke by setting `active=false` on the source.
- Rotating QR: `exp = iat + 30`. `GET /v1/collector/token` returns a fresh token; mobile regenerates every 25 s. Verification also requires user ≤ 150 m from the collector's last tracker position (≤ 2 min old).
- Keys in SSM SecureString `/saafsafari/qr/keys` as `{ "static": "...", "r7": "...", "r8": "..." }`; Lambda caches for 5 min. `rotateQrKey` job adds a new rotating version every 6 h and drops versions older than 24 h.
- Use `crypto.timingSafeEqual` for signature comparison.

## 4. API contract (`/v1`, all JSON, JWT required unless noted)

| Method & path | Role | Body / query | Response |
|---|---|---|---|
| GET `/me` | any | — | profile, level, rank title, home territory summary |
| PATCH `/me` | any | `{lang?, name?}` | profile |
| POST `/onboarding` | citizen | `{lat, lng, lang}` | `{homeTerritory, tasks}` (assigns h3 res-7 cell, generates first tasks) |
| PUT `/me/home-territory` | citizen | `{lat, lng}` | 409 if changed < 30 days ago |
| GET `/tasks?period=D\|W\|M` | citizen | — | task instances with progress + expiry |
| POST `/scans` | citizen | `{token, lat, lng, accuracyM, clientTs}` + `Idempotency-Key` | `{credits, breakdown:{base,weight,streak,explorer,need,event,flat[]}, balance, tasksUpdated[], territory:{health, mood, moodChanged}}` |
| POST `/submissions` | citizen | `{taskId, lat, lng, kind:"single"\|"before_after"}` | `{submissionId, uploads:[{url, fields}]}` (presigned POST, 5 MB, image/jpeg only) |
| GET `/submissions/{id}` | owner | — | status + AI reason |
| GET `/territories?bbox=` | public (no auth) | — | list (prefer static GeoJSON from CloudFront; this returns live health/mood only) |
| GET `/territories/{h3}` | any | — | meta, mood, top users this week, open bounties, recent hotspots |
| GET `/leaderboards?scope=T:<h3>\|CITY\|TERRITORIES&period=W\|ALL` | any | — | ranked list + caller's rank |
| GET `/wallet` | citizen | `?cursor=` | balance + paginated ledger |
| GET `/coupons` | citizen | — | merchants + price + availability |
| POST `/coupons/{merchantId}/redeem` | citizen | `Idempotency-Key` | `{code, newBalance}` |
| POST `/hotspots` | citizen | `{lat, lng, note}` → then upload via submissions | hotspot id |
| GET `/collector/token` | collector | — | `{qr, expiresAt}` |
| POST `/collector/position` | collector | `{lat, lng, accuracyM}` | 204 (→ Location BatchUpdateDevicePosition) |
| GET `/trucks/live?bbox=` | any | — | positions ≤ 2 min old |
| GET/POST/PATCH `/admin/qr-sources` | ward_admin | source fields | source + printable QR PNG/SVG (generated server-side with `qrcode`) |
| GET `/admin/review-queue` | ward_admin | — | submissions in REVIEW for admin's ward, with presigned image URLs |
| POST `/admin/review/{subId}` | ward_admin | `{decision, note}` | Step Functions SendTaskSuccess/Failure |
| POST `/admin/bounties` | ward_admin | `{hotspotId, rewardGC, slots}` | bounty task |
| GET `/admin/wards/{wardId}/report?from&to` | ward_admin | — | aggregates: actions by type, kg estimate, hotspots, top territories |
| POST `/assistant/ask` | citizen | `{text?, imageKey?}` | `{answer, bin, nearestPoints[]}` (P2) |

## 5. Event catalogue (EventBridge bus `saafsafari`, source `saafsafari.core`)
| detail-type | Producer | Consumers |
|---|---|---|
| `ActionVerified` | createScan, awardSubmission | territory updater, leaderboard updater, collector reward, task-completion bonus checker |
| `TerritoryMoodChanged` | territory updater | notify subscribers (SNS/Expo push), web live feed |
| `HotspotValidated` | review/AI | create bounty, territory health −3 |
| `CouponRedeemed` | redeemCoupon | merchant stats |
| `SubmissionRejected` | workflow | notify user |
Each rule target has a DLQ (SQS) and retry policy (2 retries, 1 h max age).

## 6. Step Functions `VerifyProof` (ASL outline)
```
Start → ModerationCheck (Rekognition SDK integration: DetectModerationLabels)
  → Choice unsafe? → Reject
  → ExifAndHash (Lambda) → Choice duplicate|stale|far → Reject
  → DetectLabels (Rekognition SDK integration)
  → BedrockJudge (Lambda; or direct bedrock:InvokeModel SDK integration)
  → Choice:
      confidence ≥ 0.8 AND labelsMatch → Award (Lambda)
      confidence ≥ 0.5               → HumanReview (Lambda .waitForTaskToken, stores token on SUB item, timeout 48 h → Reject)
      else                            → Reject
Award → PutEvents ActionVerified (SDK integration) → Succeed
```

### Bedrock judge prompt (Nova Lite via Converse API)
System: "You verify civic waste-action photos for an Indian municipal app. Respond ONLY with JSON: {\"verdict\":\"APPROVE|REVIEW|REJECT\",\"confidence\":0-1,\"reason\":\"<20 words\",\"observed\":[...]}. Be strict: stock images, screenshots, indoor photos for outdoor tasks, or images not matching the rubric must be REJECT."
User: task rubric from catalog (e.g. D08: "Before and after images of the SAME outdoor spot. After image must show visibly less litter. Same background landmarks.") + images + Rekognition labels.
Parse with zod; on parse failure → REVIEW. Cache verdict by phash for 24 h.

## 7. Territory health updater (DynamoDB Stream / EventBridge consumer)
- Batch events per territory (Lambda batch size 50).
- `UpdateItem STATS#<day> ADD creditsEarned :c, actions :1` and `ADD activeUsers :userSet` (string set).
- Recompute health with `game-rules.health.applyActions()`; conditional update on `version` attribute (optimistic lock, retry 3×).
- If mood bucket changed → PutEvents `TerritoryMoodChanged`.

## 8. Cedar policies (examples)
```cedar
permit (principal in Group::"ward_admin", action == Action::"ManageQrSource", resource)
when { resource.wardId == principal.wardId };

permit (principal in Group::"collector", action == Action::"IssueRotatingToken", resource)
when { resource.ownerSub == principal.sub && resource.active };

forbid (principal, action == Action::"RedeemCoupon", resource)
when { principal.flagged == true };
```
Evaluate in `domain/authz.ts` with entities built from the JWT + loaded resource.

## 9. Fixes vs the earlier generated blueprint (don't reintroduce these)
- `UpdateExpression: "ADD totalPoints :pts, lifetimePoints :ptsSET ..."` is invalid (missing space before `SET`) and the PK used smart backticks with invisible characters — use plain template literals.
- `userId` was read from the request body → anyone could credit any account. Use JWT `sub`.
- No QR validation, no idempotency, no cooldown → infinite points by re-sending the request. Fixed via §2 transaction + §3 tokens.
- Points update and event publish were not atomic with any ledger → no audit trail. Ledger is now the source of truth.
- `ACTION#LOG#<Region>` as a partition for every action in a city = hot partition; replaced by per-territory daily STATS items.
- GSI on `region` + `lifetimePoints` mixed users from all periods; leaderboards are now per period.
- ElastiCache, Kinesis, AppSync, per-token KMS removed (cost, no demo value).

## 10. Testing
- `packages/game-rules`: vitest, table-driven tests for every formula in 05-GAME-DESIGN.md including the worked example (expect 138).
- Handlers: vitest + `aws-sdk-client-mock` for DynamoDB/Location/Bedrock.
- One end-to-end script `scripts/e2e.ts` against the deployed stage: sign up test user (AdminCreateUser), onboard, scan a seeded static QR with matching coords, assert balance increased, redeem coupon.

## 11. Environment variables (set by CDK)
`TABLE_NAME, IDEM_TABLE_NAME, EVENT_BUS_NAME, PROOF_BUCKET, ASSET_CDN_URL, LOCATION_TRACKER, LOCATION_GEOFENCES, LOCATION_PLACE_INDEX, QR_KEYS_PARAM, BEDROCK_MODEL_ID (amazon.nova-lite-v1:0 or the inference-profile id), STATE_MACHINE_ARN, POWERTOOLS_SERVICE_NAME, POWERTOOLS_LOG_LEVEL, TZ=Asia/Kolkata`
