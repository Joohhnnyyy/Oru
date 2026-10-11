# Phase 1: Foundation, CDK Infrastructure & Authentication - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 1-Foundation, CDK Infrastructure & Authentication
**Areas discussed:** CDK Stack Architecture, Cognito Email OTP Implementation, Local vs Cloud Development Loop, Zod Schema & Monorepo Packaging

---

## CDK Stack Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Modular 4-Stack Layout (AuthStack, DataStack, GeoStack, ApiStack) | Clean separation of stateful resources from stateless API handlers | ✓ |
| Single unified SaafSafariStack | Everything in one stack for single-command deploy | |

**User's choice:** Modular 4-Stack Layout (AuthStack, DataStack, GeoStack, ApiStack).
**Notes:** Enables isolated deployments and prevents accidental disruption to persistent data resources.

---

## Cognito Email OTP Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Native Cognito Email OTP (USER_AUTH flow) | Turnkey passwordless authentication handled natively by Cognito without custom challenge Lambdas | ✓ |
| Custom Auth Challenge Triggers (Define/Create/Verify + SES) | Complete programmatic control over OTP generation, rate limits, and email body | |

**User's choice:** Native Cognito Email OTP (USER_AUTH flow).
**Notes:** Keeps architecture serverless and standard without requiring custom Lambda trigger boilerplate or SES verified identities for the demo.

---

## Local vs Cloud Development Loop

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: Fast in-memory unit tests + Live AWS deployment with CDK Watch | Local Vitest for pure math/handlers, live AWS ap-south-1 with CDK watch for real integrations | ✓ |
| Pure Cloud: Direct deploy & CDK Watch only | Test exclusively against real AWS resources in ap-south-1 | |
| Local Emulation | Run DynamoDB Local and local API mock server alongside cloud deploys | |

**User's choice:** Hybrid: Fast in-memory unit tests + Live AWS deployment with CDK Watch.
**Notes:** Balances fast TDD feedback cycles for pure business logic with 100% production parity on AWS.

---

## Zod Schema & Monorepo Packaging

| Option | Description | Selected |
|--------|-------------|----------|
| Strict Zod Schemas + Powertools Parser | Zod as single source of truth in packages/shared, auto-inferring TS types with Powertools input validation | ✓ |
| Pure Zod Schemas in shared package | Standard schema.safeParse() in handlers without Powertools parser middleware dependency | |

**User's choice:** Strict Zod Schemas + Powertools Parser.
**Notes:** Eliminates duplicate type definitions and standardizes request/response validation across all endpoints.

---

## Agent Discretion

- Monorepo folder layout follows standard pnpm workspaces with `@saafsafari/` namespace.
- AWS CDK construct defaults (`NodejsFunction`, arm64, Node 22, esbuild bundling) centralized in `infra/lib/constructs/ts-lambda.ts`.

## Deferred Ideas

- None — discussion stayed strictly focused on Phase 1 foundational scope.
