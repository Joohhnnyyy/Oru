# SaafSafari — Game Design Spec (tasks, credits, territories, animals)

This file is the **rules engine contract**. All numbers live in `packages/game-rules/src/constants.ts` and must match this file. Logic in `packages/game-rules` is pure and unit-tested; Lambdas only call it.

---

## 1. Currencies

| Currency | Spendable | Ever decreases | Purpose |
|---|---|---|---|
| **Green Credits (GC)** | Yes (coupons) | Yes (on redeem) | Reward economy |
| **XP** | No | Never | Rank / level; XP = lifetime GC earned |
| **Territory Health (TH)** | — | Decays daily | Collective score of a territory (0–100), drives mascot mood |

Levels: `level = floor(sqrt(XP / 50)) + 1` → L2 at 50 XP, L5 at 800, L10 at 4,050, L20 at 18,050.
Rank titles: 1–4 Beej (Seed), 5–9 Ankur (Sprout), 10–14 Paudha (Sapling), 15–19 Vriksh (Tree), 20+ Van Rakshak (Forest Guardian).

## 2. Difficulty tiers (base credits)

| Tier | Name | Base GC | Typical effort |
|---|---|---|---|
| T1 | Easy | 10 | < 5 min, daily habit |
| T2 | Medium | 25 | 15–30 min or travel |
| T3 | Hard | 60 | Hour+ or physical effort |
| T4 | Epic | 150 | Multi-day / monthly commitment |
| T5 | Legendary | 400 | Community-scale or big-ticket action |

Tasks may override the base inside ±40% of their tier (e.g. a T2 task can be 15–35).

## 3. Credit formula

```
raw        = base × verificationWeight
multiplier = min( streakMult × explorerMult × needMult × eventMult , 2.0 )   // hard cap
credits    = round(raw × multiplier) + flatBonuses
```

| Factor | Values |
|---|---|
| verificationWeight | rotating QR 1.2 · static QR 1.0 · AI-approved photo 1.0 · admin-approved photo 0.9 · document 1.0 · self-declared 0.5 |
| streakMult | days 1–2: 1.0 · 3–6: 1.1 · 7–13: 1.2 · 14–29: 1.3 · 30+: 1.5 |
| explorerMult | home territory 1.0 · adjacent (H3 ring 1) 1.15 · ≥2 rings away 1.25 |
| needMult | target territory health < 25: 1.3 · 25–59: 1.1 · ≥ 60: 1.0 |
| eventMult | community event / admin "double day": 2.0 |
| flatBonuses | first-ever task in a new territory +30 (max 3 per day) · completing all 3 dailies +20 · all weeklies +75 · all monthlies +250 |

### Anti-farming caps
- Max **300 GC/day** from photo + self-declared tasks combined; QR tasks uncapped but each source has a cooldown.
- Per-source cooldown: truck QR 1 per user per 20 h · bin QR 1 per user per source per 4 h · kabadiwala 1 per 24 h · e-waste point 1 per 7 days.
- Explorer bonus counts only if user has ≥ 1 verified task in home territory in the last 7 days (stops "only farm other territories").
- Self-declared tasks: max 2/day, max 15 GC/day.
- Same photo (perceptual hash distance ≤ 6) across any users → auto-reject.
- Photo EXIF timestamp must be within 30 min of upload; GPS (device location sent with submission) within 200 m of claimed location.
- Velocity check: two location-bound verifications > 5 km apart within 10 min → flag for review.

### Worked example
User on a 9-day streak scans a kabadiwala's rotating QR in an adjacent territory with health 20:
`raw = 50 × 1.2 = 60`, `mult = min(1.2 × 1.15 × 1.3 × 1, 2.0) = 1.794`, `credits = round(107.6) = 108`, plus +30 first-time-territory = **138 GC**.

## 4. Task system

### Assignment
- **Daily** (refresh 00:00 IST via EventBridge Scheduler): 3 tasks per user — 1 from "always" pool (segregation/handover), 1 random T1, 1 random T2. Avoid repeating yesterday's random picks.
- **Weekly** (refresh Monday 00:00 IST): 3 tasks — 1 T2, 1 T3, 1 Explorer/Social.
- **Monthly** (refresh 1st 00:00 IST): 2 personal (T4) + 1 territory-wide community goal (shared progress bar).
- **Bounties** (any time): created from validated hotspot reports or by ward admins; visible to everyone within 2 H3 rings; first N verified completions get paid.
- Task generator is a pure function: `generateTasks(user, period, catalog, seed)` with a seed of `userId+periodKey` so results are reproducible.

### Daily task catalog

