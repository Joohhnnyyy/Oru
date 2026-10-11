# SaafSafari — Web App Context (Citizen Web + Municipal Console)

The web app has two faces in one codebase:
1. **Citizen web** — same features as mobile except camera-heavy flows (QR scan works via webcam/phone browser as fallback; photo proofs via file input). Used by judges who won't install an APK.
2. **Municipal Console** (`/console`, roles `ward_admin`, `merchant`) — the part that makes this a city tool, not just a game.

Hosted on **AWS Amplify Hosting** (GitHub-connected, `main` → prod, PR previews). API base URL, Cognito IDs and CDN URL come from CDK outputs as `VITE_*` env vars in Amplify.

---

## 1. Stack
| Concern | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Routing | React Router v6 (data routers) |
| Server state | TanStack Query (retry off for 4xx, 30 s staleTime for territories) |
| Client state | Zustand (session, UI prefs) |
| Styling | Tailwind CSS + tokens from `packages/ui-tokens`; Radix UI primitives; lucide icons |
| Auth | `aws-amplify` v6 Auth module only (Cognito email OTP + Google hosted UI) |
| Maps | MapLibre GL JS + Amazon Location map style (via `@aws/amazon-location-utilities-auth-helper` with API key or Identity Pool) |
| Hex grid | `h3-js` (cell boundaries, neighbours) — GeoJSON from CloudFront is primary |
| Charts | Recharts (console only) |
| QR | `@zxing/browser` (scan via webcam), `qrcode` (render admin printables) |
| i18n | i18next, `en` + `hi` JSON bundles; Noto Sans + Noto Sans Devanagari |
| Forms/validation | react-hook-form + zod schemas from `packages/shared` |
| Animations | Framer Motion (credit pop, mascot mood transitions) — keep under 300 ms |
| Testing | Vitest + Testing Library; Playwright smoke test for the demo path |

## 2. Folder structure
```
apps/web/
├── index.html
├── public/
│   └── mascots/                     # fallback; prod sprites from CloudFront
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── router.tsx               # route tree, role guards
│   │   ├── providers.tsx            # QueryClient, i18n, auth listener, theme
│   │   └── layouts/{CitizenLayout,ConsoleLayout,AuthLayout}.tsx
│   ├── config/env.ts                # zod-validated import.meta.env
│   ├── lib/
│   │   ├── api.ts                   # fetch wrapper: JWT header, Idempotency-Key, error → typed ApiError
│   │   ├── auth.ts                  # Amplify Auth configure + helpers
│   │   ├── map.ts                   # MapLibre + Amazon Location style transform
│   │   ├── h3.ts
│   │   └── format.ts                # ₹, GC, IST dates, relative time
│   ├── i18n/{en.json,hi.json,index.ts}
│   ├── hooks/                       # useMe, useTasks, useTerritories, useWallet, useLeaderboard, useLiveTrucks
│   ├── components/
│   │   ├── map/{TerritoryMap,TerritoryLayer,TruckLayer,HotspotLayer,MapLegend}.tsx
│   │   ├── mascot/{Mascot,MoodBadge,HealthRing}.tsx
│   │   ├── tasks/{TaskCard,TaskList,TaskProgress,PeriodTabs}.tsx
│   │   ├── credits/{CreditPop,BreakdownSheet}.tsx   # shows base × weight × multipliers
│   │   ├── scan/{WebQrScanner,ScanResult}.tsx
│   │   ├── proof/{ProofUploader,BeforeAfterUploader,SubmissionStatus}.tsx
│   │   ├── wallet/{BalanceCard,LedgerList}.tsx
│   │   ├── coupons/{CouponGrid,RedeemDialog}.tsx
│   │   ├── leaderboard/{LeaderboardTable,ScopeSwitcher}.tsx
│   │   ├── console/{KpiCards,HealthTrendChart,HotspotHeatmap,ReviewCard,QrSourceForm,PrintableQrSheet,WardReport}.tsx
│   │   └── ui/                      # Button, Card, Sheet, Tabs, Toast, Skeleton, EmptyState
│   ├── pages/
│   │   ├── landing/LandingPage.tsx
│   │   ├── auth/{SignIn,VerifyOtp}.tsx
│   │   ├── onboarding/{Language,Location,HomeReveal}.tsx
│   │   ├── citizen/{Home,MapPage,TerritoryDetail,Tasks,Scan,Submit,Wallet,Coupons,Leaderboards,Profile}.tsx
│   │   └── console/{Overview,Territories,ReviewQueue,QrSources,Bounties,Hotspots,Reports,Merchants}.tsx
│   └── styles/index.css
├── amplify.yml
├── tailwind.config.ts
└── vite.config.ts
```

