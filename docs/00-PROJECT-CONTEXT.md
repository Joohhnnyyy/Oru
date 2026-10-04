# SaafSafari — Master Project Context

> Working name: **SaafSafari** ("saaf" = clean, "safari" = the animal-territory map). Rename freely; avoid "Carb0n Club" — that is Kawasaki City's (Japan) brand.
> Event: **Environmental Hacks — WeMakeDevs × AWS, Bharat Builds Tour event 02**, Oct 8–11 2026 (online, optional DTU build day Oct 10).
> Track: **03 — Waste and Energy** ("What we throw away, and how we power what we keep").
> Team size: 1–4. Deliverables: working build + **3-min recorded demo video** (no live demo) + optional AWS Builder Center blog (top 5 blogs win AirPods).

Read order for any agent working on this repo:
1. `00-PROJECT-CONTEXT.md` (this file) — what and why
2. `05-GAME-DESIGN.md` — tasks, credits, territories, animals (the rules engine spec)
3. `01-AWS-REQUIREMENTS.md` — every AWS service, why, and its cost envelope
4. `02-BACKEND-CONTEXT.md` — API, data model, Lambdas, folder structure
5. `03-WEB-CONTEXT.md` — web app (citizen + municipal console)
6. `04-MOBILE-CONTEXT.md` — Expo mobile app (citizen + collector mode)

---

## 1. Problem

Indian cities generate ~1.5 lakh+ tonnes of municipal solid waste a day; the weak link is not trucks or landfills, it's the **household and street-level behaviour** before waste reaches them:
- Source segregation (wet/dry/hazardous) is mandated by SWM Rules 2016 but compliance is low → mixed waste can't be recycled or composted.
- Informal recyclers (kabadiwalas, waste pickers) do most real recycling but are invisible to citizens and to the municipality.
- E-waste, batteries, and multi-layer plastic end up in mixed bins.
- Illegal dumping hotspots ("garbage vulnerable points") reappear after cleanup because nobody owns them.
- Energy behaviour (electricity use, car trips) has no feedback loop at neighbourhood level.

Existing campaigns (Swachh Survekshan, Mission LiFE pledges) are top-down and one-off. There is no **daily, local, rewarded, verifiable** loop for citizens.

## 2. Solution (one line)

A gamified, territory-based civic app where citizens complete **verified** waste and energy actions in their neighbourhood — scanning QR codes on garbage trucks, bins, kabadiwala carts and e-waste points, or submitting AI-verified photos — earning **Green Credits** redeemable for local coupons, while each territory's **animal mascot** gets healthier as the neighbourhood cleans up.

## 3. Why it wins on the judging rubric

| Criterion | How SaafSafari scores |
|---|---|
| Idea & Impact | Directly targets segregation, recycling, e-waste, informal recyclers, energy (all named in the track). Municipal console turns citizen data into ward-level action. |
| Built on AWS | Serverless core + Cognito + Location Service (maps, geofences, live truck tracker) + Bedrock (photo verification, segregation assistant) + Rekognition + Step Functions + EventBridge Scheduler + S3/CloudFront + Amplify Hosting + CDK + Powertools + Cedar. AWS is load-bearing, not decorative. |
| Design & usability | One-tap scan, Hindi/English, works on low-end Android, offline queue, mascot feedback a non-techie understands. |
| Execution | P0 scope is deliberately small: scan → credit → mascot change → coupon. Works end-to-end before anything else is built. |
| Demo video | Story arc: dirty territory with sick mascot → user scans truck QR, verifies a cleanup photo → credits + mascot evolves → municipal console heatmap updates. |

Lesson from our previous Bharat Builds submission (12/30: AWS 3/10, execution 1/4, design 1/4, video 2/4): **depth of AWS usage and one fully working flow matter more than breadth.** Every P0 feature below must run on deployed AWS, not localhost.

## 4. Users and roles

| Role | Platform | Can do |
|---|---|---|
| Citizen | Mobile app (primary), Web | Onboard, pick home territory, see daily/weekly/monthly tasks, scan QR, submit photo proof, view map + mascots, leaderboards, redeem coupons, report hotspots |
| Collector (truck driver / kabadiwala / e-waste point operator) | Mobile app "Collector mode" | Show rotating QR, share live location (trucks), see today's scans, earn collector credits |
| Ward Admin (municipal officer / RWA) | Web console | Register QR sources (bins, trucks, hubs), see territory health + hotspot heatmap, approve flagged submissions, create bounty tasks and community events, export ward reports |
| Merchant | Web console (P2) | Upload coupon inventory, see redemptions |

