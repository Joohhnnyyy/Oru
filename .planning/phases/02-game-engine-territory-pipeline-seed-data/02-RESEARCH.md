# Phase 2 Research: Game Engine, Territory Pipeline & Seed Data

## 1. Pure Game Rules Engine Architecture (`packages/game-rules`)

### Design Constraints
- Zero external runtime dependencies (no AWS SDK, no external HTTP clients).
- Pure mathematical functions with 100% deterministic outputs.
- Fully portable: importable in backend Lambdas (`services/api`), background scheduled tasks, or frontend client apps (web/mobile).
- 100% unit-tested with Vitest.

### Mathematical Formulas & Specifications

#### 1.1 Action Types and Base Rewards
```typescript
export type CivicActionType =
  | 'HABIT_SEGREGATION'      // T0: Daily self-attested home waste segregation
  | 'STATIC_BIN_SCAN'        // T1: Geofenced dustbin QR scan
  | 'E_WASTE_DROPOFF'        // T2: Verified e-waste recycling center scan
  | 'TRUCK_COLLECTOR_SCAN'   // T2: Live rotating QR scan with collection vehicle
  | 'COMMUNITY_CLEANUP_PROOF'// T3: AI-verified photo of public waste cleanup
  | 'HOTSPOT_REPORT';        // Civic: Report illegal dumping site
```

Base values:
- `HABIT_SEGREGATION`: 5 Base GC, 10 Base XP (Trust Level T0)
- `STATIC_BIN_SCAN`: 10 Base GC, 25 Base XP (Trust Level T1)
- `TRUCK_COLLECTOR_SCAN`: 25 Base GC, 50 Base XP (Trust Level T2)
- `E_WASTE_DROPOFF`: 50 Base GC, 100 Base XP (Trust Level T2)
- `COMMUNITY_CLEANUP_PROOF`: 100 Base GC, 250 Base XP (Trust Level T3)
- `HOTSPOT_REPORT`: 15 Base GC, 35 Base XP (Trust Level T2)

#### 1.2 Trust Weights ($W_T$)
- $T_0 = 0.5$
- $T_1 = 1.0$
- $T_2 = 1.5$
- $T_3 = 2.0$

#### 1.3 Multipliers & Cap Enforcement
- **Streak Multiplier:**
  $$M_S = \min(1.0 + \text{streakDays} \times 0.05, 1.5)$$
  (e.g., 5-day streak = $1.25\times$; 10-day streak = $1.50\times$; capped at $1.5\times$).
- **Territory Urgency Boost:**
  If the action occurs in a territory with mood `sick` (health $\le 30$):
  $$M_H = 1.25$$
  Otherwise: $M_H = 1.0$.
- **Combined Multiplier:**
  $$M_{\text{effective}} = \min(M_S \times M_H, 2.0)$$
  *(Hard cap of $2.0\times$ enforced via DEC-06)*.
- **Reward Computation:**
  $$\text{GreenCreditsEarned} = \lfloor \text{BaseGC} \times W_T \times M_{\text{effective}} \rfloor$$
  $$\text{XPEarned} = \lfloor \text{BaseXP} \times M_{\text{effective}} \rfloor$$

#### 1.4 Territory Health & Mood States
- **Nightly Decay:**
  $$\text{Health}_{t+1} = \max(0, \text{round}(\text{Health}_t \times 0.97))$$
  (3% decay applied each night at midnight via EventBridge Scheduler).
- **Health Recovery from Actions:**
  $$\Delta H = \min(5, \max(1, \lfloor \text{GreenCreditsEarned} / 10 \rfloor))$$
  $$\text{Health}_{\text{new}} = \min(100, \text{Health}_{\text{current}} + \Delta H)$$
- **Mood State Mapping:**
  - $0 \le \text{Health} \le 30 \implies \mathbf{sick}$
  - $31 \le \text{Health} \le 60 \implies \mathbf{recovering}$
  - $61 \le \text{Health} \le 85 \implies \mathbf{thriving}$
  - $86 \le \text{Health} \le 100 \implies \mathbf{legendary}$

#### 1.5 Tier Progression (Beej to Van Rakshak)
- $0 \le \text{XP} < 500 \implies$ **Beej** (Seed)
- $500 \le \text{XP} < 1,500 \implies$ **Ankur** (Sprout)
- $1,500 \le \text{XP} < 4,000 \implies$ **Paudha** (Sapling)
- $4,000 \le \text{XP} < 10,000 \implies$ **Vriksh** (Tree)
- $\text{XP} \ge 10,000 \implies$ **Van Rakshak** (Forest Guardian)

---

## 2. Deterministic Task Board Generator

### Requirements (TASK-01, TASK-02)
- Seeded pseudo-random generation using Mulberry32 PRNG.
- Input seed: `hash("${userId}:${periodKey}")` (e.g. `"usr_123:2026-10-05"`).
- Deterministic output guarantees:
  - Daily Board: exactly 3 tasks (1 habit, 1 T1 scan, 1 T2 handover/dropoff).
  - Weekly Board: exactly 3 tasks (e.g. 5 consecutive days habit, 3 truck scans, 1 e-waste dropoff).
  - Monthly Board: 2 high-value personal challenges + 1 territory collective goal.
