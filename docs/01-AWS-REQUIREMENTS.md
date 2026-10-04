# SaafSafari — AWS Requirements

Goal: AWS is the backbone, not a hosting afterthought — every user action touches 3+ AWS services, and the architecture slide in the video names each one with its job. Everything below runs on a **new AWS account on the Free Plan** (up to $200 credits: $100 at signup + up to $100 from onboarding activities) plus the **always-free** allowances. Region: **ap-south-1 (Mumbai)**.

Legend: **AF** = covered by always-free monthly allowance at hackathon scale · **CR** = small spend from credits.

---

## 1. Services used

### Identity & access
| Service | Use | Cost |
|---|---|---|
| **Amazon Cognito** (User Pool, Essentials tier) | Email OTP passwordless sign-in, Google federation, groups `citizen/collector/ward_admin/merchant`, JWTs for API Gateway | AF (free MAU allowance far above demo usage) |
| **Cognito Identity Pool** (optional) | Short-lived AWS creds for mobile to call Amazon Location map tiles directly | AF |
| **Cedar** (AWS open source, `@cedar-policy/cedar-wasm` in Lambda) | Fine-grained authz: ward admin acts only in own ward, collector only on own QR source | Free (OSS) |
| **IAM** | Least-privilege role per Lambda (CDK grants) | Free |

### API & compute
| Service | Use | Cost |
|---|---|---|
| **Amazon API Gateway — HTTP API** | REST API with Cognito JWT authorizer, throttling, CORS | CR (~$1 per million requests) |
| **AWS Lambda** (Node.js 22, arm64; one Python 3.12 fn for territory/agent jobs) | All business logic | AF (1M requests + 400k GB-s/month) |
| **Powertools for AWS Lambda (TypeScript)** — AWS open source | Structured logging, tracing, metrics, **Idempotency utility** (DynamoDB-backed) for scan/redeem | Free (OSS) |
| **AWS Step Functions** (Standard) | Photo-verification workflow with branches (auto-approve / human review / reject) and wait-for-callback for admin review | AF (4,000 state transitions/month) then CR |

### Data & storage
| Service | Use | Cost |
|---|---|---|
| **Amazon DynamoDB** (on-demand, single table + 2 GSIs, TTL, Streams) | Users, ledger, tasks, territories, QR sources, coupons, submissions, idempotency | AF (25 GB storage) / CR tiny |
| **DynamoDB Streams** | Ledger insert → update territory health & leaderboards asynchronously | AF |
| **Amazon S3** | Photo proofs (presigned PUT), territory GeoJSON, mascot art, web build artifacts | AF/CR (pennies) |
| **Amazon CloudFront** | CDN for territory GeoJSON + mascot sprites + proof thumbnails (OAC-protected) | AF (1 TB/month) |

### Events & scheduling
| Service | Use | Cost |
|---|---|---|
| **Amazon EventBridge** (custom bus `saafsafari`) | Domain events: `ActionVerified`, `HotspotValidated`, `CouponRedeemed`, `TerritoryMoodChanged` | CR (~$1/million) |
| **EventBridge Scheduler** | Daily/weekly/monthly task refresh (IST cron), nightly health decay, streak resets, QR key rotation | AF (14M invocations/month) |
| **Amazon SQS** | Buffers for task-generation fan-out and notification sends; DLQs for every async Lambda | AF (1M requests) |
| **Amazon SNS** | Email notifications (bounty near you, coupon claimed), admin alerts | AF (email/HTTP allowance) |

### Maps & location — the "deep AWS" showpiece
| Service | Use | Cost |
|---|---|---|
| **Amazon Location Service — Maps** | Base map tiles (MapLibre) on web + mobile; overlay H3 territories | CR (per 1k tiles, cents) |
| **Amazon Location — Geofence collection** | One geofence per static QR source; `BatchEvaluateGeofences`/distance check verifies user is physically there | CR |
| **Amazon Location — Tracker** | Collector-mode phones push truck / kabadiwala positions; scan verification checks user ↔ collector distance; live truck dot on map; tracker→geofence → "truck entering your territory" event via EventBridge | CR |
| **Amazon Location — Places** | "Nearest e-waste point / refill station", reverse geocoding for territory names | CR |

