# SaafSafari: Backend Review, X Factor, and Fix Plan

Reviewed: 10 Oct 2026, the build day before submission.
Scope: `services/api` (all 20 handlers and utils), `packages/game-rules`, `packages/shared` (schemas), `infra` (all 6 CDK stacks), `scripts/seed.ts`, and the mobile files that call the API (`api.ts`, `AuthContext.tsx`, `totp.ts`, `CollectorHomeScreen.tsx`, `ScanScreen.tsx`, `PhotoProofModal.tsx`).

---

## 1. Verdict in one paragraph

The backend is well built. It has a clean single-table design, atomic `TransactWriteItems`, pure and unit-tested game rules, a good coupon redemption flow, and sensible CDK stacks. **However, three of the features the pitch depends on are not wired up yet, and the mobile app doesn't call the backend at all.** A judge who looks at the AWS console or the code will see this. You were previously marked down on "execution 1/4". Fixing these gaps is worth more than adding anything new.

---

## 2. The X factor

### Pitch line
> **"Proof-of-Action: every Green Credit is backed by evidence, and the waste worker gets paid in the same scan."**

### Why this is the X factor (and what isn't)
- Gamified cleanliness apps already exist (Swachhata, Mission LiFE pledges, Kawasaki's Carb0n Club). Points, maps and mascots alone are not unique.
- What *is* unique here is in the code already:
  1. **The "Verified Handshake".** A citizen scans the rotating QR on a collector's or kabadiwala's phone. The server checks the HMAC token (30 s window) and proximity, then **pays both sides atomically** (`verifyScan.ts`, COL-02: +2 GC to the collector inside the same transaction). That makes the informal recycler visible and rewarded. No government app does this.
  2. **A trust ladder.** The multiplier comes from how strong the proof is: rotating QR > static QR plus geofence > AI-verified photo > self-declared (`game-rules/credits.ts`). Credits work like a verifiable ledger, not just points.
  3. **Citizen action turns into ward action.** Territory health, hotspot reports and auto-created bounties feed the municipal console.

### What makes the X factor convincing in the video
Show **one real, unedited handshake**: the collector phone shows a QR → the citizen phone scans it → both balances change → the territory health number moves in the console. Then show **one real AI photo verdict** with Bedrock's reasoning text on screen. Both are broken today (see §3).

### Optional amplifier (only if P0 is done): "Ward Copilot"
A Lambda running nightly (and on demand) feeds territory health trends, open hotspots and scan counts to **Nova Micro** and gets back a 5-bullet ward action brief, e.g. "Yamuna Bank down 18 % in 3 days, 4 open dumping hotspots, truck TRK-2 skipped Sector 4 twice → reroute." This fills the "Idea & Impact" column: the AI isn't only judging photos, it's telling the municipality what to do. The text model is cheap (Nova Micro); cache one brief per ward per day in DynamoDB.

---

## 3. Critical findings (break the demo or the pitch)

| # | Finding | Where | Impact |
|---|---|---|---|
| C1 | **The mobile app is fully mocked.** It uses a hard-coded `demo-jwt-token-aarav` instead of a Cognito token. Scans don't call `/v1/scans`, and photo proof is a `setTimeout`. | `AuthContext.tsx:66-74`, `ScanScreen.tsx`, `PhotoProofModal.tsx:27` | No end-to-end flow exists. The API Gateway JWT authorizer would reject the fake token with 401 anyway. |
| C2 | **The mobile code calls endpoints that don't exist:** `/v1/auth/otp/send`, `/v1/auth/otp/verify`, `/v1/territories`, `/v1/trucks/telemetry`. The payload shapes are also wrong: the scan sends `{qrData}` but the API expects `{sourceId, qrPayload, latitude, longitude}`; redeem sends no `merchantId` (required); trucks expects an array but gets `{trucks,count}`. | `apps/mobile/src/services/api.ts` vs `infra/lib/api-stack.ts` | Wiring the app up will fail until the client and API agree. |
| C3 | **The rotating QR can never be valid.** The collector app signs with a 32-bit JS string hash and a hard-coded secret (`'demo-secret-key-mcd-truck'`), giving a 16-character signature. The server expects HMAC-SHA256 (64 hex characters) with the per-source `secretKey`. The default `sourceId` `truck-dl1m-4821` also doesn't match the seeded IDs. | `utils/totp.ts` vs `utils/hmac.ts` | The headline handshake always returns `Signature mismatch`. |
| C4 | **Nothing starts the Step Functions workflow.** There's no S3 event and no `StartExecution` anywhere. Submissions stay in `PENDING_UPLOAD` forever. | `workflow-stack.ts`, `createSubmission.ts` | The "Step Functions + Rekognition + Bedrock" pipeline never runs in production. |
| C5 | **Bedrock never sees the photo.** The Nova Lite call is text-only and only receives Rekognition label names. It isn't multimodal. | `evaluateSubmission.ts` (prompt block) | The "AI photo verification" claim isn't true as implemented. |
| C6 | **It fails open: errors cause auto-approval.** If Rekognition throws, labels default to `['Outdoors','Ground','Waste','Plastic']`. That gives 2 waste matches, so a 0.85 score and **AUTO_APPROVED with 100+ GC**. A Bedrock error also falls back to label scoring. | `evaluateSubmission.ts` catch blocks | Any outage or permission error pays every upload. |
| C7 | **The human review callback is fake.** The workflow uses a plain `LambdaInvoke`, so no task token is ever produced. "Flagged" goes to a `Pass` state and the execution ends. `resolveReviewQueue` waits on a `taskToken` that is always null. | `workflow-stack.ts`, `resolveReviewQueue.ts` | Step Functions does no orchestration work. |
| C8 | **The "live" truck isn't live.** `getLiveTrucks` scans DynamoDB for the *static registered* QR location. The Location tracker is created and IAM is granted, but no code reads or writes it (`@aws-sdk/client-location` isn't even a dependency). `verifyScan` checks proximity against the static location too. | `getLiveTrucks.ts`, `verifyScan.ts`, `geo-stack.ts` | Amazon Location is decorative. |
| C9 | **There's no web console in this repo.** `apps/web/src` is the Butter landing-page clone (Hero, BlocksShowcase, KeychainScene…). The municipal console and review queue UI aren't here. Check whether they live in `Oru-frontend` or `Oru-main`. | `apps/web/src` | Section 6 of the demo script has nothing to show from this repo. |

