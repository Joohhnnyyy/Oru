# Oru — Frontend CLAUDE.md (apps/web)

You are helping build the **web frontend only**: the citizen web app and the municipal console (`/console`). Backend, AWS infra and the mobile app are owned by other people. Do not create or edit Lambdas, CDK, DynamoDB code, or `apps/mobile`. If something needs a backend change, write it down as an "API request" for me instead of building it.

**What the product is:** a gamified, territory-based civic app. Citizens do verified waste actions (QR scans, AI-checked photo proofs) and earn Green Credits. Each H3 hex territory has an animal mascot whose mood (Sick / Recovering / Thriving / Legendary) follows the neighbourhood's health. The console turns the data into ward-level action.

**Pitch line for copy:** a verification layer for the informal waste chain of custody. Every household handover to a truck, kabadiwala or e-waste point becomes a geo-verified record.

## Read first
- `docs/03-WEB-CONTEXT.md` — your main spec (routes, screens, stack, folder structure)
- `docs/05-GAME-DESIGN.md` — credits, tasks, moods, animal colours (for UI numbers and copy)
- `docs/02-BACKEND-CONTEXT.md` section 4 only — the API contract you code against
Everything else is background. If the docs and code disagree, tell me; do not silently diverge.

## Stack (do not swap without asking)
Vite + React 18 + TypeScript (strict) · React Router v6 (data routers) · TanStack Query · Zustand · Tailwind CSS + Radix UI + lucide-react · `aws-amplify` v6 (Auth module only) · MapLibre GL JS · `h3-js` · Recharts (console only) · `@zxing/browser` (webcam QR) · `qrcode` · i18next (`en`, `hi`) · react-hook-form + zod · Framer Motion · Vitest + Testing Library · Playwright.

## Folder structure (apps/web/src)
```
app/        router.tsx, providers.tsx, layouts/{Citizen,Console,Auth}Layout.tsx
config/     env.ts            zod-validated import.meta.env
lib/        api.ts, auth.ts, map.ts, h3.ts, format.ts
i18n/       en.json, hi.json, index.ts
hooks/      useMe, useTasks, useTerritories, useWallet, useLeaderboard, useLiveTrucks
components/ map/ mascot/ tasks/ credits/ scan/ proof/ wallet/ coupons/ leaderboard/ console/ ui/
pages/      landing/ auth/ onboarding/ citizen/ console/
mocks/      MSW handlers + fixtures (see "Working without the backend")
styles/     index.css
```

## Commands
```
pnpm install
pnpm --filter web dev          # http://localhost:5173
pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test         # vitest
pnpm --filter web exec playwright test
```
Before saying a task is done: typecheck passes, lint passes, relevant tests pass, and for UI work you have looked at it (below).

## Working without the backend
The API may not be deployed yet. Build against the contract in `docs/02` section 4 using **MSW** (Mock Service Worker) handlers in `src/mocks/`, switched on by `VITE_USE_MOCKS=true`. Mock realistic data: ~12 territories across 6 animals and all 4 moods, a user with tasks, a ledger, coupons, a review queue, hotspots, and a few moving trucks. Keep the typed API client identical for mocks and the real API, so switching is just an env var. If a shared types package (`packages/shared`) exists, import from it; if not, define types in `src/lib/types.ts` and mark them `// TODO: move to packages/shared`.

## Rules
**Code**
- TypeScript strict, no `any`. Components small and typed; prefer composition over big files.
- All HTTP goes through `lib/api.ts`: attaches `Authorization: Bearer`, adds `Idempotency-Key: crypto.randomUUID()` to POSTs, returns typed `ApiError { code, message }`. No raw `fetch` in components.
- Server state in TanStack Query (retry off for 4xx, `staleTime` 30 s for territories). Client/UI state in Zustand. Do not mix.
- Never trust the UI for authorization. Role guards read `cognito:groups` for convenience only.
- Env vars come only from `config/env.ts` (zod-validated). Never hard-code URLs, IDs or keys. Keep `.env.example` current.
- Do not copy game rules into components. If `packages/game-rules` exists, import it for the expected-credit preview; otherwise isolate any placeholder in one file with a TODO.
- Map `ApiError.code` to localized toasts: `COOLDOWN_ACTIVE`, `OUT_OF_RANGE`, `TOKEN_EXPIRED`, `DAILY_CAP_REACHED`, `INSUFFICIENT_BALANCE`.