- Calling `generateTaskBoard(userId, date)` produces identical task IDs, descriptions, and targets across multiple invocations without database writes.

---

## 3. Delhi NCR Uber H3 Resolution 7 Territory Pipeline

### Geometry & Grid Specs (DEC-05)
- Uber H3 Resolution 7:
  - Average Hexagon Area: $\approx 5.16\text{ km}^2$
  - Average Edge Length: $\approx 1.22\text{ km}$
- Bounding Box for Delhi NCR:
  - Min Lat: `28.40`, Max Lat: `28.88`
  - Min Lng: `76.84`, Max Lng: `77.40`
- Boundary Generation:
  - Uses `h3.polygonToCells` covering the Delhi NCT administrative envelope.
  - Produces 60–75 distinct H3 cells.
  - Converts each cell into GeoJSON Polygon using `h3.cellToBoundary(cell, true)`.

### Mascot & Land-Cover Assignment (DEC-07)
| Land Cover / Region | Coordinates / Heuristic | Animal Mascot | English Name | Hindi Name |
|---------------------|-------------------------|---------------|--------------|------------|
| **Forest / Ridge** | Southern Ridge / Asola Bhatti (Lat < 28.53, Lng < 77.24) | `nilgai` | Blue Bull | नीलगाय |
| **River / Wetlands**| Yamuna Floodplains (Lng $\in [77.23, 77.33]$, Lat $\in [28.58, 28.73]$) | `blackbuck` | Blackbuck | काला हिरण |
| **Urban Parks** | Central / Lutyens / Lodhi / Chanakyapuri (Lat $\in [28.56, 28.62]$, Lng $\in [77.17, 77.23]$) | `peafowl` | Indian Peafowl | मोर |
| **Dense Urban** | Old Delhi, Chandni Chowk, Karol Bagh, Laxmi Nagar | `macaque` | Rhesus Macaque | बंदर |
| **Semi-Arid Scrub** | Najafgarh, Dwarka fringe, Rohini West | `jackal` | Golden Jackal | सियार |

---

## 4. DynamoDB Seeding Strategy (`scripts/seed.ts`)

### Partition & Sort Key Structure (`SaafSafariMain`)

| Entity | PK | SK | GSI1PK | GSI1SK | Key Attributes |
|--------|----|----|--------|--------|----------------|
| **Territory** | `TERRITORY#<h3Index>` | `METADATA` | `STATUS#<mood>` | `HEALTH#<health>` | name, mascot, health, coordinates, cleanIndex |
| **QR Source** | `QR#<sourceId>` | `METADATA` | `TERRITORY#<h3Index>` | `QR#<sourceId>` | type, name, lat, lng, secretKey, radiusMeters |
| **Merchant** | `MERCHANT#<merchantId>` | `PROFILE` | `CATEGORY#<category>` | `MERCHANT#<merchantId>` | name, logoUrl, address, lat, lng, ward |
| **Coupon** | `MERCHANT#<merchantId>` | `COUPON#<couponId>` | `COUPONS` | `COST#<costGC>` | title, discount, costGC, expiresAt, stock |
| **Demo User** | `USER#<userId>` | `PROFILE` | `TERRITORY#<homeH3>` | `USER#<userId>` | email, role, balanceGC, lifetimeXP, streakDays |
| **Ledger Entry** | `USER#<userId>` | `LEDGER#<timestamp>`| `ACTION#<type>` | `TIMESTAMP` | amountGC, xpEarned, actionType, territoryId |

### Seed Volume Plan
- **60+ Territories:** Delhi NCR hexagonal cells with realistic initial health scores (some sick at 22, thriving at 74, etc.) to showcase all 4 mascot mood states.
- **40 QR Sources:**
  - 25 Smart Public Dustbins (static signed QR) in Connaught Place, Lodhi Gardens, Chandni Chowk, Hauz Khas.
  - 10 Waste Collection Vehicles (dynamic rotating QR) assigned to municipal wards.
  - 5 E-Waste Collection Centers in Nehru Place, Okhla, and Laxmi Nagar.
- **6 Eco-Merchants & 15 Coupons:**
  - Delhi Organic Farmers Market (10% off vegetables for 50 GC)
  - Khadi India Connaught Place (₹100 off handloom for 120 GC)
  - Blue Tokai Sustainable Coffee (Free oat milk upgrade for 40 GC)
  - Mother Dairy Eco-Booth (₹20 discount for 30 GC)
  - FabIndia Sustainable Fashion (15% off for 150 GC)
  - Chaayos Reusable Cup Perk (₹25 off for 35 GC)
- **25 Demo Users:**
  - 20 Citizens across different territories and levels (Beej to Van Rakshak).
  - 3 Waste Truck Collectors (`collector` role).
  - 2 Municipal Ward Admins (`ward_admin` role for Ward 34 and Ward 12).
