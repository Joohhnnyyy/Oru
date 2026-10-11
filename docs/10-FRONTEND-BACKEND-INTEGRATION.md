# Root frontend ↔ existing AWS backend

Verified 11 October 2026. `frontend` is the real application; `apps/web` and the HTML previews remain references. Backend code stays in `services/api` and infrastructure in `infra`.

The implementation uses the **current deployed contracts**, checked against API Gateway and Lambda handlers. `01-AWS-REQUIREMENTS.md` and `02-BACKEND-CONTEXT.md` describe the target architecture; several paths and features in those documents are planned, rather than deployed. The frontend never invents an endpoint or substitutes prototype rewards when a request fails.

## Connection

From the repository root:

```sh
pnpm export-env --frontend-only
pnpm --dir frontend dev
pnpm --dir frontend verify:backend
```

The export uses the local, git-ignored `cdk-outputs.json`. It writes only public `VITE_*` connection settings to `frontend/.env.local`, preserves custom frontend settings, and leaves backend environment files alone. In restricted environments, use `node --import tsx scripts/export-env.ts --frontend-only`.

Amplify publishes `frontend/dist`. Set `VITE_API_URL`, `VITE_COGNITO_CLIENT_ID`, and `VITE_COGNITO_REGION=ap-south-1` in Amplify's build environment; the ignored local output file is not available in a clean checkout. If present, the build imports that output file. Never put AWS access keys into frontend variables.

Authentication uses the deployed Cognito client's `USER_PASSWORD_AUTH` flow and sends its **ID token** as a bearer token to API Gateway. Role gates use Cognito groups; the backend authorizes each request independently. Tokens remain in memory, so a full reload requires sign-in. A 401 clears the session and prompts sign-in; a 403 does not clear a valid session. Account/API responses are excluded from service-worker caching; API requests use `no-store`.

## Connected pages

| Screens | Existing endpoint/service |
|---|---|
| Sign-in, onboarding journey, profile | Cognito; `GET/PATCH /v1/me`, `POST /v1/onboarding` |
| Guardian home and tasks | Profile, `GET /v1/tasks`, `POST /v1/tasks/checkin` |
| Wallet, coupons and merchant offer listing | `GET /v1/wallet`, `GET /v1/coupons`, `POST /v1/coupons/redeem` |
| QR scanner | `POST /v1/scans`; camera and geolocation requested for verification |
| Photo proof and status | `POST /v1/submissions`, signed JPEG PUT to S3, `GET /v1/submissions/{id}` |
| Community, issue report, explore filters | `GET/POST /v1/hotspots`, `GET /v1/trucks/live` |
| Rankings | `GET /v1/leaderboards?type=citywide\|territory\|territories` |
| Municipal overview, territories, current reports | `GET /v1/admin/territory-overview`; CSV exports only the returned snapshot |
| Human review | `GET /v1/admin/review-queue`, `POST /v1/admin/review-queue/resolve` |
| QR registration and printable static QR | `GET/POST /v1/admin/qr-sources`; client renders the existing scan payload |
| Collector handover | `GET /v1/collector/qr-token`; server-issued rotating QR, optional location update |

Onboarding submits only after explicit location consent. It keeps the chosen language between stages and shows the assigned territory returned by the server. Guardian art is decorative: the current profile does not return an assigned species or territory health, so neither is fabricated.

Mutation results are shown only after API success. Direct links to feedback screens load the real underlying task, wallet, profile or proof view; they do not display fabricated credits, vouchers or moderation decisions. Proof feedback URLs require the real `?submission=<id>` to inspect a submission. Scanner results appear in the scanner after verification.

The live photo pipeline is S3 → EventBridge → Step Functions → Rekognition/Groq Qwen 3.8 27B, with human review resumed by the municipal API. The verifier uses Groq instead of Gemini. Its credential is stored in AWS Secrets Manager (`oru/groq-api-key`) for runtime retrieval; it is absent from source, frontend configuration and logs. The browser does not call AI services or hold signing keys. The deployed proof bucket's CORS permits the signed JPEG PUT.

The user explicitly approved sending all future proof photos to Google Gemini. The tested WorkflowStack update was deployed in Mumbai on 11 October 2026 (101 backend unit tests, 6 infrastructure tests, backend typecheck, reviewed AWS diff). Google's free-tier content may be used to improve its products; see https://ai.google.dev/gemini-api/docs/pricing.

The Mumbai Data and Workflow stacks were also deployed to enable the previously missing S3 upload trigger and human-review callback. Verified the bucket's EventBridge notification, the enabled `saafsafari-proof-uploaded` rule, and its target/input mapping to the existing verifier. No database or proof bucket was replaced. A real user-supplied image passed signed upload and Rekognition; the initial Nova call was blocked by AWS account verification and safely entered human review with no reward. Gemini 3.8 Flash was then tested on the same image without issuing rewards: it returned a complete verdict identifying a stock-photo watermark and rejecting it as genuine cleanup evidence. The original review record remains unchanged. The verifier rejects incomplete/invalid model responses and routes API failures to review.

