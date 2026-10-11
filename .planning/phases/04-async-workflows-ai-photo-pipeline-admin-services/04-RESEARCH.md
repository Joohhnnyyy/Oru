# Phase 4 Research: Async Workflows, AI Photo Pipeline & Admin Services

## Overview
Phase 4 implements the asynchronous processing backbone of SaafSafari: S3 presigned photo proof ingestion, Step Functions multimodal AI verification (Amazon Rekognition + Amazon Bedrock Nova Lite), citizen hotspot reporting with automated bounty generation, nightly EventBridge health decay, and municipal admin endpoints with Cedar policy authorization.

---

## 1. S3 Presigned Upload Architecture (`AI-01`)

### Upload Workflow
1. Client calls `POST /v1/submissions` with action type (`COMMUNITY_CLEANUP_PROOF` or `HABIT_SEGREGATION`), GPS coordinates, and optional description.
2. Lambda verifies user JWT claims, generates unique `submissionId` (`sub_<uuid>`) and S3 key `submissions/${userId}/${submissionId}.jpg`.
3. Lambda uses `@aws-sdk/s3-request-presigner` with `PutObjectCommand` on `ProofsBucket` (valid for 15 minutes).
4. Creates DynamoDB record `PK: SUBMISSION#<submissionId>, SK: METADATA` with status `PENDING_UPLOAD`.
5. Returns `{ submissionId, uploadUrl, s3Key, expiresAt }`.
6. Client performs HTTP `PUT` directly to S3 with the JPEG image bytes.

---

## 2. Step Functions Multimodal AI Pipeline (`AI-02`, `AI-03`)

### Orchestration Architecture
```
                         [S3 Proof Upload]
                                 │
                                 ▼
                     [Step Functions Trigger]
                                 │
                                 ▼
                    [Amazon Rekognition Task]
                   • DetectModerationLabels
                   • DetectLabels
                                 │
                     (Passes Moderation?)
                     ├── No ──► [Auto-Reject: Inappropriate]
                     └── Yes
                          │
                          ▼
            [Amazon Bedrock Nova Lite Task]
        Model: amazon.nova-lite-v1:0 (Multimodal Vision)
     Evaluates: segregation / litter / cleaning validity
                          │
                     (Confidence Score)
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Score >= 0.75     0.35 <= Score < 0.75   Score < 0.35
 [Auto-Approve]     [Suspend: Task Token]  [Auto-Reject]
  • Credit 100 GC    • Record in Admin      • Mark REJECTED
  • Bump Health        Review Queue
  • Mark APPROVED    • Wait for Admin Action
```

### Bedrock Nova Lite Prompt Contract
```json
{
  "inferenceConfig": {
    "maxTokens": 300,
    "temperature": 0.1
  },
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "image": {
            "format": "jpeg",
            "source": { "bytes": "<base64_encoded_image>" }
          }
        },
        {
          "text": "Analyze this civic waste action photo from Delhi NCR. Determine whether it depicts genuine waste segregation, litter picking, or park/street cleanup. Output strictly valid JSON: {\"isGenuine\": boolean, \"confidenceScore\": number (0.0 to 1.0), \"detectedItems\": string[], \"reasoning\": string}."
        }
      ]
    }
  ]
}
```

### Step Functions Task-Token Suspension (`AI-03`)
- For borderline submissions ($0.35 \le \text{score} < 0.75$), Step Functions executes an activity or Lambda callback with `.waitForTaskToken`:
  ```json
  "Parameters": {
    "submissionId.$": "$.submissionId",
    "taskToken.$": "$$.Task.Token"
  }
  ```
- The task token is saved to DynamoDB item `PK: SUBMISSION#<submissionId>, SK: METADATA` with status `FLAGGED_FOR_REVIEW`.
- When a ward admin approves or rejects the submission in the Municipal Console (`POST /v1/admin/review-queue/resolve`), the handler executes `SendTaskSuccessCommand({ taskToken, output })` to resume and conclude the execution.

---

## 3. Hotspot Reporting & Automated Bounties (`HOT-01`, `HOT-02`)

### Data Model & Lifecycle
1. Citizen calls `POST /v1/hotspots`:
   - `PK: HOTSPOT#<hotspotId>, SK: METADATA`
   - `GSI1PK: TERRITORY#<h3TerritoryId>, GSI1SK: HOTSPOT#<hotspotId>`
   - Attributes: `title, description, latitude, longitude, photoKey, reportedBy, status: 'OPEN', healthDeduction: 5`.
2. Validation & Health Penalty:
   - Deducts 5 health points from the territory (`health = max(0, health - 5)`).
   - Recalculates mood state via `getMoodState`.
3. Automated Bounty Task Generation (`HOT-02`):
   - Spawns a high-reward Bounty task for nearby citizens:
     - `PK: BOUNTY#<bountyId>, SK: METADATA`
     - `GSI1PK: TERRITORY#<h3TerritoryId>, GSI1SK: BOUNTY#<bountyId>`
     - Reward: 120 Green Credits, 250 XP.
     - Title: `Bounty: Clear Garbage Dump at <Location>`

---

## 4. Municipal Admin Services & Cedar Policy Authorization (`DEC-09`)

### Cedar Authorization Model
```cedar
// Ward Admin Role Policy
permit (
  principal in SaafSafari::Role::"ward_admin",
  action in [
    SaafSafari::Action::"viewTerritoryOverview",
    SaafSafari::Action::"manageQrSources",
    SaafSafari::Action::"resolveReviewQueue"
  ],
  resource
);
```

### Admin Endpoints
- `GET /v1/admin/territory-overview` (`ADM-01`): Aggregate health, mood, active hotspots, and total civic actions across the ward's territories.
- `POST /v1/admin/qr-sources` (`ADM-02`): Register smart bins, e-waste hubs, and collection trucks with geographic coordinates and generated HMAC secret keys.
- `GET /v1/admin/qr-sources` (`ADM-02`): Export list of QR sources for printing and field maintenance.
- `GET /v1/admin/review-queue` (`ADM-03`): Retrieve submissions flagged for human review.
- `POST /v1/admin/review-queue/resolve` (`ADM-03`): Approve or reject flagged proof, award credits, and signal Step Functions callback.

---

## 5. EventBridge Nightly Health Decay (`MAP-03`)

- **Schedule Expression:** `cron(0 0 * * ? *)` (every midnight).
- **Lambda Target:** `nightlyHealthDecay.ts`.
- **Logic:**
  1. Scans all 68 territories (`SK = METADATA`).
  2. Applies `applyNightlyDecay(territory.health, 0.03)` from `@saafsafari/game-rules`.
  3. Updates `mood = getMoodState(newHealth)`.
  4. Batch writes updated territory items to `SaafSafariMain`.