## 4. Security and correctness findings

| # | Finding | Where | Fix |
|---|---|---|---|
| S1 | **Admins can be double-paid.** `resolveReviewQueue` doesn't check the current status, so the same submission can be approved repeatedly (default 100 GC each time), including already REJECTED or AUTO_APPROVED ones. | `resolveReviewQueue.ts` | Add `ConditionExpression: '#st = :flagged'` on the submission update. |
| S2 | **IDOR (any user can read other users' records):** `GET /v1/submissions/{id}` has no ownership check and returns `s3Key`, GPS and `taskToken`. | `getSubmission.ts` | Return 404 unless `item.userId === sub` or the caller is `ward_admin`; strip `taskToken`. |
| S3 | **Static QR codes are unsigned.** Bins and e-waste points are verified only by `sourceId` plus GPS. `secretKey` is seeded but never checked, and `sourceId`s are guessable (`qr_bin_…`). | `verifyScan.ts` | Print `sourceId.HMAC(secret, sourceId)` on static QRs and verify it. |
| S4 | **The cooldown has a race condition.** It's read-then-write, and the cooldown `Put` has no condition, so two parallel scans both pay. | `verifyScan.ts` | Add `ConditionExpression: 'attribute_not_exists(PK) OR #ttl < :now'` on the COOLDOWN put. |
| S5 | **Hotspot spam lets one user wreck a territory.** There's no rate limit: each report costs the territory −5 health (with no floor, so it can go negative) and creates a 120 GC bounty. One user can sink a rival territory. | `reportHotspot.ts` | Limit to 3 per user per day (conditional counter item); floor health at 0; ask for a photo before the penalty applies. |
| S6 | **Health is unbounded.** `health = health + :gain` has no 100 cap. Admin approval uses `if_not_exists(health, 100) + 2`, so it starts *above* 100. | `verifyScan`, `evaluateSubmission`, `checkinHabit`, `resolveReviewQueue`, `reportHotspot` | Compute the clamped value in code and `SET health = :new` with `ConditionExpression: health = :old` (optimistic lock), or clamp in the nightly job and on read. |
| S7 | **The ledger is split across two schemas.** Admin approvals write `PK=LEDGER#user / SK=TX#…`; everything else writes `PK=USER#… / SK=LEDGER#…`. The wallet history query never shows admin-approved credits. | `resolveReviewQueue.ts` vs `getWallet.ts` | Use `USER#id / LEDGER#iso#txId` everywhere. Also add a random suffix to `LEDGER#nowIso` to avoid same-millisecond collisions. |
| S8 | **"Cedar" is a hand-written if/else**, not the Cedar engine. The `custom:assigned_ward` attribute it checks doesn't exist in the user pool, so ward scoping never runs. | `utils/cedar.ts`, `auth-stack.ts` | Either use `@cedar-policy/cedar-wasm` with a real `.cedar` policy file (free, runs inside the Lambda), or describe it as "Cedar-style RBAC" in the video. Add the `assigned_ward` custom attribute. |
| S9 | **Auth doesn't match the docs.** Email OTP isn't enabled (no `USER_AUTH` / `allowedFirstAuthFactors.emailOtp`, which needs the Essentials feature plan) and there's no Google IdP. `USER_PASSWORD_AUTH` and `ADMIN_USER_PASSWORD_AUTH` are on. | `auth-stack.ts` | For the demo, use password sign-in with the users from `setup-demo-users.ts` and say "email OTP in production". Don't claim OTP in the video unless you add it. |
| S10 | **The photo upload has no size or type limit.** A presigned PUT has no content-length limit; the bucket CORS is `*`. | `createSubmission.ts`, `data-stack.ts` | Switch to `createPresignedPost` with `content-length-range` 0–5 MB and `image/jpeg`. |
| S11 | **The auto-approve reward ignores the user's state.** It hard-codes `streakDays: 0, territoryHealth: 70` and doesn't add the user's XP to their tier. | `evaluateSubmission.ts` | Load the profile and territory as `verifyScan` does. |
| S12 | **There's no logging.** Powertools Logger is installed and configured through environment variables but never imported. Every `catch` swallows the error and returns a generic 500. | all handlers | Add `logger.error({err})` in catches. This is a 10-minute job and makes debugging on build day much faster. |
| S13 | **GPS spoofing goes unchecked.** All geofences trust client GPS. | `verifyScan.ts` | Send expo-location's Android `mocked` flag and reject if true. The rotating QR plus collector proximity is the real defence; say so in the pitch. |
| S14 | **Two smaller issues:** the collector ID falls back to a hard-coded `'collector_ramesh_kumar'`, and `checkinHabit` uses the UTC date, so the "day" flips at 5:30 AM IST. | `verifyScan.ts`, `checkinHabit.ts` | Return 500 if `collectorId` is missing; compute the date in `Asia/Kolkata`. |
| S15 | **Scans won't scale.** The leaderboards, live trucks, territory overview and nightly decay all use full-table `Scan`. That's fine for 25 users and 68 territories, but not beyond. | multiple | After the demo, aggregate into `STATS#…` items with DynamoDB Streams and a Lambda. |

What's already good: coupon redemption (conditional balance and stock checks, weekly-limit put, all in one transaction), HMAC verification with `timingSafeEqual` and a drift window, zod validation on every input, Node 22 arm64 with esbuild ESM bundling, and the rules engine as a pure tested package.

---

## 5. Fix plan, ordered by demo value (time is short: video due tomorrow afternoon)

### P0: make one real flow work (~4 h)

**1. Server-issued rotating QR (fixes C3, keeps the secret off the phone), ~45 min**
```ts
// services/api/src/handlers/collector/getQrToken.ts  → GET /v1/collector/qr-token (secured)
const groups = String(claims['cognito:groups'] ?? '');
if (!groups.includes('collector')) return forbidden();
const profile = (await get(`USER#${sub}`, 'PROFILE')).Item;
const src = (await get(`QR#${profile.assignedSourceId}`, 'METADATA')).Item;
const token = generateRotatingQrToken(src.secretKey, src.sourceId);
return ok({ qrPayload: JSON.stringify({ sourceId: src.sourceId, token }), refreshInMs: 25_000 });
```
Collector screen: poll every 25 s and render `qrPayload`. Delete `utils/totp.ts`. Citizen scan screen: `JSON.parse(scanned)` → POST `{sourceId, qrPayload: token, latitude, longitude}`.

**2. Real auth and API contract on mobile (fixes C1, C2), ~1.5 h**
- Sign in with Cognito `InitiateAuth` (USER_PASSWORD_AUTH) or `aws-amplify` Auth, using the demo users. Pass the IdToken as `Authorization: Bearer`. The authorizer audience is the client ID, so the **ID token** works.
- Align `api.ts` with the real routes. Remove `/v1/auth/otp/*` and `/v1/territories` (serve territories from the GeoJSON on CloudFront). Send `merchantId` on redeem.

**3. Make the AI pipeline real (fixes C4, C5, C6), ~1.5 h**
```ts
// data-stack.ts
new s3.Bucket(this, 'ProofsBucket', { ..., eventBridgeEnabled: true });

// workflow-stack.ts
new events.Rule(this, 'ProofUploaded', {
  eventPattern: { source: ['aws.s3'], detailType: ['Object Created'],
    detail: { bucket: { name: [proofsBucket.bucketName] }, object: { key: [{ prefix: 'proofs/' }] } } },
  targets: [new targets.SfnStateMachine(this.stateMachine, {
    input: events.RuleTargetInput.fromObject({
      s3Bucket: events.EventField.fromPath('$.detail.bucket.name'),
      s3Key: events.EventField.fromPath('$.detail.object.key'),
    }) })],
});
```
In `evaluateSubmission`, derive `submissionId` from the key (`proofs/{user}/{id}.jpg`), then **send the image to Nova**:
```ts
const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key }));
const bytes = await obj.Body!.transformToByteArray();
const res = await bedrock.send(new ConverseCommand({
  modelId: process.env.NOVA_MODEL_ID ?? 'amazon.nova-lite-v1:0', // use the APAC inference profile id if not enabled in ap-south-1
  messages: [{ role: 'user', content: [
    { image: { format: 'jpeg', source: { bytes } } },
    { text: `${prompt}\nRekognition labels: ${detectedLabels.join(', ')}` },
  ] }],
  inferenceConfig: { maxTokens: 300, temperature: 0.1 },
}));
```
- **Fail closed:** on any Rekognition or Bedrock error, set `FLAGGED_FOR_REVIEW` and never auto-approve. Delete the fake-label fallback.
- **Dedupe:** compute the SHA-256 of `bytes`, then `Put IMGHASH#<sha>` with `attribute_not_exists`. If it exists, reject as a re-used photo.
- Add `/v1/submissions/{id}/confirm` or let the client poll `GET /v1/submissions/{id}` to show the verdict and reasoning on screen. **That's your demo shot.**

### P1: security fixes in about an hour total
S1 status condition · S2 ownership check · S4 conditional cooldown · S5 hotspot limit and health floor · S6 health clamp · S7 one ledger schema · S12 logger. Each is a few lines.

### P2: make the remaining AWS services load-bearing (only if P0 and P1 work)
- **Live truck (C8):** add `POST /v1/trucks/telemetry` (collector-only) → `BatchUpdateDevicePosition` on the tracker. `getLiveTrucks` → `BatchGetDevicePosition`. `verifyScan` (truck) → `GetDevicePosition` for the collector's device and checks the 150 m distance against *that* position.
- **Real human-in-the-loop (C7):** on Flagged, run a `LambdaInvoke` with `integrationPattern: WAIT_FOR_TASK_TOKEN` and payload `{ submissionId, taskToken: sfn.JsonPath.taskToken }` that stores the token. The admin approve and reject actions then resume the execution. Change "Rejected" from `Fail` to `Succeed` so the console isn't full of red executions.
- **Real Cedar (S8):** `@cedar-policy/cedar-wasm` plus `policies/admin.cedar`.
- **Ward Copilot (§2):** an EventBridge nightly rule → Lambda → Nova Micro → `WARD_BRIEF#date` item → shown in the console.

### Dashboards (low cost)
- **Ops dashboard:** add a CDK `cloudwatch.Dashboard` with Lambda errors and p95 duration for `verifyScan` and `evaluateSubmission`, Step Functions succeeded/failed, and API 4xx/5xx. It costs little or nothing (CloudWatch's always-free tier includes a few dashboards) and gives a strong 5-second shot in the architecture segment.
- **Impact dashboard (municipal console):** territory health over time, verified actions by trust level, auto-approve vs flagged vs rejected rate, kabadiwala and collector earnings, and open hotspots. The AI approval-rate chart backs up the "every credit is backed by proof" pitch.

---

## 6. Cost guardrails (Free Plan with credits)
- Bedrock has **no free tier**. Nova Lite with one image per submission is a few hundredths of a cent per call; keep `maxTokens` around 300 and dedupe by hash so re-uploads cost nothing.
- Lambda, DynamoDB on-demand at this scale, API Gateway HTTP, EventBridge, Step Functions Standard (low transition count) and CloudWatch basics all stay within free allowances or very small amounts at demo volume.
- Amazon Location: telemetry every 10–15 s from 1–3 trucks only during recording.
- Set an AWS Budget alert (it's also one of the credit-earning onboarding activities).

---

## 7. Video claims checklist (claim only what's true after the fixes)
- [ ] "Rotating QR handshake pays citizen and collector": true after P0-1 and P0-2
- [ ] "Bedrock Nova *vision* verifies photos": true after P0-3
- [ ] "Step Functions orchestrates AI + human review": partly true after P0-3; fully true after the P2 task token
- [ ] "Live truck on Amazon Location": only after the P2 live-truck work
- [ ] "Cedar policies": only after P2, otherwise say "role-based policies"
- [ ] "Email OTP sign-in": no, say "production step"