| ID | Task | Tier / GC | Verification |
|---|---|---|---|
| D01 | Hand over segregated waste at the garbage truck | T1 / 15 | Rotating QR (truck) |
| D02 | Show your wet/dry bins at home (two bins in frame) | T1 / 10 | Photo (AI) |
| D03 | Use a public dustbin — scan its QR | T1 / 10 | Static QR + geofence |
| D04 | Refill a bottle at a refill station instead of buying one | T1 / 10 | Static QR |
| D05 | Shop with your own cloth bag | T1 / 10 | Photo (bag + shop) |
| D06 | Take metro / bus instead of a cab or bike | T2 / 25 | Photo of ticket/QR ticket (AI) |
| D07 | Walk or cycle a trip ≥ 2 km | T2 / 20 | In-app GPS trace (speed < 25 km/h) |
| D08 | Plog: pick up 10 litter items | T2 / 30 | Before/after photo (AI) |
| D09 | Compost today's kitchen scraps | T1 / 10 | Photo (AI) |
| D10 | 5-question waste quiz | T1 / 5 | Self (graded) |
| D11 | Report a garbage hotspot | T1 / 15 (paid when validated) | Geo-photo (AI + admin) |
| D12 | Keep AC at 24 °C+ / switch off standby today | T1 / 5 | Self-declared |
| D13 | Flatten and keep aside dry recyclables (cardboard/PET) | T1 / 10 | Photo (AI) |

### Weekly task catalog

| ID | Task | Tier / GC | Verification |
|---|---|---|---|
| W01 | Sell dry waste to a registered kabadiwala | T2 / 50 | Rotating QR (kabadiwala) |
| W02 | Drop e-waste (phone, charger, cables) at an e-waste point | T3 / 80 | Static QR + geofence |
| W03 | Clean a reported hotspot (bounty) | T3 / 100 | Before/after photo (AI) + admin spot-check |
| W04 | Explorer: complete tasks in 2 different territories | T2 / 40 | System-derived |
| W05 | 5-day segregation streak (D01/D02 on 5 days) | T2 / 40 | System-derived |
| W06 | Car-free day: only walk/cycle/transit for a full day | T2 / 40 | ≥ 2 transit/walk verifications same day |
| W07 | Dispose batteries / CFL / tubelights at a hazardous drop point | T2 / 50 | Static QR |
| W08 | Repair instead of replace (repair shop) | T2 / 50 | Partner QR or bill photo (Textract) |
| W09 | Collect multi-layer plastic (chips/biscuit packets) and drop at MLP point | T2 / 40 | Static QR |
| W10 | Bring a friend whose first task gets verified | T2 / 40 | Referral code |
| W11 | Attend a ward cleanup / awareness event | T3 / 70 | Event QR |

### Monthly task catalog

| ID | Task | Tier / GC | Verification |
|---|---|---|---|
| M01 | Cut electricity units vs last month (≥ 5%) | T4 / 200 | Bill upload × 2 → Textract |
| M02 | Zero-mixed-waste month: ≥ 20 segregation check-ins | T4 / 200 | System-derived |
| M03 | Start home composting: 4 weekly progress photos | T4 / 200 | Photo series (AI) |
| M04 | Adopt-a-spot: keep one public spot clean for 4 weeks | T4 / 250 | Weekly photos, same geofence |
| M05 | Organise an e-waste collection drive (≥ 5 items from neighbours) | T5 / 400 | E-waste point QR × 5 + operator confirm |
| M06 | Register on the PM Surya Ghar rooftop-solar portal / get a site survey | T5 / 400 | Document (screenshot/receipt) + admin |
| M07 | 15 transit/walk trips this month | T4 / 150 | System-derived |
| M08 | Community goal: raise your territory's health by 15 points | T4 / 150 each participant | Territory-wide progress |

### Collector credits
Collectors earn **2 GC per unique citizen scan** (max 200/day) — this is what makes kabadiwalas and drivers *want* to show the QR. Payouts to collectors are the informal-recycler inclusion story.

## 5. Territory Health

```
TH_new = clamp( TH_old × 0.97                      // 3% daily decay, nightly job
               + Σ(verified credits in territory today) / (10 × activeUsersInTerritory + 50)
               + 5 × hotspotsResolvedToday
               − 3 × newValidatedHotspotsToday , 0, 100)
```
- Seed health from land cover + hotspot density (dense dump areas start at 10–20).
- Mood: **Sick** < 25 · **Recovering** 25–59 · **Thriving** 60–89 · **Legendary** ≥ 90 (golden aura; needs 7 consecutive days ≥ 90).
- Mascot art: 4 moods × each animal. Sick = grey tint, droopy; Legendary = gold outline + particles.

## 6. Territory generation

1. Bounding box of demo city → all **H3 res-7** cells (`h3.polygonToCells`).
2. For each cell, pull OSM features (Overpass, offline script) and compute area share of: forest/park/grass (`landuse=forest|grass|recreation_ground`, `leisure=park`, `natural=wood`), water (`natural=water`, `waterway=riverbank`), sand/bare (`natural=sand|bare_rock`, `landuse=quarry`), wetland (`natural=wetland`), farmland (`landuse=farmland|orchard`), industrial (`landuse=industrial`), commercial/retail, residential, plus building density (buildings per km²) and tall-building share (`building:levels ≥ 8`).
3. Apply the rules in §7 in order; first match wins.
4. Name = `<Animal title> — <largest locality name in cell>` e.g. "Dolphin Domain — Yamuna Bank".
5. Output: `territories.geojson` (to S3 → CloudFront) + DynamoDB `TERRITORY#<h3>` items.