## 3. Routes
| Path | Who | Purpose |
|---|---|---|
| `/` | public | Landing: problem, how it works, live city map (read-only), "Open app" / APK download |
| `/signin`, `/verify` | public | Email OTP / Google |
| `/onboarding/*` | new users | Language → location → **home territory reveal** (mascot animation) |
| `/home` | citizen | Mascot card, today's 3 tasks, streak, balance, nearest truck ETA |
| `/map` | citizen | Full territory map, filters (my tasks, bounties, drop points, trucks) |
| `/t/:h3` | citizen | Territory detail: mood history, top users, bounties, hotspots |
| `/tasks` | citizen | Daily / Weekly / Monthly tabs + community goal bar |
| `/scan` | citizen | Webcam QR scanner (fallback for desktop/laptop demos) |
| `/submit/:taskId` | citizen | Photo proof upload + status polling |
| `/wallet`, `/coupons`, `/leaderboards`, `/profile` | citizen | — |
| `/console` | ward_admin | KPI overview for their ward |
| `/console/territories` | ward_admin | Table + map of health, mood, 14-day trend |
| `/console/review` | ward_admin | Review queue (approve/reject with keyboard J/K/A/R) |
| `/console/qr` | ward_admin | Register sources, drop pin, set radius, print QR sheet (A4, 6 per page, with source name + Hindi instructions) |
| `/console/hotspots` | ward_admin | Heatmap (MapLibre heatmap layer) + validate → create bounty |
| `/console/reports` | ward_admin | Date-range ward report, CSV export |
| `/console/merchants` | merchant/admin | Coupon inventory upload (CSV) |

Role guard reads `cognito:groups` from the ID token; the API enforces it again (UI guard is convenience only).

## 4. Key screens — behaviour spec

### Home
- Top: mascot (animal × mood sprite), territory name, health ring (0–100), "+X today".
- Streak flame with day count; at risk after 20:00 IST if no action today → amber banner.
- Today's 3 tasks as cards: icon, title, GC reward (shows *expected* GC including current multipliers), verification icon (QR/camera/doc), CTA.
- "Truck near you" chip if a tracker device is within 1 km.

### Territory map
- Base: Amazon Location map style (light; dark variant for dark mode).
- Fill layer from `territories.geojson` (CloudFront): fill colour = animal colour, opacity = 0.25 + health/200; outline thicker for home territory.
- Symbol layer: mascot icon at cell centroid (zoom ≥ 11), grey-tinted if Sick.
- Overlays: drop points (QR sources by type), bounties (pulsing), trucks (live, polled 10 s), hotspots (console only by default).
- Tapping a cell → bottom sheet with mood, health, explorer bonus % for that cell relative to the user's home ("+25% Explorer").

### Credit result (after scan / approval)
- `CreditPop` animation, then `BreakdownSheet` explaining the formula in plain language: "Base 50 · Collector QR ×1.2 · 9-day streak ×1.2 · Explorer ×1.15 · Territory needs help ×1.3 · New territory +30 = **138 GC**". This transparency is a usability point — show it in the video.

### Review queue (console)
- Card: before/after images side by side, task rubric, Rekognition labels, Bedrock verdict + reason + confidence, map pin, user's trust stats (approval rate).
- Actions: Approve / Reject (reason dropdown) → POST `/admin/review/:id`.

### Ward overview (console)
- KPIs: verified actions (7 d), active citizens, segregation scans, e-waste drops, hotspots open/resolved, avg health.
- Charts: actions by type per day, health trend per territory, collector leaderboard (informal recyclers).

## 5. Design system
- Palette: animal colours from `05-GAME-DESIGN.md` §7 for territories only; UI chrome uses neutral + one brand green `#1B8A5A`, accent saffron `#F59E0B` for credits.
- Type: Noto Sans / Noto Sans Devanagari; 16 px base, 14 px minimum.
- Mascots: flat illustrated style, 4 moods each, 256 px PNG/WebP sprites on CloudFront. Keep consistent silhouette per animal. Start with 6 animals for the demo city (Dolphin, Tortoise, Camel, Black Kite, Macaque, Palm Squirrel); add others later.
- Accessibility: WCAG AA contrast, all icons labelled, never use colour alone for mood (icon + text label too), reduced-motion respected.
- Low-end devices: lazy-load console routes, map only on map pages, images ≤ 150 KB, Lighthouse mobile ≥ 85 on `/home`.

## 6. API usage rules
- All calls through `lib/api.ts`; adds `Authorization: Bearer <idToken|accessToken>` and `Idempotency-Key: crypto.randomUUID()` for POSTs.
- Map `ApiError.code` → localized toasts: `COOLDOWN_ACTIVE` ("You already scanned here — try again in 3 h"), `OUT_OF_RANGE`, `TOKEN_EXPIRED`, `DAILY_CAP_REACHED`, `INSUFFICIENT_BALANCE`.
- Poll `GET /submissions/:id` every 3 s for up to 60 s after upload, then show "Under review" state.

## 7. Env vars (`apps/web/.env.example`)
```
VITE_API_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_DOMAIN=
VITE_IDENTITY_POOL_ID=
VITE_LOCATION_MAP_NAME=
VITE_LOCATION_API_KEY=          # Amazon Location API key restricted to map tiles + referrer
VITE_AWS_REGION=ap-south-1
VITE_ASSET_CDN_URL=
```

## 8. amplify.yml
```yaml
version: 1
applications:
  - appRoot: apps/web
    frontend:
      phases:
        preBuild:
          commands:
            - corepack enable
            - pnpm install --frozen-lockfile
        build:
          commands:
            - pnpm --filter web build
      artifacts:
        baseDirectory: dist
        files: ['**/*']
      cache:
        paths: ['node_modules/**/*']
```
Add SPA rewrite in Amplify console: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff2?|ttf|map|json|webp)$)([^.]+$)/>` → `/index.html` (200).

## 9. Done criteria for the demo
- Judge can open the Amplify URL, sign in with Google, see the map with mascots, scan a printed QR with laptop webcam, and watch credits + health change.
- Console login (seeded admin) shows a non-empty review queue and heatmap.
