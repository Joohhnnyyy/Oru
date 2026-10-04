# Phase 1: Foundation, CDK Infrastructure & Authentication - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase establishes the monorepo workspace foundation, shared TypeScript contracts and Zod schemas, core AWS CDK infrastructure stacks (`AuthStack`, `DataStack`, `GeoStack`, `ApiStack`), DynamoDB single-table schema with GSIs and TTL, Amazon Location Service resources, Amazon Cognito User Pool with passwordless Email OTP, and initial Lambda handlers for user authentication and onboarding. All work is strictly backend and infrastructure.

</domain>

<decisions>
## Implementation Decisions

### CDK Stack Architecture
- **D-01:** Implement a modular 4-stack layout in `infra/lib/` (`AuthStack`, `DataStack`, `GeoStack`, `ApiStack`) with explicit props passing and SSM parameter references between stacks to ensure fast, isolated deployments while preventing accidental stateful data loss. — **Reversibility:** costly — changing stack boundaries requires resource migration or stack recreation.
- **D-02:** Use a shared construct `ts-lambda.ts` for all Lambda functions, enforcing Node.js 22 (arm64), TypeScript bundling via esbuild, Powertools logging/metrics/tracing environment variables, and 15-second timeouts. — **Reversibility:** reversible — centralized in construct helper.

### Cognito Authentication & Onboarding
- **D-03:** Use AWS Cognito User Pool with native passwordless Email OTP (`USER_AUTH` flow) in the Essentials tier, avoiding custom Lambda trigger complexity. Pre-create Cognito user groups: `citizen`, `collector`, `ward_admin`, and `merchant`. — **Reversibility:** costly — auth flow selection impacts client SDK integration.
- **D-04:** User onboarding endpoint (`POST /v1/onboarding`) accepts language preference (`en` / `hi`), coordinates, and uses `h3-js` (`latLngToCell`) to automatically assign the user's home territory at Uber H3 resolution 7. — **Reversibility:** reversible — API contract behavior.

### Development Loop & Testing
- **D-05:** Adopt a hybrid development strategy: fast local unit tests using in-memory mocks and Vitest for pure functions and isolated handlers, coupled with live cloud deployment and rapid verification via `cdk watch --hotswap` in region `ap-south-1`. — **Reversibility:** reversible — developer workflow pattern.

### Schema Packaging & Validation
- **D-06:** Define all request/response schemas, API contracts, domain entities, and error formats as strict Zod schemas in `packages/shared`, automatically inferring TypeScript types (`z.infer`). Validate incoming requests with Powertools parser middleware in Lambda handlers. — **Reversibility:** costly — schemas are shared across all backend handlers and future frontend apps.

### Project Execution Strategy
- **D-07:** Backend-First Development Sequence (DEC-11): 100% of backend infrastructure, database schemas, Lambda handlers, game rules, and seed pipelines must be completed, deployed to AWS, and verified with integration tests before initializing frontend development. — **Reversibility:** one-way — governs milestone ordering.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture & Requirements
- `docs/00-PROJECT-CONTEXT.md` §4, §6, §12 — User roles, P0 priority scope, monorepo layout
- `docs/01-AWS-REQUIREMENTS.md` §1 — CDK stacks, Cognito setup, DynamoDB config, Location Service
- `docs/02-BACKEND-CONTEXT.md` §1, §2 — Folder structure, Lambda defaults, single-table design
- `.planning/PROJECT.md` — Project context and locked decisions DEC-01 through DEC-11
- `.planning/REQUIREMENTS.md` — Active v1 requirements (AUTH-01, AUTH-02, AUTH-03)
- `.planning/ROADMAP.md` — Phase 1 scope and plan breakdown

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (greenfield initialization; project starts from clean state with specifications in `docs/`).

### Established Patterns
- Monorepo with `pnpm` workspaces (`apps/*`, `services/*`, `packages/*`, `infra`).
- TypeScript with strict type checking and Node 22 arm64 Lambda targets.
- AWS CDK v2 (TypeScript) with modular stack composition.

### Integration Points
- `packages/shared` consumed by `services/api` (and future `apps/web`, `apps/mobile`).
- `infra` provisions resources consumed via environment variables by `services/api` Lambda handlers.

</code_context>

<specifics>
## Specific Ideas

- Root configuration should provide a standard TypeScript base (`tsconfig.base.json`) and shared linting/formatting configs.
- The DynamoDB table name should be parameterized, defaulting to `SaafSafariMain-${Stage}`.
- Cognito User Pool Client should be configured with `ALLOW_USER_AUTH` for passwordless Email OTP.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion remained tightly focused on Phase 1 foundation, CDK infrastructure, and authentication scope.

</deferred>

---

*Phase: 1-Foundation, CDK Infrastructure & Authentication*
*Context gathered: 2026-10-04*
