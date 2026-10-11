# Phase 3 Research: Core API Services, QR Verification & Ledger

## Overview
Phase 3 establishes the primary transactional engine of SaafSafari. It connects client requests (QR scans, habit check-ins, wallet queries, coupon redemptions, live truck locations, and leaderboards) to DynamoDB single-table items and Amazon Location Service with strict consistency guarantees.

---

## 1. DynamoDB Single-Table Access Patterns for Phase 3

### Keys & Item Layout

| Entity | PK | SK | GSI1PK | GSI1SK | Description |
|---|---|---|---|---|---|
| **User Profile** | `USER#<userId>` | `PROFILE` | `TERRITORY#<h3Id>` | `USER#<userId>` | Stores `balanceGC`, `lifetimeXP`, `streakDays`, `homeTerritoryId`, `lastHabitDate`. |
| **Ledger Entry** | `USER#<userId>` | `LEDGER#<ISO_TIMESTAMP>` | `ACTION#<type>` | `<ISO_TIMESTAMP>` | Immutable audit entry of credit gain or spend (`creditsEarned`, `xpEarned`, `sourceId`, `actionType`). |
| **QR Source** | `QR#<sourceId>` | `METADATA` | `TERRITORY#<h3Id>` | `QR#<sourceId>` | Metadata, lat/lng, `secretKey`, `geofenceRadiusMeters`, `type`, `isActive`. |
| **Scan Cooldown** | `USER#<userId>` | `COOLDOWN#<sourceId>` | - | - | TTL-based cooldown preventing repetitive scans of the same source within 4 hours. |
| **Daily Collector Tally** | `USER#<collectorId>` | `DAILY_COLLECTOR#<YYYY-MM-DD>` | - | - | Tracks collector earnings for that day (`dailyCredits`, max 200 GC). |
| **Habit Check-In** | `USER#<userId>` | `HABIT#<YYYY-MM-DD>` | - | - | Prevents multiple habit check-ins on the same calendar day. |
| **Merchant** | `MERCHANT#<merchantId>` | `PROFILE` | `CATEGORY#<category>` | `MERCHANT#<merchantId>` | Merchant profile info. |
| **Coupon** | `MERCHANT#<merchantId>` | `COUPON#<couponId>` | `COUPONS` | `COST#<costGC_padded>` | Available coupon inventory with `stock` and `costGC`. |
| **User Coupon** | `USER#<userId>` | `COUPON#<redemptionId>` | `COUPON_STATUS#active` | `<ISO_TIMESTAMP>` | Redeemed coupon instance holding `redemptionCode`. |
| **Weekly Redemption Limit** | `USER#<userId>` | `LIMIT#<merchantId>#<YYYY-WW>` | - | - | Prevents exceeding 1 coupon redemption per merchant per week. |
| **Territory Metadata** | `TERRITORY#<h3Id>` | `METADATA` | `STATUS#<mood>` | `HEALTH#<health_padded>` | Territory health, mascot, and activity metrics. |

---

## 2. Atomic Transaction Patterns (`TransactWriteItems`)

All mutating actions in SaafSafari must be atomic (`CRED-02`). Either the user balance, immutable ledger entry, territory health, and rate-limiting markers all succeed, or none do.

