# Phase 4 Context: Async Workflows, AI Photo Pipeline & Admin Services

## Purpose
Implement and test the asynchronous event-driven workflows, multimodal AI photo verification pipeline, civic hotspot reporting with automated bounty task generation, nightly territory health decay scheduler, and municipal admin management APIs with Cedar authorization:
1. Citizen photo proof submission service (`POST /v1/submissions`) generating presigned S3 PUT URLs with strict upload constraints (`AI-01`).
2. Multimodal AI verification pipeline (`AI-02`, `AI-03`) using AWS Step Functions, Amazon Rekognition (moderation & label detection), and Amazon Bedrock Nova Lite (`amazon.nova-lite-v1:0`):
   - Auto-approves genuine civic cleanup/segregation proof ($\ge 0.75$ confidence) and distributes Green Credits and XP.
   - Automatically suspends borderline submissions ($0.35 \le \text{score} < 0.75$) with Step Functions task tokens in the municipal review queue.
   - Auto-rejects invalid or inappropriate submissions ($< 0.35$ score or moderation flags).
3. Citizen illegal dumping hotspot reporting (`POST /v1/hotspots`, `GET /v1/hotspots`) that automatically deducts territory health and generates high-reward community Bounty tasks for nearby citizens (`HOT-01`, `HOT-02`).
4. Municipal admin console endpoints (`ADM-01`, `ADM-02`, `ADM-03`) protected with Cedar authorization:
   - Territory health overview & hotspot density (`GET /v1/admin/territory-overview`).
   - QR source registry and lifecycle management (`POST /v1/admin/qr-sources`, `GET /v1/admin/qr-sources`).
   - Human-in-the-loop review queue resolution (`GET /v1/admin/review-queue`, `POST /v1/admin/review-queue/resolve`) completing Step Functions callbacks.
5. EventBridge Scheduler executing nightly 3% territory health decay across all 68 Delhi NCR territories (`MAP-03`).

## Requirements Covered
- **AI-01**: User can submit cleanup or segregation photo proof with presigned S3 upload, GPS coordinates, and timestamp validation.
- **AI-02**: Step Functions workflow verifies image moderation with Rekognition and evaluates proof validity using Amazon Bedrock Nova Lite.
- **AI-03**: Borderline submissions automatically suspend in Step Functions with task-token callback awaiting human review in the municipal console.
- **HOT-01**: Citizen can report illegal garbage dumping hotspots with geo-tagged photos and descriptions.
- **HOT-02**: Validated hotspots deduct territory health and automatically spawn high-reward cleanup Bounty tasks for nearby citizens.
- **ADM-01**: Ward admins can view ward-level territory health overview and a hotspot density heatmap.
- **ADM-02**: Ward admins can register and manage QR sources (bins, trucks, e-waste hubs) and export printable QR codes.
- **ADM-03**: Ward admins can review flagged photo submissions, approve/reject with feedback, and complete Step Functions callbacks.
- **MAP-03**: Territory health decays 3% nightly via EventBridge Scheduler and recalculates from daily verified actions.

## Locked Architecture & Decisions Honored
- **DEC-03 (Single-Table DynamoDB & TransactWriteItems):** Submissions, hotspots, bounties, and review items persist in `SaafSafariMain`. Approvals credit user balances and update territory health atomically.
- **DEC-04 (Pure Rules Engine):** Decay formula `applyNightlyDecay(health, 0.03)` and bounty reward calculations imported from `@saafsafari/game-rules`.
- **DEC-07 (Step Functions + Rekognition + Bedrock Nova Lite):** Lowest-cost serverless vision verification pipeline combining Rekognition filters with Bedrock Nova Lite reasoning.
- **DEC-09 (Cedar Authorization in Lambda):** Enforces strict role-based and ward-scoped tenancy for municipal administrators.
- **DEC-11 (Backend-First):** 100% backend async workflows, state machines, and admin APIs built and verified before frontend client apps initialize.
- **CON-01 (Security & Identity):** Authenticated endpoints extract user claims and groups (`citizen`, `ward_admin`) from JWT authorizer context.