**UI/UX**
- Every user-visible string goes through i18next with `en` and `hi` keys. No hard-coded text.
- Mobile-first. Test at 390 px and 1280 px. No horizontal scroll.
- Accessibility: WCAG AA contrast, labelled icons, visible focus, keyboard-operable, never colour alone for mood (icon + text label too), respect `prefers-reduced-motion`. Base 16 px, minimum 14 px.
- Performance: lazy-load all `/console` routes and the map; images <= 150 KB; animations < 300 ms; aim Lighthouse mobile >= 85 on `/home`.
- Always build loading (skeleton), empty and error states. Never leave a blank screen.
- Show the credit breakdown ("Base 50 · Collector QR x1.2 · Streak x1.2 ...= 138 GC") after every award. This transparency is a judged usability point.

**Design system**
- Brand green `#1B8A5A`, credits accent saffron `#F59E0B`, neutral chrome. Animal colours appear only on territories (hex fills, mascot badges); take them from `packages/ui-tokens` or `docs/05` section 7.
- Fonts: Noto Sans + Noto Sans Devanagari. Define colours/spacing as Tailwind theme tokens, not magic values.
- Look distinctive and intentional, not like a default template: pick a clear visual direction, a real type scale, consistent radii/shadows, and purposeful motion. Use the `frontend-design` skill when building or restyling pages.
- Brand guide character: **Gilu**, an original Indian Palm Squirrel (three pale back stripes, S-curved tail, green scarf, saffron coin). Use as landing greeter, onboarding guide, Saaf Mitra assistant face, loading/empty states and credit-pop. Territory animals are separate mascots (4 moods each, 256 px sprites). Never draw existing third-party characters.

## Build priority (frontend)
1. App shell: router with role guards, providers, layouts, i18n, env, `api.ts`, MSW mocks.
2. Auth screens (Amplify email OTP + Google) and onboarding with the **home territory reveal**.
3. Citizen core: Home (mascot, health ring, 3 tasks, streak), Territory map (hex fills + mascot icons + truck/drop-point overlays), Tasks, Scan (webcam QR) + credit result, Wallet, Coupons.
4. Landing page (problem, how it works, read-only live map, CTA) — judges see this first, make it excellent.
5. Console: overview KPIs, review queue (J/K/A/R keys), QR source registry + printable A4 sheet, hotspot heatmap, ward report with CSV export.
6. Photo proof upload + status polling, leaderboards, Saaf Mitra chat (P2).
**Cut rule:** if the scan -> credit -> mascot-change -> coupon flow is not working end to end on the real deployed API by end of today, stop polishing extras and fix that flow.

## Working agreement
- Plan first for the app shell, routing/auth, and the map. Small UI changes: just do them.
- One feature at a time, small diffs, commit after each working step.
- **UI verification loop:** run `pnpm --filter web dev`, open it with Playwright, screenshot at 390 px and 1280 px, fix what looks off, then report. State what you checked.
- Keep a `docs/API-REQUESTS.md` of anything you need from the backend (fields, error codes, endpoints) so I can pass it on.
- Deploy target is AWS Amplify Hosting: keep `amplify.yml` working and the SPA rewrite documented. Build must pass with `pnpm --filter web build`.
- No fake claims in copy (no "tonnes of CO2 saved"). Fictional merchants and seed data only.
- When done, reply briefly: what changed, what you verified, what is still broken or mocked.

## Definition of done (web)
- A judge opens the Amplify URL, signs in with Google, sees the map with mascots, scans a printed QR with the laptop webcam, and watches credits and territory health change, with the breakdown shown.
- Console login shows a non-empty review queue and hotspot heatmap.
- Works in Hindi and English, at phone and desktop widths, with keyboard only, and on a slow connection (skeletons, no layout jump).