### AI
| Service | Use | Cost |
|---|---|---|
| **Amazon Bedrock — Amazon Nova Lite** (multimodal) | Judge photo proofs ("is this a before/after cleanup of the same spot?", "two separate bins with wet/dry waste?"), return JSON verdict + confidence + reason; "Saaf Mitra" segregation assistant | CR — cheapest multimodal; cache by image hash; ~1,000 calls ≈ well under $1 |
| **Amazon Bedrock Guardrails** (optional) | Filter abusive text in hotspot reports | CR |
| **Amazon Rekognition** — DetectLabels, DetectModerationLabels | Fast first pass (is there trash/bin/bag in frame?) + block unsafe uploads before Bedrock | CR (~$1 per 1k images) |
| **Amazon Textract** — AnalyzeExpense | Electricity bill units, repair/e-waste receipts (P2) | CR |
| **Amazon Translate** | Admin-created task/bounty text → Hindi (P2) | CR (tiny) |
| **Strands Agents SDK** (AWS open source, optional P2) | Build Saaf Mitra as an agent with tools: `classifyItem`, `nearestDropPoint`, `myTasks` | Free (OSS) + Bedrock tokens |

### Hosting, delivery, ops
| Service | Use | Cost |
|---|---|---|
| **AWS Amplify Hosting** | Web app CI/CD from GitHub, preview branches, custom domain optional | CR (build minutes + hosting, pennies) |
| **AWS CDK (TypeScript)** — AWS open source | All infra as code, `cdk deploy` per stack | Free |
| **Amazon CloudWatch** | Logs, metrics, one dashboard (scans/min, verification latency, Bedrock spend), alarms | AF (basic) |
| **AWS X-Ray** | Traces across API → Lambda → DynamoDB → EventBridge (via Powertools Tracer) | AF (100k traces/month) |
| **AWS Secrets Manager** / **SSM Parameter Store** | QR HMAC signing keys (versioned, rotated), Google OAuth secret | SSM standard params AF; Secrets Manager ~$0.40/secret/month CR |
| **AWS Budgets** | $5 and $20 alerts (also one of the onboarding activities that earns credits) | Free |

## 2. Do NOT use (burns credits or adds risk for no demo value)
- **ElastiCache / MemoryDB** — hourly node cost. Leaderboards = DynamoDB GSI.
- **Kinesis Data Streams** — shard-hours. DynamoDB Streams does the job.
- **AppSync** — not needed; HTTP API + polling (or API Gateway WebSocket if time permits).
- **KMS customer-managed key per QR** — $1/key/month; one HMAC key in SSM/Secrets Manager with versioning is enough.
- **NAT Gateway, EC2, RDS/Aurora, OpenSearch Service, SageMaker endpoints** — hourly costs, zero demo upside.
- **Amazon Pinpoint** — being retired; use SNS + Expo push.
- **SNS SMS to India** — needs DLT registration; use email OTP.

## 3. Architecture (request flows)

### A. QR scan (P0)
```
Mobile (expo-camera) ── POST /v1/scans {token, lat, lng, clientTs, idemKey}
  → API Gateway (JWT authorizer: Cognito)
  → Lambda scanHandler
       1. verify HMAC token (key from SSM, version in token) + expiry
       2. load QRSOURCE item; static → geofence/distance check (Amazon Location)
                               rotating → tracker GetDevicePosition, distance ≤ 150 m
       3. cooldown + Powertools idempotency (DynamoDB)
       4. game-rules.calculateCredits()
       5. DynamoDB TransactWriteItems: ledger item + profile balance + task progress + cooldown item
       6. PutEvents ActionVerified → EventBridge
  ← 200 {credits, breakdown, taskProgress, newBalance}
EventBridge ActionVerified →
  • territoryUpdater Lambda (health, mood change → TerritoryMoodChanged event)
  • leaderboardUpdater Lambda
  • collectorReward Lambda (2 GC to collector)
```

