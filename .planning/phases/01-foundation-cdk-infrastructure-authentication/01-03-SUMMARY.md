# Plan 01-03 Summary: User Authentication & Onboarding Handlers

## Overview
Implemented and verified the core user onboarding and profile Lambda handlers in `services/api/` with Amazon Cognito JWT authentication, DynamoDB single-table persistence, and Uber H3 resolution 7 territory mapping. Successfully mounted the handlers to API Gateway HTTP API v2 in `infra/lib/api-stack.ts` with IAM least-privilege table grants.

## Key Deliverables
- **DynamoDB Document Client (`services/api/src/utils/dynamo.ts`):**
  - Configured `@aws-sdk/lib-dynamodb` document client with `removeUndefinedValues: true` and region fallback.
- **Onboarding Handler (`services/api/src/handlers/onboarding/completeOnboarding.ts`):**
  - Extracts authenticated user identifier (`sub`) and `email` from Cognito JWT claims (`CON-01`).
  - Validates request body with `OnboardingRequestSchema`.
  - Calculates Uber H3 resolution 7 home territory cell index using `h3-js` (`latLngToCell(lat, lng, 7)`).
  - Initializes user record `USER#<sub}>` with `SK: PROFILE`, `role: 'citizen'`, `balanceGC: 0`, `lifetimeXP: 0`, and timestamps.
  - Returns 201 Created with full `UserProfile` envelope.
- **Get Profile Handler (`services/api/src/handlers/me/getMe.ts`):**
  - Fetches user profile from DynamoDB by `PK: USER#<sub}>, SK: PROFILE`.
  - Strips DynamoDB partition/sort keys and returns 200 OK with `UserProfile`.
  - Returns 404 NOT_FOUND envelope if onboarding has not been completed.
- **Update Profile Preferences Handler (`services/api/src/handlers/me/updateMe.ts`):**
  - Validates language preference update via `UpdateUserPreferencesSchema`.
  - Executes DynamoDB `UpdateCommand` with timestamp updating and returns 200 OK.
- **CDK Integration (`infra/lib/api-stack.ts`):**
  - Packaged handlers as ARM64 Node.js 22 lambdas using `TsLambda` construct.
  - Bound to HTTP API v2 routes:
    - `POST /v1/onboarding` (secured with `HttpJwtAuthorizer`)
    - `GET /v1/me` (secured with `HttpJwtAuthorizer`)
    - `PATCH /v1/me` (secured with `HttpJwtAuthorizer`)
  - Granted read/write DynamoDB permissions to corresponding execution roles.
- **Verification:**
  - 7/7 Vitest unit tests in `services/api/test/onboarding.test.ts`.
  - Full workspace test suite: 18/18 passing tests across shared, infra, and api packages.
  - `cdk synth` synthesizes clean CloudFormation template with esbuild Lambda bundling.