The explore illustration is explicitly schematic. Truck/hotspot links use actual returned coordinates. An interactive Amazon Location tile map requires a restricted public map key or identity-pool setup that is not configured here.

## Deployment gaps

- Collector UI calls the deployed `GET /v1/collector/qr-token`, polls on the returned interval, and shares location only on request. The seeded demo collector is assigned to the existing demo truck. Additional collectors need their own source assignment.
- OTP sign-in, public territory detail/directory, historical ward metrics, bounty creation, merchant inventory writes, sorting assistant and energy bill verification have no mounted endpoints. Their screens say unavailable; simulated authentication, publishing, AI results and reward receipts have been removed.
- The Mumbai API stack was deployed to mount the collector route and issue signed static QR payloads. Signing secrets remain server-side; the frontend rejects legacy unsigned codes. Only the missing seeded collector account was provisioned and linked to the existing demo truck. Citizen/admin accounts and balances were not reset. Live verification did not spend coupons, record habits/scans or upload proof.
- Static hosts must serve the client shell for dynamic `/t/<id>` paths (for example a 200 rewrite to an account shell); public routes retain their prerendered HTML. Camera/location need HTTPS or localhost.

## Checks

- Live Cognito sign-in passed for seeded citizen, ward-admin and collector accounts.
- All 13 read checks against the deployed API returned 200, including wallet, tasks, rewards, truck/hotspot listings, review queue, signed QR sources, collector QR and territory overview.
- Browser checks passed for citizen home/tasks/wallet/coupons/map/rankings/profile and municipal overview/review/QR sources/reports/merchant offers. Checked desktop and 390px phone layouts, real data, no API alerts and no horizontal overflow. CSV export downloaded a real snapshot. Reduced motion disabled the guardian animation.
- Frontend tests cover role gates, onboarding consent/language, expired sessions, habits, redemption confirmation, hotspot reporting, signed uploads and API failures. These write-flow tests use mocks and do not claim live production mutations were exercised.
- The collector page rendered a real rotating QR in the browser. Frontend tests passed (70), backend unit tests passed (101 after the Gemini change), and the frontend environment exporter test passed. Type checking, lint and production build passed. The production build emits a large-bundle warning; current Lighthouse scores have not been measured.

The user-requested model switch to `gemini-3.5-flash-lite` was deployed on 11 October 2026 after backend type checking and all 13 verifier tests passed. The latest supplied segregation image received HTTP 200 and a positive verdict (0.95) with both the revised test prompt and the current live criteria. Those calls did not issue credits. The revised prompt remains test-only. Changing models does not guarantee freedom from transient 503 errors; the existing failure-to-review path remains active.

The bounded Gemini retry fix was deployed on 11 October 2026: up to three attempts within a 40-second request budget, 12-second per-attempt timeout, exponential backoff with jitter, and Retry-After respected. Only transient HTTP 429/500/502/503/504 and network/timeout failures retry; authentication errors and invalid verdicts continue to review. Response cancellation does not block retries. Backend tests passed (111), including retry recovery, exhaustion, nonretryable errors, and Retry-After. A live image call through the retry helper returned 200 with a positive verdict; no reward was issued. Gemini remained operational, so the user-authorized conditional Groq alternative was not invoked or deployed.

The user explicitly requested switching the live reward-bearing verifier to Groq. Deployed `qwen/qwen3.8-27b` in Mumbai on 11 October 2026, using `oru/groq-api-key` in Secrets Manager and removing verifier access to the Gemini secret. The corrected visual-evidence prompt now accepts household/workplace/institutional settings without guessed location or internet origin. Transient retries, moderation, duplicate protection, daily caps, and atomic reward transactions remain. Backend type checking and all 127 unit tests passed; the workflow infrastructure test passed. A real demo citizen submission (`sub_58aa0bd71952`) using the user-supplied wet/dry-bin image passed S3 upload, Rekognition, Groq (0.95), and automatic approval. The wallet increased by 2 GC and 10 XP. This is an authorized integration test with test coordinates, not evidence that the demo user performed a real action. API access is confirmed; Groq free-plan/billing status has not been independently verified.

### Geographic map and collection tracking — 11 October 2026

The root website now consumes `GET /v1/map`, Amazon Location Maps v2 tiles and tracker route history.
`/map` provides territory boundaries, guardian markers, registered bins/e-waste points, truck positions,
hotspots, bin reporting and collector pickup confirmation. `/t/:id` loads the actual territory guardian,
health and operational counts. Collector mode explicitly starts/stops browser GPS sharing; mounting the
page or refreshing a QR does not request location. Foreground GPS reports about every 10 seconds.

GeoStack and ApiStack were deployed successfully to the existing ap-south-1 environment. Live verification
returned 61 territories, 36 collection points, 10 trucks, a 200 map-style response and a successful 61/61
geofence synchronization. Citizen calls to the collector location endpoint return 403. No collectors were
sharing GPS at verification time, so all trucks correctly showed registered locations and no recent trails.
Dustbin fill is labelled estimated; GPS passing near a bin does not confirm a pickup or clear damage.
See `docs/11-CITY-MAP.md` for endpoints, permissions, operational setup and sensor limitations.
