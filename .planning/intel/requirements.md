# Extracted Requirements

## REQ-auth-onboarding
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- description: User authentication with Cognito email OTP / Google sign-in and onboarding flow.
- acceptance: Citizens can sign in via email OTP or Google OAuth, select language (English or Hindi), grant location permissions, and receive an auto-assigned home H3 res-7 territory based on coordinates.
- scope: auth, onboarding, cognito, mobile, web

## REQ-territory-map
- source: docs/00-PROJECT-CONTEXT.md, docs/03-WEB-CONTEXT.md, docs/04-MOBILE-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Interactive H3 territory map with animal mascots and health visualization.
- acceptance: Web and mobile apps render an interactive MapLibre map displaying H3 res-7 hexagonal cells colored by land-cover animal mascot, showing current territory health (0–100) and mood state (Sick, Recovering, Thriving, Legendary).
- scope: territories, map, mascots, visualization

## REQ-task-board
- source: docs/00-PROJECT-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Dynamic periodic task assignment board.
- acceptance: Each user receives a daily board of 3 tasks (1 segregation habit, 1 T1, 1 T2), weekly board of 3 tasks, and monthly board of 2 personal tasks + 1 community goal. Assignments are generated deterministically using pure functions seeded by userId and period key.
- scope: tasks, daily board, periodic refresh, game rules

## REQ-qr-verification
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Dual QR code verification system (static signed QR and dynamic rotating collector QR).
- acceptance: Scanning static QR on bins/hubs validates HMAC signature, timestamp, and device geofence (within 75 m). Scanning rotating collector QR validates 30-second TTL, collector device position via Amazon Location Tracker (within 150 m), enforces per-source cooldowns, and executes idempotently.
- scope: qr, verification, location, geofence, collector

## REQ-credit-ledger
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Transactional Green Credit (GC) and XP calculation and ledger.
- acceptance: Pure game rules calculate credits: base × verification weight × capped multipliers (streak, explorer, need, event max 2.0x) + flat bonuses. DynamoDB TransactWriteItems atomically updates user balance, appends immutable ledger record, updates task progress, and awards 2 GC to collector if applicable.
- scope: credits, ledger, transactions, game rules

## REQ-wallet-coupons
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Green Credit wallet and coupon redemption marketplace.
- acceptance: Users can view their current GC balance, lifetime XP, tier rank, and transaction history. Users can redeem coupons from seeded demo merchants via atomic conditional writes preventing double-spend and enforcing weekly per-merchant limits.
- scope: wallet, coupons, merchants, redemption

## REQ-territory-health-decay
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Territory health tracking, async calculation, and nightly decay.
- acceptance: DynamoDB Streams on ledger entries trigger async Lambda to recalculate territory health from verified actions. Nightly EventBridge Scheduler applies a 3% health decay and updates mascot mood state. TerritoryMoodChanged events are published to EventBridge.
- scope: territory health, decay, streams, eventbridge

## REQ-photo-verification-pipeline
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- description: Multi-stage AI photo proof verification pipeline.
- acceptance: Submissions obtain S3 presigned upload URL; upload triggers Step Functions workflow that checks EXIF/GPS metadata, checks perceptual image hash deduplication, runs Rekognition label/moderation detection, and invokes Bedrock Nova Lite multimodal model. High-confidence results auto-approve or reject; borderline cases enqueue for admin review with wait-for-task-token callback.
- scope: photo verification, ai, bedrock, rekognition, step functions

## REQ-collector-mode
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/04-MOBILE-CONTEXT.md
- description: Dedicated mobile collector mode for garbage truck drivers and informal recyclers.
- acceptance: Users with collector role can switch to collector mode to display rotating signed QR codes (30-second HMAC refresh), stream live GPS coordinates to Amazon Location Tracker, view today's scan count, and earn 2 GC per unique citizen scan.
- scope: collector mode, rotating qr, mobile, location tracker

## REQ-municipal-console
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/03-WEB-CONTEXT.md
- description: Web-based ward admin console for municipal officers and RWAs.
- acceptance: Ward admins authenticated with Cedar authorization can view ward-level territory health, hotspot heatmap, manage registered QR sources (bins, trucks, e-waste points) with printable PDF/SVG generation, review flagged photo submissions, and create territory bounties.
- scope: admin console, municipal, web, cedar, review queue

## REQ-hotspot-bounties
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Citizen garbage vulnerable point (GVP) reporting and bounty creation.
- acceptance: Citizens can report illegal waste dumping hotspots with geo-tagged photo proof. Validated hotspots deduct territory health points and auto-generate high-reward cleanup Bounty tasks for nearby citizens (within 2 H3 rings).
- scope: hotspots, bounties, reports, civic action

## REQ-leaderboards
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md, docs/05-GAME-DESIGN.md
- description: Multi-tier leaderboards for citizens, territories, and wards.
- acceptance: DynamoDB GSI queries power weekly individual leaderboards per territory, citywide leaderboards, and territory-vs-territory weekly health gain rankings.
- scope: leaderboards, rankings, gamification

## REQ-live-truck-tracking
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md, docs/04-MOBILE-CONTEXT.md
- description: Live garbage truck map tracker and proximity notifications.
- acceptance: Active truck collector positions are polled or pushed to the map interface; entering an H3 territory triggers geofence evaluation and pushes notification events to citizens in that cell.
- scope: truck tracker, amazon location, notifications, map