Roles are Cognito groups: `citizen`, `collector`, `ward_admin`, `merchant`. Fine-grained rules (e.g. a ward admin can only create QR sources inside their ward) are Cedar policies.

## 5. Core loop

```
Open app → see home territory + mascot mood + today's 3 tasks
   → do real-world action → verify (QR scan | photo | receipt | partner)
   → Credits + XP awarded (with multipliers) → territory health ↑
   → mascot evolves / leaderboard moves → redeem coupon
   → tomorrow: new tasks, streak continues
```

## 6. Feature list with priority

### P0 — must work in the demo (Day 1–2)
1. Auth: Cognito email OTP + Google sign-in (see §10 on why not SMS).
2. Onboarding: language (EN/HI), location permission, auto-assign home territory (H3 cell).
3. Territory map: H3 hex territories over the demo city, coloured by animal type and health.
4. Task board: daily (3), weekly (3), monthly (2) tasks assigned per user, server-generated.
5. QR verification: signed QR tokens for static sources (bins, hubs) + rotating QR in Collector mode (trucks, kabadiwalas). Geofence + cooldown + idempotency.
6. Credit engine: base × verification weight × capped multipliers; immutable ledger.
7. Territory health + mascot mood (4 states).
8. Wallet + coupon redemption (seeded demo merchants).
9. Deployed: API on API Gateway + Lambda, web on Amplify Hosting, mobile APK via EAS.

### P1 — strong differentiators (Day 2–3)
10. Photo-proof pipeline: S3 upload → Step Functions → Rekognition labels + Bedrock (Nova Lite) vision judgement → auto-approve / admin review / reject.
11. Explorer bonus for tasks done outside home territory.
12. Municipal console: territory health dashboard, hotspot heatmap, QR source registry, review queue.
13. Hotspot reporting → auto-creates a **Bounty** task in that territory.
14. Leaderboards: per territory, per city, weekly.
15. Live garbage truck on map (Amazon Location tracker) + "truck is near you" notification.

### P2 — only if P0/P1 are solid (Day 3–4)
16. "Saaf Mitra" segregation assistant: photo of an item → which bin + nearest drop point (Bedrock; optionally built with Strands Agents SDK).
17. Electricity bill upload → Textract → month-over-month reduction task.
18. Hindi auto-translation of admin-created tasks (Amazon Translate).
19. Offline action queue on mobile.
20. Referral task, community events with event QR.

**Cut rule:** if Day 2 ends and P0 #5–#8 don't work on deployed AWS, stop all P1 work until they do.

## 7. Territories (summary — full rules in 05-GAME-DESIGN.md)

- The demo city (Delhi NCR — Ghaziabad + East Delhi recommended) is tiled with **Uber H3 hexagons at resolution 7** (~5 km² each) = one Territory.
- Each territory is classified offline by dominant land cover (OSM landuse/natural tags) → an **animal mascot** (Turtle for green, Gangetic Dolphin for water, Camel for sand, Black Kite for metro core, etc.).
- Territory **Health 0–100** rises with verified actions in it and decays daily. Mascot mood: Sick (<25) → Recovering (25–59) → Thriving (60–89) → Legendary (90+).
- Home territory = where the user onboards; changeable once per 30 days.
- Doing tasks in other territories gives the **Explorer bonus** (capped to stop farming).

## 8. Verification methods (trust ladder)

| Method | Trust weight | Used for |
|---|---|---|
| Rotating QR (collector phone, 30-s TTL) + user within 150 m of collector's live location | 1.2 | Garbage truck handover, kabadiwala sale |
| Static signed QR + geofence (user within 75 m of registered source) | 1.0 | Public bins, e-waste points, refill stations, event check-in |
| Photo + AI verification (Bedrock + Rekognition, EXIF/GPS check, perceptual-hash dedupe) | 1.0 if auto-approved, else admin review | Cleanups, home segregation, composting |
| Document (Textract) | 1.0 | Electricity bill, e-waste recycling receipt |
| Self-declared | 0.5, hard daily cap | Quizzes, pledges |

## 9. Non-goals (do not build)
- Real payments, real merchant integrations, carbon-credit trading or any "tonnes of CO₂ offset" claims we can't measure.
- Native iOS build (Expo Android APK + web is enough for the video).
- ML model training. Use Bedrock/Rekognition as-is.
- Multi-city. One demo city, seeded well.