### A. QR Scan Transaction (`POST /v1/scans`)
```ts
TransactItems: [
  // 1. Immutable ledger audit record
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `LEDGER#${timestamp}`,
        GSI1PK: `ACTION#${actionType}`,
        GSI1SK: timestamp,
        userId,
        actionType,
        creditsEarned,
        xpEarned,
        sourceId,
        territoryId,
        timestamp,
      },
    },
  },
  // 2. Atomic update to user balance & XP
  {
    Update: {
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET balanceGC = balanceGC + :gc, lifetimeXP = lifetimeXP + :xp, updatedAt = :now',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: {
        ':gc': creditsEarned,
        ':xp': xpEarned,
        ':now': timestamp,
      },
    },
  },
  // 3. Scan cooldown record (4 hour TTL)
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `COOLDOWN#${sourceId}`,
        ttl: Math.floor(Date.now() / 1000) + 4 * 3600,
        createdAt: timestamp,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    },
  },
  // 4. Territory health bump
  {
    Update: {
      TableName,
      Key: { PK: `TERRITORY#${territoryId}`, SK: 'METADATA' },
      UpdateExpression: 'SET health = health + :gain, totalActions = if_not_exists(totalActions, :zero) + :one',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: {
        ':gain': Math.min(1, Math.max(0.1, Number((creditsEarned * 0.02).toFixed(2)))),
        ':zero': 0,
        ':one': 1,
      },
    },
  },
  // 5. Collector reward (if truck scan)
  ...(isTruckCollector && collectorId ? [
    {
      Update: {
        TableName,
        Key: { PK: `USER#${collectorId}`, SK: 'PROFILE' },
        UpdateExpression: 'SET balanceGC = balanceGC + :cgc, lifetimeXP = lifetimeXP + :cgc, updatedAt = :now',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: {
          ':cgc': 2,
          ':now': timestamp,
        },
      },
    },
  ] : []),
]
```

### B. Daily Habit Check-In Transaction (`POST /v1/tasks/checkin`)
```ts
TransactItems: [
  // 1. Guard against duplicate check-in today
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `HABIT#${todayDateStr}`,
        timestamp,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    },
  },
  // 2. Ledger record
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `LEDGER#${timestamp}`,
        GSI1PK: 'ACTION#HABIT_SEGREGATION',
        GSI1SK: timestamp,
        userId,
        actionType: 'HABIT_SEGREGATION',
        creditsEarned: 5,
        xpEarned: 10,
        timestamp,
      },
    },
  },
  // 3. User balance and streak progression
  {
    Update: {
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET balanceGC = balanceGC + :gc, lifetimeXP = lifetimeXP + :xp, streakDays = streakDays + :streakInc, lastHabitDate = :today, updatedAt = :now',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeValues: {
        ':gc': 5,
        ':xp': 10,
        ':streakInc': isConsecutiveDay ? 1 : (isTodayAlready ? 0 : -(streakDays - 1)),
        ':today': todayDateStr,
        ':now': timestamp,
      },
    },
  },
]
```

### C. Coupon Redemption Transaction (`POST /v1/coupons/redeem`)
```ts
TransactItems: [
  // 1. Atomic debit of user balance with conditional solvency check
  {
    Update: {
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET balanceGC = balanceGC - :cost, updatedAt = :now',
      ConditionExpression: 'attribute_exists(PK) AND balanceGC >= :cost',
      ExpressionAttributeValues: {
        ':cost': coupon.costGC,
        ':now': timestamp,
      },
    },
  },
  // 2. Atomic decrement of coupon stock
  {
    Update: {
      TableName,
      Key: { PK: `MERCHANT#${merchantId}`, SK: `COUPON#${couponId}` },
      UpdateExpression: 'SET stock = stock - :one',
      ConditionExpression: 'stock > :zero',
      ExpressionAttributeValues: {
        ':one': 1,
        ':zero': 0,
      },
    },
  },
  // 3. Create user redeemed coupon record
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `COUPON#${redemptionId}`,
        GSI1PK: 'COUPON_STATUS#active',
        GSI1SK: timestamp,
        redemptionId,
        couponId,
        merchantId,
        redemptionCode,
        costGC: coupon.costGC,
        redeemedAt: timestamp,
        expiresAt: coupon.expiresAt,
        status: 'active',
      },
    },
  },
  // 4. Record spend in ledger
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `LEDGER#${timestamp}`,
        GSI1PK: 'ACTION#COUPON_REDEMPTION',
        GSI1SK: timestamp,
        userId,
        actionType: 'COUPON_REDEMPTION',
        creditsEarned: -coupon.costGC,
        xpEarned: 0,
        couponId,
        merchantId,
        timestamp,
      },
    },
  },
  // 5. Enforce weekly redemption limit per merchant
  {
    Put: {
      TableName,
      Item: {
        PK: `USER#${userId}`,
        SK: `LIMIT#${merchantId}#${currentWeekKey}`,
        createdAt: timestamp,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    },
  },
]
```

---

## 3. QR Verification Engine Algorithms

### A. HMAC-SHA256 Rotating Token Specification (`QR-02`)
- Collector truck displays a dynamic QR code on a mobile device or mounted tablet.
- To prevent replay attacks and photo sharing, the token expires in 30 seconds.
- Token structure: `<timestamp_ms>.<hmac_hex>`
  - `timeStep = Math.floor(timestampMs / 30000)`
  - Expected HMAC: `HMAC-SHA256(source.secretKey, "${sourceId}:${timeStep}")`
- Server verification logic:
  - Verify timestamp is within reasonable range (not more than 90 seconds in the future or past).
  - Compute candidate signatures for `[timeStep - 1, timeStep, timeStep + 1]` to allow $\pm 1$ step clock drift tolerance (effectively a 60–90s total window).
  - Use `crypto.timingSafeEqual` to avoid timing side channels.

### B. Proximity & Geofencing Validation (`QR-01`, `QR-03`)
- **Haversine Distance Formula**:
  $$d = 2 R \arcsin \left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  where $R = 6,371,000\text{ m}$.
- **Static Bins (`QR-01`)**:
  - Distance between citizen GPS `(lat, lng)` and static bin coordinates must be $\le 75\text{ m}$ (or `source.geofenceRadiusMeters`).
- **Collector Trucks (`QR-03`)**:
  - Distance between citizen GPS `(lat, lng)` and collector truck position must be $\le 150\text{ m}$.
  - Truck position can be retrieved live from Amazon Location Tracker (`GetDevicePosition`) with fallback to the last recorded coordinates in DynamoDB.

---

## 4. Leaderboard Retrieval Strategy

Leaderboards are requested frequently by citizens to inspect competitive progress (`LEAD-01`, `LEAD-02`).
- **Territory Leaderboard**:
  - Query `GSI1PK = TERRITORY#<homeTerritoryId>` with `begins_with(GSI1SK, 'USER#')`.
  - Sort in memory (or rank by `lifetimeXP` desc). Return top 20 users with their rank, name/slug, tier, and XP.
