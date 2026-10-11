# Plan 01-02 Summary: AWS CDK Infrastructure Stacks

## Overview
Successfully implemented the modular AWS CDK v2 infrastructure stacks and the reusable `TsLambda` construct targeting AWS `ap-south-1` (Mumbai). All stacks synthesize into valid CloudFormation templates with zero warnings and pass comprehensive template assertion unit tests.

## Key Deliverables
- **Reusable Lambda Construct (`infra/lib/constructs/ts-lambda.ts`):**
  - Extends `NodejsFunction` with Node.js 22 runtime, ARM_64 architecture, 15s timeout, 256MB memory.
  - Preconfigures AWS Lambda Powertools environment variables (`POWERTOOLS_SERVICE_NAME`, `POWERTOOLS_LOG_LEVEL`).
  - Bundles using `esbuild` with ESM format, inline banner for require, and source mapping.
- **Data Stack (`infra/lib/data-stack.ts`):**
  - DynamoDB single table `SaafSafariMain` (PK: String, SK: String, PAY_PER_REQUEST, TTL enabled on `ttl`).
  - Global Secondary Index `GSI1` (SK -> PK) and `GSI2` (GSI2PK -> GSI2SK) with `ALL` projections.
  - S3 bucket for waste segregation proofs and image evidence with SSL enforcement, S3-managed encryption, CORS, and 90-day lifecycle expiration.
- **Auth Stack (`infra/lib/auth-stack.ts`):**
  - Amazon Cognito User Pool `saafsafari-user-pool` configured for passwordless / email OTP sign-in.
  - App client `saafsafari-client` with SRP, password, and custom auth flows.
  - Pre-created user groups: `citizen`, `collector`, `ward_admin`, and `merchant`.
- **Geo Stack (`infra/lib/geo-stack.ts`):**
  - Amazon Location Service Vector map `saafsafari-map` (`VectorOpenDataStandardLight`).
  - Geofence collection `saafsafari-geofences` for municipal ward and collection boundaries.
  - Vehicle Tracker `saafsafari-truck-tracker` with time-based position filtering.
- **API Stack (`infra/lib/api-stack.ts`):**
  - API Gateway HTTP API v2 `saafsafari-http-api` with CORS headers for web/mobile clients.
  - `HttpJwtAuthorizer` integrated with Cognito User Pool and client audience.
  - Helper methods `addSecuredRoute` and `addPublicRoute` for declarative route mounting.
- **App Entry & Verification (`infra/bin/app.ts` & `infra/test/stacks.test.ts`):**
  - Explicit dependency graph between stacks avoiding circular CloudFormation exports.
  - 4/4 Vitest tests passing with `@aws-cdk/assertions`.
  - `cdk synth` succeeds cleanly.
