# Phase 1: Foundation, CDK Infrastructure & Authentication - Research

**Researched:** 2026-10-04
**Domain:** Monorepo scaffolding, AWS CDK v2 (TypeScript), DynamoDB Single-Table, Amazon Cognito Passwordless Email OTP, Amazon Location Service, Powertools for AWS Lambda
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational cloud infrastructure and code architecture for SaafSafari. The objective is to build a robust, modular AWS backend monorepo with `pnpm` workspaces, zero-overhead AWS CDK v2 infrastructure stacks, strict domain models in `packages/shared`, and working authentication and onboarding endpoints.

The primary architectural challenge in Phase 1 is ensuring that the 4 modular CDK stacks (`AuthStack`, `DataStack`, `GeoStack`, `ApiStack`) interface cleanly without circular CloudFormation exports, while setting up native Cognito passwordless Email OTP authentication (`USER_AUTH` flow) and single-table DynamoDB data models.

**Primary recommendation:** Centralize all Lambda defaults in `infra/lib/constructs/ts-lambda.ts` using CDK `NodejsFunction` with `arm64` and Node.js 22 runtime; define strict Zod schemas in `packages/shared` as the single source of truth for both TypeScript interfaces and Powertools request validation; and pass resource references between CDK stacks using explicit TypeScript props rather than raw CloudFormation exports.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Workspace Management | `pnpm` workspaces | Node.js 22 | Isolated dependency resolution across `packages/*`, `services/*`, `infra` |
| Cloud Infrastructure (IaC) | AWS CDK v2 (TypeScript) | CloudFormation | Type-safe infrastructure, automated IAM least-privilege grants |
| User Identity & Auth | Amazon Cognito User Pool | Cognito Identity Pool | Native passwordless Email OTP, group RBAC, JWT issuance |
| Spatial Indexing Resources | Amazon Location Service | `h3-js` | Map vector tiles, geofence collections, and tracker instances |
| Persistent Data Storage | Amazon DynamoDB | Amazon S3 | Single-table NoSQL for transactional state; S3 for asset & proof storage |
| API Gateway & Routing | Amazon API Gateway HTTP API | Cognito JWT Authorizer | Low-latency HTTP routing with built-in token validation |
| Compute & Business Logic | AWS Lambda (Node.js 22 arm64) | Powertools for AWS | Serverless execution with structured logging, metrics, and tracing |
| Contract Validation | `zod` (`packages/shared`) | `@aws-lambda-powertools/parser` | Single source of truth for runtime validation and static TS types |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `aws-cdk-lib` | ^2.170.0 | AWS Cloud Development Kit | Standard AWS IaC library [VERIFIED: npm registry] |
| `constructs` | ^10.4.2 | CDK construct base classes | Required peer dependency for CDK v2 [VERIFIED: npm registry] |
| `zod` | ^3.23.8 | Schema validation & type inference | Industry standard, zero dependencies, type-safe runtime parsing [VERIFIED: npm registry] |
| `h3-js` | ^4.1.0 | Uber H3 spatial indexing | Canonical JS/TS bindings for H3 hexagonal geometry [VERIFIED: npm registry] |
| `@aws-lambda-powertools/logger` | ^2.10.0 | Structured JSON logging | AWS best practice for structured cloudwatch logs [VERIFIED: npm registry] |
| `@aws-lambda-powertools/parser` | ^2.10.0 | Event parsing & Zod validation | Validates API Gateway events against Zod schemas [VERIFIED: npm registry] |
| `@aws-sdk/client-dynamodb` | ^3.660.0 | AWS SDK v3 DynamoDB client | Native modular AWS SDK [VERIFIED: npm registry] |
| `@aws-sdk/lib-dynamodb` | ^3.660.0 | DynamoDB DocumentClient | Unmarshalls DynamoDB attribute maps into JS objects [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@aws-sdk/client-cognito-identity-provider` | ^3.660.0 | Cognito admin operations | When backend Lambdas query or assign Cognito user groups |
| `esbuild` | ^0.24.0 | TypeScript bundler | Used by CDK `NodejsFunction` for fast bundle and tree-shaking |
| `vitest` | ^2.1.0 | Unit testing framework | Fast in-memory unit tests with native TS and ESM support |
| `typescript` | ^5.6.0 | Language compiler & typechecker | Strict type safety across all workspace packages |

---

## Package Legitimacy Audit

| Package | Registry | Weekly Downloads | Source Repo | Verdict | Disposition |
|---------|----------|------------------|-------------|---------|-------------|
| `aws-cdk-lib` | npm | 5.7M/wk | github.com/aws/aws-cdk | OK | Approved |
| `constructs` | npm | 6.7M/wk | github.com/aws/constructs | OK | Approved |
| `zod` | npm | 385M/wk | github.com/colinhacks/zod | OK | Approved |
| `h3-js` | npm | 1.5M/wk | github.com/uber/h3-js | OK | Approved |
| `@aws-lambda-powertools/logger` | npm | 1.2M/wk | github.com/aws-powertools/powertools-lambda-typescript | OK | Approved |
| `@aws-sdk/client-dynamodb` | npm | 14.6M/wk | github.com/aws/aws-sdk-js-v3 | OK | Approved |

**Packages removed due to [SLOP] verdict:** None  
**Packages flagged as suspicious [SUS]:** None

---

## Architecture Patterns

### System Architecture Diagram

```
[ Citizen / Collector Client ]
              │
    (1) Email OTP Sign-In
              ▼
    [ Amazon Cognito User Pool ]
              │
    (2) Returns Cognito JWT
              ▼
[ API Gateway HTTP API v2 (Cognito Authorizer) ]
              │
    (3) Passes Validated Claims (sub, groups)
              ▼
    [ AWS Lambda: ts-lambda construct ]
      ├── Powertools (Logger, Tracer, Parser)
      └── packages/shared Zod Validation
              │
    (4) Conditional TransactWriteItems
              ▼
    [ Amazon DynamoDB: SaafSafariMain ]
      ├── PK: USER#<sub}> | SK: PROFILE
      ├── GSI1 (Type Index)
      └── TTL (Cooldowns & Expiry)
```

### Recommended Project Structure
```
saafsafari/
├── infra/
│   ├── bin/app.ts
│   ├── lib/
│   │   ├── auth-stack.ts          # Cognito User Pool, Client, Groups
│   │   ├── data-stack.ts          # DynamoDB SaafSafariMain, S3 Proofs Bucket
│   │   ├── geo-stack.ts           # Amazon Location Map, Geofence, Tracker
│   │   ├── api-stack.ts           # API Gateway HTTP API, Authorizer, Routes
│   │   └── constructs/
│   │       ├── ts-lambda.ts       # Shared NodejsFunction construct (arm64, node22)
│   │       └── api-route.ts       # Route + Lambda integration helper
│   ├── cdk.json
│   ├── tsconfig.json
│   └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schemas/           # Zod schemas: user, onboarding, error envelopes
│       │   ├── types/             # Inferred TypeScript types
│       │   └── constants/         # App-wide constants (cooldowns, tiers)
│       ├── tsconfig.json
│       └── package.json
├── services/
│   └── api/
│       ├── src/
│       │   ├── handlers/
│       │   │   ├── me/getMe.ts
│       │   │   ├── me/updateMe.ts
│       │   │   └── onboarding/completeOnboarding.ts
│       │   └── utils/
│       │       └── dynamo.ts      # Shared DynamoDB DocumentClient instance
│       ├── tsconfig.json
│       └── package.json
├── pnpm-workspace.yaml
├── package.json                   # Root package.json with scripts
└── tsconfig.base.json             # Base TS configuration
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript Lambda bundling | Custom webpack/rollup/tsc scripts | `aws-cdk-lib/aws-lambda-nodejs` (`NodejsFunction`) | Uses `esbuild` under the hood; automatically bundles dependencies, transpiles TS, and minimizes bundle size |
| Request JSON parsing & validation | Manual `JSON.parse` and `if (!body.field)` checks | `zod` + `@aws-lambda-powertools/parser` | Handles coercion, deep validation, structural typing, and returns standardized validation errors |
| Hexagonal spatial calculations | Custom trigonometry or lat/lng distance math | `h3-js` | Standardized Uber H3 spatial grid indexing with constant lookup time |
| Passwordless authentication | Custom OTP token generator in DynamoDB + SES | Cognito `USER_AUTH` flow (Email OTP) | Native AWS authentication handling rate limits, code generation, and JWT token issuance |

---

## Common Pitfalls

### Pitfall 1: CloudFormation Circular Dependency between Stacks
**What goes wrong:** `ApiStack` references a Lambda defined in `AuthStack`, while `AuthStack` references an API URL from `ApiStack`, causing `EXPORT_CIRCULAR_DEPENDENCY` on `cdk deploy`.  
**Why it happens:** Passing CDK constructs bidirectionally across stacks.  
**How to avoid:** Enforce a strict one-way dependency graph: `DataStack` & `AuthStack` & `GeoStack` → `ApiStack`. `ApiStack` imports properties (e.g. `userPoolId`, `table`) passed as explicit TypeScript props into its constructor.

### Pitfall 2: Trusting Client `userId` in API Request Body
**What goes wrong:** Malicious client modifies another user's profile by supplying a different `userId` in the body.  
**Why it happens:** Handlers reading `event.body.userId`.  
**How to avoid:** Extract `userId` exclusively from the verified Cognito JWT authorizer claims: `event.requestContext.authorizer.jwt.claims.sub`. Reject or ignore any user ID passed in request payloads.

### Pitfall 3: Monorepo Symlink & Bundling Failures in CDK
**What goes wrong:** `NodejsFunction` fails to bundle `@saafsafari/shared` because esbuild cannot resolve pnpm monorepo symlinks.  
**Why it happens:** esbuild runs in the stack directory without resolving root workspace node_modules.  
**How to avoid:** In `ts-lambda.ts`, configure `bundling: { externalModules: ['@aws-sdk/*'] }` and ensure `tsconfig.base.json` defines path mappings (`paths: { "@saafsafari/shared": ["../../packages/shared/src"] }`).

---

## Code Examples

### 1. Reusable NodejsFunction Construct (`infra/lib/constructs/ts-lambda.ts`)
```typescript
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';

export interface TsLambdaProps extends Partial<NodejsFunctionProps> {
  entry: string;
  handler?: string;
  environment?: Record<string, string>;
}

export class TsLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: TsLambdaProps) {
    super(scope, id, {
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(15),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node22',
        externalModules: ['@aws-sdk/*'],
      },
      environment: {
        POWERTOOLS_SERVICE_NAME: 'saafsafari-api',
        POWERTOOLS_LOG_LEVEL: 'INFO',
        ...props.environment,
      },
      ...props,
    });
  }
}
```

### 2. Standard Zod User & Onboarding Schema (`packages/shared/src/schemas/user.ts`)
```typescript
import { z } from 'zod';

export const UserLanguageSchema = z.enum(['en', 'hi']);

export const OnboardingRequestSchema = z.object({
  language: UserLanguageSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  language: UserLanguageSchema,
  homeTerritoryId: z.string(),
  balanceGC: z.number().nonnegative(),
  lifetimeXP: z.number().nonnegative(),
  streakDays: z.number().nonnegative(),
  role: z.enum(['citizen', 'collector', 'ward_admin', 'merchant']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^2.1.0 |
| Assertion Library | Built-in Vitest / Chai expectations |
| Runner | `pnpm --filter @saafsafari/shared test`, `pnpm --filter @saafsafari/infra test` |
| Coverage Goal | 100% on shared schemas & validators, synth check on CDK stacks |

### Verification Protocol
1. **Workspace Compilation**: `pnpm build` compiles TypeScript across all packages without type errors.
2. **Unit Tests**: `pnpm test` verifies schema parsing, error envelopes, and utility functions.
3. **CDK Synthesis**: `pnpm --filter infra cdk synth` synthesizes CloudFormation templates for `AuthStack`, `DataStack`, `GeoStack`, and `ApiStack` with zero warnings or errors.