- **Citywide Leaderboard**:
  - Query seeded top citizens, sort by `lifetimeXP` desc.
- **Territory vs. Territory Leaderboard**:
  - Query `GSI1PK = STATUS#thriving` and `STATUS#recovering` / `STATUS#legendary`, or read territory metadata items.
  - Rank territories by `health` desc. Return territory name, mascot, mood, and health.

---

## 5. AWS CDK ApiStack Route Mounting

All new routes use `TsLambda` with esbuild bundling targeting Node.js 22 arm64:
- `GET /v1/tasks` (Secured)
- `POST /v1/tasks/checkin` (Secured)
- `POST /v1/scans` (Secured)
- `GET /v1/wallet` (Secured)
- `GET /v1/coupons` (Public/Secured)
- `POST /v1/coupons/redeem` (Secured)
- `GET /v1/trucks/live` (Public/Secured)
- `GET /v1/leaderboards` (Public/Secured)

IAM Permissions granted:
- DynamoDB `ReadWriteData` to mutation handlers (`scanFn`, `walletRedeemFn`, `tasksCheckinFn`).
- DynamoDB `ReadData` to query handlers (`tasksGetFn`, `walletGetFn`, `leaderboardsGetFn`, `trucksGetFn`).
- Amazon Location `geo:GetDevicePosition` and `geo:BatchGetDevicePosition` granted to `scanFn` and `trucksGetFn`.
