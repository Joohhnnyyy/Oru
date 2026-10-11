# Extracted Technical Constraints & Contracts

## CON-01: API Gateway and Lambda Contract
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- type: api-contract
- content: |
    API Gateway HTTP API v2 in ap-south-1.
    All private endpoints require Cognito JWT Authorizer.
    Identity claim `event.requestContext.authorizer.jwt.claims.sub` must be extracted by the handler; client-provided user IDs in the request body are strictly forbidden.
    Idempotency headers (`Idempotency-Key`) must be supported on all mutating endpoints (`/v1/scans`, `/v1/coupons/redeem`, `/v1/submissions`) using Powertools for AWS Lambda `makeIdempotent`.
    All responses must format errors as `{ error: { code: string, message: string } }` with appropriate 4xx/5xx HTTP status codes without leaking stack traces.

## CON-02: DynamoDB Single-Table Schema & Indexes
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- type: schema
- content: |
    Single Table name: `SaafSafariMain` (on-demand billing).
    Primary Key: PK (String), SK (String).
    Attributes: TTL (Number, unix timestamp for cooldowns, temporary tokens, idempotency).
    GSI1: GSI1PK = SK, GSI1SK = PK (inverted index for query-by-entity-type).
    GSI2: GSI2PK = `LEADERBOARD#<scope>`, GSI2SK = `<score padded>#<userId>` (sparse index for fast rank retrieval).
    Entities:
      - `USER#<sub}>`: Profile, balance, home territory, streak, language.
      - `LEDGER#<sub}>#<txId>`: Immutable transaction audit record.
      - `TASK#<sub}>#<periodKey>#<taskId>`: User's periodic task assignment with progress.
      - `TERRITORY#<h3Index>`: Land use, animal, health (0–100), mood, coordinates.
      - `QRSOURCE#<sourceId>`: Static or rotating source metadata, lat/lng, geofence ID.
      - `COUPON#<merchantId>#<couponId>`: Inventory, price GC, claimed status.
      - `SUBMISSION#<submissionId>`: Proof photos, status, pHash, labels, Step Functions execution ARN.
      - `COOLDOWN#<sub}>#<sourceId>`: Ephemeral rate limiting with DynamoDB TTL.

## CON-03: EventBridge Event Bus Contracts
- source: docs/01-AWS-REQUIREMENTS.md, docs/02-BACKEND-CONTEXT.md
- type: protocol
- content: |
    Custom EventBus: `saafsafari`.
    Source: `saafsafari.api`.
    Detail Types:
      - `ActionVerified`: Payload `{ userId, territoryId, taskId, creditsAwarded, verificationMethod, collectorId }`.
      - `HotspotValidated`: Payload `{ hotspotId, territoryId, lat, lng, severity }`.
      - `CouponRedeemed`: Payload `{ userId, merchantId, couponId, costGC }`.
      - `TerritoryMoodChanged`: Payload `{ territoryId, oldMood, newMood, currentHealth }`.

## CON-04: AWS Cost Envelope & Service Exclusions
- source: docs/00-PROJECT-CONTEXT.md, docs/01-AWS-REQUIREMENTS.md
- type: nfr
- content: |
    Deployment target: AWS Free Plan account with up to $200 credits in ap-south-1.
    Strictly forbidden services due to idle hourly costs:
      - NAT Gateway, EC2, RDS/Aurora, ElastiCache, MemoryDB, OpenSearch Service, Kinesis Data Streams, SageMaker endpoints, and customer-managed KMS keys per QR.
    Bedrock optimization: Use Amazon Nova Lite / Nova Micro with SHA-256 / perceptual hash image caching to prevent repeated inference on duplicate images.
    Pinpoint is deprecated; use Amazon SNS and Expo Push notifications.

## CON-05: Uber H3 Resolution-7 Specifications
- source: docs/00-PROJECT-CONTEXT.md, docs/05-GAME-DESIGN.md
- type: schema
- content: |
    All territories must be indexed using Uber H3 hexagonal spatial indexing at Resolution 7 (average hexagon area ~5.16 km², edge length ~1.22 km).
    Child and neighbor queries must use `h3-js` library.
    Distance checks between adjacent territories must use H3 ring distance (`gridDisk(origin, k)`).

## CON-06: Verification Trust Matrix and Rate Caps
- source: docs/00-PROJECT-CONTEXT.md, docs/05-GAME-DESIGN.md
- type: nfr
- content: |
    Trust weight multipliers:
      - Rotating QR with collector: 1.2 (TTL 30s, proximity <= 150m)
      - Static QR with geofence: 1.0 (proximity <= 75m)
      - AI-approved photo: 1.0 (pHash distance > 6, EXIF <= 30m, GPS <= 200m)
      - Admin-approved photo: 0.9
      - Document proof: 1.0
      - Self-declared: 0.5 (daily cap 15 GC, max 2 tasks/day)
    Combined multiplier cap: min(streakMult * explorerMult * needMult * eventMult, 2.0).
    Daily non-QR earning cap: max 300 GC/day from photos and self-declared tasks.
    Cooldown intervals: Truck QR 20h; Bin QR 4h; Kabadiwala QR 24h; E-waste QR 7 days.
