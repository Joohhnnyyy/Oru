# Phase 5 Context: Backend Deployment & Integration Verification

## Purpose
Achieve 100% operational deployment of the complete SaafSafari backend serverless infrastructure to AWS `ap-south-1` (Mumbai) and execute an automated, end-to-end integration test suite validating every API endpoint, data transaction, AI vision evaluation, and admin workflow against live AWS resources:
1. Deploy all 6 AWS CDK infrastructure stacks to `ap-south-1`:
   - `SaafSafari-DataStack`: Single-table DynamoDB (`SaafSafariMain`) with GSI1, GSI2, and TTL; encrypted S3 bucket (`saafsafari-proofs-*`).
   - `SaafSafari-AuthStack`: Cognito User Pool, Client, and 4 role groups (`citizen`, `collector`, `ward_admin`, `merchant`).
   - `SaafSafari-GeoStack`: Amazon Location Service Map (`saafsafari-map`), Geofence Collection (`saafsafari-geofences`), and Vehicle Tracker (`saafsafari-truck-tracker`).
   - `SaafSafari-ApiStack`: HTTP API Gateway v2 with Cognito JWT Authorizer routing 19 serverless TypeScript Lambda functions.
   - `SaafSafari-WorkflowStack`: Step Functions Multimodal AI verification state machine combining Rekognition moderation/labels and Bedrock Nova Lite reasoning.
   - `SaafSafari-SchedulerStack`: EventBridge rule executing nightly 3% territory health decay across Delhi NCR.
2. Automate CloudFormation outputs extraction (`scripts/export-env.ts`) to produce standardized `.env` files for backend integration tests, web portal, and mobile app.
3. Execute the 158-item seed data pipeline (`scripts/seed.ts`) against the deployed `SaafSafariMain` DynamoDB table in `ap-south-1`.
4. Run an automated end-to-end integration test suite (`services/api/test/integration/live-e2e.test.ts`) executing live HTTP and AWS SDK calls against the deployed environment:
   - Passwordless / OTP Cognito user authentication (`AUTH-01`).
   - Static smart bin QR verification with geofencing validation (`QR-01`).
   - Rotating collector truck QR verification with HMAC token validation (`QR-02`).
   - Atomic DynamoDB ledger transaction and balance recording (`CRED-02`).
   - Merchant coupon browsing and conditional balance redemption (`WALT-02`).
   - S3 presigned photo upload and multimodal AI verification execution (`AI-02`).
   - Cedar-authorized municipal admin review queue resolution and callback completion (`ADM-03`).
5. Formal Milestone 1 Backend Sign-off: Complete verification that backend is 100% operational with zero mock dependencies before initializing Milestone 2 frontend client applications.

## Requirements Covered
- **AUTH-01**: User can authenticate passwordlessly via Cognito Email OTP or Google OAuth federation.
- **QR-01**: User can scan static signed QR codes on public dustbins and e-waste points with Amazon Location geofencing validation (within 75 m).
- **QR-02**: User can scan dynamic rotating QR codes from collector mobile devices with 30-second HMAC token validity.
- **CRED-02**: Mutating actions use DynamoDB TransactWriteItems to atomically record immutable ledger entries, update user balance, and advance task progress.
- **WALT-02**: User can browse merchant coupons and redeem rewards via atomic conditional writes with weekly per-merchant limits.
- **AI-02**: Step Functions workflow verifies image moderation with Rekognition and evaluates proof validity using Amazon Bedrock Nova Lite.
- **ADM-03**: Ward admins can review flagged photo submissions, approve/reject with feedback, and complete Step Functions callbacks.

## Locked Architecture & Decisions Honored
- **DEC-11 (Backend-First Development Sequence):** Milestone 1 (Phases 1–5: CDK infrastructure, pure game rules, core APIs, AI workflows, seed pipeline, and integration verification) must be 100% operational on live AWS before Milestone 2 frontend client apps are initialized.
- **DEC-01 (Strict Delhi NCR Bounding Box):** Territories, QR sources, and proof submissions validated strictly within 28.2–29.0° N, 76.7–77.6° E.
- **DEC-03 (Single-Table DynamoDB Architecture):** All live mutations utilize `SaafSafariMain` with single-table partition/sort key conventions and atomic transactions.
- **DEC-07 (Multimodal AI Pipeline):** Amazon Rekognition content moderation + Bedrock Nova Lite reasoning orchestrated via Step Functions in `ap-south-1`.
- **DEC-09 (Cedar Municipal Tenancy):** Admin endpoints strictly guarded by Cedar authorization rules evaluating roles and ward scopes.
- **CON-01 (Security & Identity):** Zero hardcoded credentials or tokens; ephemeral test credentials created and destroyed during integration tests.