## 10. Hard constraints and known gotchas
- **SMS OTP in India** via SNS/Cognito requires DLT-registered sender ID and templates (TRAI rules) — takes days/weeks. Use Cognito **email OTP** + Google federation. Mention phone OTP as a production step.
- AWS Free Plan account: **$100 credits on signup, +$100 via onboarding activities** (one of them is a Bedrock playground prompt, another is creating a Budget). Free Plan ends after 6 months or when credits run out. Stay in always-free where possible.
- Bedrock has no always-free tier — every call spends credits. Use **Amazon Nova Lite / Nova Micro** (cheapest) and cache results by image hash.
- Don't use Amazon Pinpoint (being retired); don't use ElastiCache/Kinesis/MSK/OpenSearch Service/NAT Gateway (hourly cost, burns credits for no demo value).
- Region: **ap-south-1 (Mumbai)** for everything; check Bedrock model availability there — if Nova Lite isn't enabled in ap-south-1, call it cross-region via an inference profile and say so in the README.
- Hackathon rule: project work starts when the clock starts (Oct 8). These context files are planning; write code during the event.

## 11. Demo city seed data
- 60–120 H3 res-7 territories covering the chosen area, pre-classified.
- 40 QR sources: 10 public bins, 5 e-waste points, 5 kabadiwalas, 3 trucks (collector accounts), 2 refill stations, 15 misc.
- 6 demo merchants with fictional names (e.g. "Hari Bhari Kirana", "Metro Cycle Rentals"), 200 coupons.
- 25 demo users with history so leaderboards and heatmaps aren't empty.

## 12. Repo layout (monorepo)

```
saafsafari/
├── apps/
│   ├── web/                 # Vite + React + TS (citizen web + municipal console) → Amplify Hosting
│   └── mobile/              # Expo (React Native) app → EAS APK
├── services/
│   └── api/                 # Lambda handlers (TS), domain logic, Step Functions definitions
├── infra/                   # AWS CDK (TS) — all stacks
├── packages/
│   ├── shared/              # zod schemas, API types, credit-rule constants, H3 helpers
│   ├── game-rules/          # pure functions: credit calc, health, mood, task generation (unit-tested)
│   └── ui-tokens/           # colours per animal, spacing, typography shared by web + mobile
├── scripts/
│   ├── territories/         # Python: OSM → H3 classification → GeoJSON + DynamoDB seed
│   └── seed/                # TS: seed QR sources, merchants, demo users
├── docs/                    # these context files, architecture diagram, demo script
└── pnpm-workspace.yaml
```

## 13. Four-day build plan

| Day | Goal | Done when |
|---|---|---|
| Thu Oct 8 | CDK stacks deployed (DynamoDB, Cognito, HTTP API, 3 Lambdas). Territory script run, GeoJSON on CloudFront. Mobile + web skeleton logging in. | `POST /scan` on deployed API awards credits to a real Cognito user |
| Fri Oct 9 | Task generation (Scheduler), credit engine, health/mood, map with mascots, wallet + coupons. Collector mode rotating QR. | Full scan → credit → mascot change → redeem flow on a phone |
| Sat Oct 10 | Photo pipeline (Step Functions + Bedrock + Rekognition), municipal console, hotspot bounties, leaderboards, live truck tracker | Admin sees review queue + heatmap |
| Sun Oct 11 | Seed data polish, Hindi strings, bug fixes, architecture diagram, **record video by afternoon**, blog post, submit | Submitted with 2+ hours buffer |

## 14. Demo video script (3:00)
1. 0:00–0:20 Problem: mixed waste, invisible kabadiwalas, one shot of an overflowing dump.
2. 0:20–0:45 Onboarding → home territory "Dolphin Domain — Yamuna Bank" with a **sick** dolphin.
3. 0:45–1:20 Truck arrives (live dot on map) → scan driver's rotating QR → +credits animation; then a cleanup before/after photo auto-verified by Bedrock.
4. 1:20–1:45 Explorer bonus in neighbouring "Camel Dunes" territory; mascot evolves to Recovering.
5. 1:45–2:10 Redeem coupon. Leaderboard.
6. 2:10–2:40 Municipal console: hotspot heatmap, review queue, ward report.
7. 2:40–3:00 Architecture diagram — name each AWS service and what it does. Cost: "runs inside the AWS free credits."