### B. Photo proof (P1)
```
POST /v1/submissions → Lambda returns S3 presigned PUT (key: proofs/{userId}/{submissionId}.jpg)
Mobile uploads → S3 ObjectCreated → EventBridge → Step Functions "VerifyProof":
  ├─ Rekognition DetectModerationLabels → unsafe? → Reject
  ├─ Lambda: EXIF time/GPS check + perceptual hash dedupe (DynamoDB HASH# items)
  ├─ Rekognition DetectLabels (trash, bin, bag, plastic, bottle...)
  ├─ Bedrock Nova Lite (image + task rubric prompt) → {verdict, confidence, reason}
  ├─ Choice: confidence ≥ 0.8 & labels agree → Approve
  │          0.5–0.8 or disagreement → Admin review (waitForTaskToken; console approves)
  │          < 0.5 → Reject with reason
  └─ Approve → same credit transaction as scan path → ActionVerified event
```

### C. Scheduled jobs
```
EventBridge Scheduler (Asia/Kolkata):
  00:00 daily     → taskRefresh (fan-out via SQS, batches of 25 users)
  00:05 daily     → healthDecay (all territories), streakCheck
  Mon 00:00       → weekly tasks + weekly leaderboard snapshot to S3
  1st 00:00       → monthly tasks
  every 6 h       → rotate QR HMAC key version (old version valid 24 h)
```

### D. Live truck
```
Collector mode → every 15 s: Amazon Location BatchUpdateDevicePosition (via Lambda or Identity Pool creds)
Tracker linked to geofence collection "territories-hotspots" → ENTER events → EventBridge → notifyNearbyCitizens (SNS/Expo push)
Web/mobile map polls GET /v1/trucks/live (Lambda → ListDevicePositions) every 10 s
```

## 4. CDK stacks

| Stack | Resources |
|---|---|
| `AuthStack` | User pool, app clients (web, mobile), Google IdP, groups, identity pool |
| `DataStack` | DynamoDB table + GSIs + stream + TTL, S3 buckets (proofs, public-assets), CloudFront distribution |
| `GeoStack` | Location map, place index, geofence collection, tracker + tracker-consumer link |
| `ApiStack` | HTTP API, JWT authorizer, all Lambdas, routes, Powertools layer |
| `WorkflowStack` | EventBridge bus + rules, Step Functions state machine, SQS queues + DLQs, Scheduler schedules |
| `AiStack` | IAM for Bedrock/Rekognition/Textract/Translate, Bedrock model access note, prompt params in SSM |
| `ObservabilityStack` | CloudWatch dashboard, alarms, Budgets |
| Web app | Amplify Hosting app connected to GitHub (`amplify.yml`), env vars from CDK outputs |

## 5. Cost envelope for the hackathon
| Item | Estimate |
|---|---|
| Lambda, DynamoDB, SQS, SNS, Scheduler, CloudFront, Cognito | $0 (always-free) |
| API Gateway, EventBridge, Step Functions overage | < $1 |
| Bedrock Nova Lite (≈ 1–2k image calls incl. testing) | ~$1–3 |
| Rekognition + Textract | < $3 |
| Amazon Location (tiles, tracker, geofence, places) | ~$2–5 |
| Amplify Hosting, Secrets Manager | < $2 |
| **Total** | **< $15 of the $100–200 credits** |

Set Budgets alerts at $5 and $20 on day 1. Tag every resource `project=saafsafari` for Cost Explorer.

## 6. Setup checklist (day 1, first hour)
1. Create AWS account (Free Plan), ap-south-1. Verify student on AWS Builder Center (required for the tour).
2. Do the credit-earning onboarding activities (Budget, Bedrock playground prompt, Lambda deploy, etc.).
3. Bedrock console → Model access → enable **Amazon Nova Lite** and **Nova Micro** (check ap-south-1; else use the cross-region inference profile).
4. Create IAM user/SSO profile for CDK; `cdk bootstrap aws://<acct>/ap-south-1`.
5. Google OAuth client (for Cognito federation).
6. Deploy `AuthStack`, `DataStack` first; seed territories.

## 7. What to say about AWS in the video and blog
"Citizens' actions are verified by Amazon Location (geofences + live collector trackers) and Amazon Bedrock + Rekognition in a Step Functions workflow; credits are written atomically to DynamoDB; EventBridge fans out to territory health and leaderboards; EventBridge Scheduler runs the daily/weekly/monthly game loop; everything is CDK, serverless, and runs inside the free credits."
