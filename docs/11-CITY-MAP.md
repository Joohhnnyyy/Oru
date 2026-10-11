# City map: territories, guardians, bins and truck tracking

## What the map shows

| Layer | Source | Refresh |
|---|---|---|
| H3 territory hexes, coloured by health | `GET /v1/map` → DynamoDB `TERRITORY#…` (boundary from `h3.cellToBoundary`) | 2 min |
| Guardian on each territory | habitat mascot → app guardian (`services/api/src/utils/guardians.ts`) | 2 min |
| Public bins and e-waste points, coloured by fill | `GET /v1/map` → `QR#…` sources + fill model (`utils/bins.ts`) | 2 min |
| Collection trucks (live / parked) | `GET /v1/trucks/live` | 15 s |
| Selected truck's route | `GET /v1/trucks/{sourceId}/trail` → Amazon Location position history | on select |
| Base map | Amazon Location Service Maps API v2 (`Standard` style) via MapLibre GL | — |

## AWS flow

```
Collector app (GPS every ~10 s)
   └─ POST /v1/collector/location ── Lambda ──┬─ DynamoDB  QR#truck  liveLatitude/Longitude
                                              └─ Amazon Location Tracker (saafsafari-truck-tracker)
                                                     │  linked (TrackerConsumer) to
                                                     ▼
                                     Geofence collection (saafsafari-geofences) = territory hexes
                                                     │  ENTER / EXIT
                                                     ▼
                                     EventBridge "Location Geofence Event"
                                                     ▼
                                     Lambda onGeofenceEvent → TERRITORY#… lastTruckVisitAt, truckVisits
```

Bin fill is estimated (no sensors yet): +2.5 %/hour since the last pickup, 100 % when a citizen
reports it full, reset to 0 only when a nearby collector explicitly confirms a pickup. GPS proximity is not proof of pickup.
≥ 45 % = filling, ≥ 75 % = needs pickup.

## Endpoints

| Route | Who | Notes |
|---|---|---|
| `GET /v1/map` | signed in | territories + bins + Amazon Location style URL |
| `POST /v1/collector/location` | collector | `{ latitude, longitude, accuracy?, speedKmh?, heading? }` |
| `GET /v1/trucks/{sourceId}/trail?minutes=120` | signed in | Amazon Location history |
| `POST /v1/bins/{sourceId}/report` | citizen | `{ issue: 'FULL'｜'DAMAGED', latitude, longitude }`, within 300 m, 1/hour/bin |
| `POST /v1/collector/bins/{sourceId}/emptied` | collector | within 100 m; `repaired: true` clears damage |
| `POST /v1/admin/geofences/sync` | ward_admin | pushes all territory hexes into the geofence collection |

## Deploy checklist

1. `pnpm deploy:backend` (creates the tracker consumer, Maps API key, Lambdas, EventBridge rule).
2. Existing registered territories and QR sources are reused; do not re-seed production balances to set up the map.
3. Sync geofences once (and after re-seeding):
   `curl -X POST "$API_URL/v1/admin/geofences/sync" -H "Authorization: Bearer <ward_admin ID token>"`
4. On the root website, sign in as a collector and choose **Start sharing truck location**. Keep the collector page open; GPS reports approximately every 10 seconds. The citizen map refreshes trucks every 15 seconds. Stop sharing when the shift ends.

The root website uses Amazon Location tiles via MapLibre. If tiles or WebGL are unavailable, the accessible territory, bin, hotspot and truck lists remain available. The mobile app retains its existing fallback.


## Root website

`/map` displays geographic H3 boundaries coloured by health, guardian artwork at each territory centre,
registered dustbins/e-waste points, real collector GPS positions and the selected truck’s recorded route.
`/t/:id` shows that territory’s assigned guardian, health, mood, hotspot count and last recorded truck visit.
Citizens can report full/damaged bins after allowing location access. Collectors can explicitly confirm pickups
from the map. Admins can sync geofences from the same page. Damaged status persists until a repair is confirmed.

Dustbin fill remains an uncalibrated estimate (+2.5%/hour), clearly labelled in the website; no physical fill
sensors have been installed. Seeded locations represent the existing demo service area, not a nationwide deployment.
Browser GPS needs HTTPS (localhost also works), permission and an open collector page. GPS sharing is foreground-only.

## Verified deployment — 11 October 2026

GeoStack and ApiStack deployed in ap-south-1. Authenticated map response: 61 territories, 36 collection
points, 10 registered trucks. Amazon map style returned HTTP 200; truck history endpoint returned
successfully. Admin geofence sync succeeded for all 61 territories with no errors. Citizen GPS mutation
was rejected with 403. Browser checks confirmed guardian details, bin-report controls and no horizontal
overflow at a 390px viewport. No physical truck GPS or bin sensors were connected during this check.