## 7. Animal mascots

Rules are evaluated top to bottom; thresholds are share of cell area unless stated.

| # | Land type (rule) | Animal | Colour | Why it fits |
|---|---|---|---|---|
| 1 | Water ≥ 25% | **Gangetic River Dolphin** | Aqua blue `#2BB3E0` | India's national aquatic animal; lives in the Ganga–Yamuna system it's literally fighting pollution in |
| 2 | Wetland ≥ 15% | **Flamingo** | Pink `#F27BA8` | Okhla, Sambhar, Thane creek; pink is unmistakable on a map |
| 3 | Sand / bare / quarry ≥ 25% | **Camel** | Sand yellow `#E8C547` | Your original pick; Rajasthan + riverbeds + construction zones |
| 4 | Forest ≥ 35% | **Bengal Tiger** | Orange `#F28C28` | Dense green = top predator; national animal |
| 5 | Park / grass / trees ≥ 20% | **Indian Star Tortoise** | Leaf green `#4CAF50` | Your "green turtle", made Indian; slow-and-steady fits a habit app |
| 6 | Hills (mean slope > 8°, needs DEM; optional) | **Red Panda** / **Snow Leopard** (high altitude) | Rust red `#C1440E` / Ice grey `#B8C4CC` | Himalayan cities (Shimla, Darjeeling, Shillong) |
| 7 | Farmland ≥ 30% | **Indian Peafowl (Peacock)** | Royal indigo `#3F51B5` | National bird, common on farm edges of every NCR village |
| 8 | Industrial ≥ 20% | **Indian Pangolin** | Bronze `#A97142` | Armoured like machinery; endangered → "needs protecting", great for low-health zones |
| 9 | Coastal (within 2 km of coastline) | **Olive Ridley Turtle** — or **Fiddler Crab** if you want to keep turtles distinct | Teal `#00897B` / Coral `#FF6F61` | Odisha/Chennai/Mumbai coasts |
| 10 | Metro core: building density top 10% of city AND (commercial ≥ 25% OR tall-building share ≥ 15%) | **Black Kite** | Slate `#546E7A` | See below |
| 11 | Dense old city / markets: building density top 25%, mixed residential-commercial, low height | **Rhesus Macaque** | Dusty brown `#8D6E63` | Chandni Chowk, Lajpat Nagar — chaotic, crowded, clever |
| 12 | Planned residential / suburbs (fallback for residential ≥ 40%) | **Indian Palm Squirrel** | Warm grey `#9E9E9E` with stripe | Lives in every colony tree; friendly, cute default |
| 13 | Anything else | **House Sparrow** | Earth brown `#A1887F` | Declining urban bird → "bring the sparrows back" story |

### Which animal for metropolitan / very developed areas?
**Black Kite (Cheel).** Reasons:
- It is *the* bird of Delhi's skyline — thousands circle CBDs, flyovers and landfills.
- It feeds on urban waste, so it literally embodies the track: a dirty metro territory has a kite scavenging trash (Sick); a clean one has it soaring over a green skyline (Legendary). The mascot's story = "give the kite something better than garbage".
- Strong, sleek silhouette that reads well at small icon sizes; slate/steel colour matches glass-and-concrete without clashing with the nature palette.

Alternatives if you want a cuter mascot for the metro core: **Peregrine Falcon** (nests on skyscrapers worldwide, "fastest city", but not as Indian-specific) or **Rock Pigeon** (instantly recognisable but low-status). Use the **Rhesus Macaque** for dense old-city/market cores and **Palm Squirrel** for planned residential so a single metro city still shows 3–4 different urban animals instead of one grey blob.

### Mascot mood copy (example — Dolphin)
- Sick: "The river is choking. 412 bags of plastic reported here this week."
- Recovering: "Water's clearing up — keep segregating!"
- Thriving: "Dolphins spotted! Your ward is in the top 20%."
- Legendary: "Legendary Dolphin Domain. 7 days of 90+ health."

## 8. Leaderboards
- Individual: per territory (weekly), city (weekly + all-time), friends.
- Territory vs territory: weekly health gain, not absolute health (so dirty areas can win).
- Ward/RWA board for the municipal console.

## 9. Coupons
- Priced in GC: 200 GC → ₹20 off kirana; 500 GC → ₹50 metro/bike-rental; 1,000 GC → free compost kit; 2,500 GC → repair-shop voucher.
- Redemption is an atomic conditional write (balance ≥ price AND coupon unclaimed). One coupon per merchant per user per week.
- Demo merchants are fictional; real partners (EV charging, metro, kirana chains) are a "next steps" slide, not a claim.
