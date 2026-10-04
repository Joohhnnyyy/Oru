# Extracted Architecture & Design Decisions

## DEC-01: Identity & Authentication via Amazon Cognito with Email OTP and Google Sign-in
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md
- status: locked
- decision: Use Amazon Cognito User Pool with passwordless Email OTP and Google federation. SMS OTP is explicitly excluded due to Indian TRAI DLT registration lead times. User groups are citizen, collector, ward_admin, and merchant.
- scope: authentication, identity, Cognito, security

## DEC-02: Backend Runtime and Infrastructure via Node.js 22 Lambdas and AWS CDK
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Build backend services with TypeScript on Node.js 22 (arm64) AWS Lambda functions bundled via CDK NodejsFunction (esbuild). API exposed through Amazon API Gateway HTTP API with Cognito JWT authorizer. Single Python 3.12 Lambda reserved for offline territory generation/agent tasks.
- scope: backend runtime, AWS Lambda, API Gateway, AWS CDK, TypeScript

## DEC-03: Single-Table DynamoDB Architecture with TransactWriteItems
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Use Amazon DynamoDB single-table design with on-demand billing, TTL, and 2 GSIs (GSI1: SK/PK for lookups by type; GSI2: GSI2PK/GSI2SK for leaderboards). All balance-mutating writes must execute via conditional TransactWriteItems to guarantee balance consistency and prevent race conditions.
- scope: database, DynamoDB, persistence, transactions, single-table

## DEC-04: Asynchronous Processing and Event-Driven Architecture via EventBridge
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Use a custom EventBridge bus (`saafsafari`) for domain events (ActionVerified, HotspotValidated, CouponRedeemed, TerritoryMoodChanged). EventBridge Scheduler runs nightly health decay, periodic task generation, and QR key rotation. SQS buffers DLQs and async notifications.
- scope: events, EventBridge, asynchronous, scheduling, SQS

## DEC-05: Uber H3 Resolution-7 Hexagonal Territories with Dynamic Health Decay
- source: docs/00-PROJECT-CONTEXT.md, docs/05-GAME-DESIGN.md
- status: locked
- decision: Tile the demo area with Uber H3 resolution-7 hexagons (~5 km² each). Each territory is classified into an Indian animal mascot based on OSM land-cover tags. Territory health ranges 0–100, decays 3% nightly, and increases via verified citizen actions. Mascots transition across 4 mood states: Sick (<25), Recovering (25–59), Thriving (60–89), and Legendary (≥90).
- scope: spatial indexing, H3, gamification, territories, health decay

## DEC-06: Verification Trust Ladder and Anti-Farming Protections
- source: docs/00-PROJECT-CONTEXT.md, docs/05-GAME-DESIGN.md
- status: locked
- decision: Implement a strict trust ladder for verification: rotating QR + collector proximity (weight 1.2), static signed QR + geofence (weight 1.0), AI-approved photo via Bedrock + Rekognition (weight 1.0), document verification via Textract (weight 1.0), and self-declared (weight 0.5 with 15 GC/day hard cap). Multipliers are capped at 2.0x max, and photo/self-declared earnings are capped at 300 GC/day.
- scope: verification, credit engine, trust ladder, anti-abuse

## DEC-07: AI Photo Verification via Amazon Rekognition and Amazon Bedrock Nova Lite
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Process photo proofs using Step Functions Standard workflow: first pass with Amazon Rekognition DetectLabels and DetectModerationLabels for quick rejection, followed by multimodal reasoning with Amazon Bedrock Nova Lite (or cross-region inference profile if unavailable in ap-south-1). Results are cached by perceptual image hash (pHash) to avoid duplicate spending.
- scope: AI, computer vision, Bedrock, Rekognition, Step Functions

## DEC-08: Monorepo Architecture with pnpm Workspaces
- source: docs/00-PROJECT-CONTEXT.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Organize codebase as a pnpm monorepo containing `apps/web` (Vite + React + Tailwind + MapLibre), `apps/mobile` (Expo React Native), `services/api` (Lambda handlers), `infra` (AWS CDK TypeScript stacks), `packages/shared` (Zod schemas and types), `packages/game-rules` (pure functions for credit calculation and task generation), and `packages/ui-tokens`.
- scope: repository structure, monorepo, pnpm workspaces

## DEC-09: Fine-Grained Authorization using AWS Cedar Wasm in Lambda
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Execute fine-grained policy authorization inside Lambdas using `@cedar-policy/cedar-wasm`. Ward admins can only manage QR sources and review items within their assigned ward; collectors can only emit positions and QR tokens for their assigned equipment.
- scope: authorization, Cedar, security, RBAC

## DEC-10: Amazon Location Service for Maps, Geofencing, and Live Truck Tracking
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- status: locked
- decision: Use Amazon Location Service MapLibre vector tiles for web and mobile base maps, Geofence collection for static QR source validation, and Tracker resource for collector-mode live truck locations and distance validation.
- scope: geospatial, Amazon Location Service, tracking, geofence
