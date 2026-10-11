# Audit Fix Log (11 Oct 2026)

Branch: `fix/audit-fixes` (2 commits on top of `chore: checkpoint before audit fixes`).
Verified in a clean install: typecheck passes for shared, game-rules, api, infra and mobile. Tests: api 98/98, game-rules 20/20, shared 7/7, infra (CDK synth) 6/6.

## Fixed (refs → 07-CODEBASE-AUDIT.md)
| Ref | Fix |
|---|---|
| A1–A4 | Mobile signs in to **Cognito** (USER_PASSWORD_AUTH, demo accounts) and calls the real API; client aligned with backend routes and payloads |
| A2 | Added `expo-camera`, `expo-location`, `expo-image-picker`, `react-native-qrcode-svg` (SDK 57 versions) |
| A5 | Removed simulated telemetry (`services/telemetry.ts`) |
| A6, B6 | New `GET /v1/collector/qr-token`: the server signs the rotating QR, so the secret never leaves AWS. Collector screen renders a real QR. Seed generates random 256-bit secrets and assigns trucks to collectors |
| A8, C16 | S3 `Object Created` → EventBridge → Step Functions. Flagged photos pause on a **task token** until a ward officer resolves them. Rejections are no longer "failed" executions |
| A9 | Review queue returns a 15-min presigned photo URL and the real AI reasoning |
| B1 | Photo proof reward rebalanced: 30 GC (was 200), below a verified truck handover (37 GC) |
| B2 | Evaluation **fails closed** (any Rekognition or Bedrock error → human review). Nova Lite receives the **actual image** (Converse API). SHA-256 duplicate-photo check. Max 3 auto-approvals/day. Idempotent on retries |
| B3 | Review resolve is conditional on `FLAGGED_FOR_REVIEW` (no double payout); default reward comes from the rules engine |
| B4 | `GET /v1/submissions/{id}`: owner or ward_admin only; `taskToken` stripped |
| B5 | Static bin/e-waste QRs must carry an HMAC signature (`pnpm demo:qr` prints them) |
| B7 | Cooldown write is conditional (parallel scans can't both pay) |
| B8, B9 | Hotspots: 3 reports/user/day, only for real territories, health floored at 0; public API no longer exposes reporter IDs |
| C1 | Onboarding never overwrites an existing profile (returns it, 200) |
| C2 | `PATCH /v1/me` returns 404 before onboarding (no ghost profile) |
| C3 | No hard-coded collector fallback |
| C4 | Territory health clamped to 0–100 after every change |
| C5, C6 | One ledger schema everywhere; ledger keys get a random suffix |
| C7, C8 | Nightly decay updates only health and mood (no whole-item overwrite); writes both `mood` and `moodState` |
| C12 | Streak day = IST with a 3 AM cutoff |
| C13 | Auto-approved rewards use the user's real streak and territory health |
| C15 | Truck proximity uses the collector phone's **live GPS** (fresh ≤ 2 min), also pushed to the **Amazon Location tracker**; `/v1/trucks/live` shows live positions |
| D2 | Error logging in all handler catch blocks |
| — | Mock-GPS (Android `mocked`) scans rejected |

## Not done yet
- **A7:** `apps/web` is still the Butter clone, so don't link it in the submission.
- **Mobile Home/Tasks/Rewards/Leaderboard/Map** still show hard-coded lists. Scan, Collector and Photo Proof are real.
- **A10:** the map is Google 3D, not Amazon Location.
- B10 (API throttling/WAF), B11 (real Cedar / Verified Permissions), C9 (scan pagination), C11 (task-completion rewards), D1 (retain data / PITR), D3 (upload size enforced at evaluation, not at upload), D4 (email OTP).

## Deploy and run
```bash
cd ~/Oru
pnpm install                 # picks up new deps, updates the lockfile
pnpm test                    # all green
# AWS console → Bedrock → Model access: enable Amazon Nova Lite (Mumbai + APAC regions, for the apac.* inference profile)
pnpm deploy:backend
pnpm seed                    # ⚠ resets demo data and rotates all QR secrets
pnpm demo:users              # demo-citizen / demo-collector / demo-admin
pnpm demo:qr                 # printable bin QRs → docs/demo-qr/index.html
cd apps/mobile && npx expo start   # works in Expo Go; rebuild the APK for the submission
```
The demo password lives in `apps/mobile/app.json` → `extra.demoPassword`. It ships inside the app bundle, so use it for demo accounts only.
