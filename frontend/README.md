# Oru web

The production website and citizen/municipal app for **Oru**, a climate-habit game for India, with original 3D-rendered characters (the flower buddy and six guardians).
It is built in the team stack: Vite + React 18 + TypeScript + Tailwind v4 + i18next (English/Hindi) + Framer Motion. It is prerendered to static HTML at build time and is installable as a PWA.

The layout and motion follow the patterns of a large-brand corporate character site: an isometric plaza hero with a floating highlights card, a sticky white header, a scroll-revealed mission statement, a dark band with drifting character bubbles, big split cards with accent bars, and pill cards. All code, copy, characters and artwork are Oru's own. No third-party assets, text or code are used.

## Run, build, deploy

```bash
pnpm install                     # from the repo root
pnpm --filter web dev            # http://localhost:5173 (client-rendered in dev)
pnpm --filter web build          # typecheck → client build → SSR build → prerender + SW manifest
pnpm --filter web preview        # serve dist/ at http://localhost:4173
pnpm --filter web size           # gzip report for first-load code
pnpm --filter web test           # vitest
pnpm --filter web lint
pnpm --filter web typecheck
```

Environment (optional; see `.env.example`, validated with zod at build time): `VITE_PLAY_URL` (default `/home`), `VITE_SOURCE_URL`, `VITE_SITE_URL`.

To deploy, upload `dist/` to S3 + CloudFront, or use Amplify Hosting via the repo-root `amplify.yml`. Cache headers:

| Path | Cache-Control |
|---|---|
| `/assets/*` (hashed) | `public, max-age=31536000, immutable` |
| `/media/*`, `/icons/*` | `public, max-age=604800` (rename files when you replace them, or invalidate) |
| `/`, `/index.html` | `public, max-age=0, must-revalidate` |
| `/sw.js` | `no-cache` |

## Page structure

| # | Section | File | Motion |
|---|---|---|---|
| 0 | Intro loader (buddy bounce + logo) | `sections/Loader.tsx` | CSS; auto-hides without JS; skipped on repeat visits and for reduced motion |
| 1 | Plaza hero: wordmark badge, nav, headline, highlights carousel, "Scroll down" | `sections/Hero.tsx` | scroll zoom/sink, pointer parallax, staggered intro, auto-rotating card with pause/prev/next/close |
| 2 | Sticky white header (after the hero) | `sections/StickyHeader.tsx` | slides in; active-section highlight; mobile menu |
| 3 | Mission statement, four missions, two image cards | `sections/Mission.tsx` | words fill in as you scroll; cards rise in |
| 4 | Dark band "What is Oru?" with character bubbles | `sections/Band.tsx` | bubbles drift along a dotted line and bob |
| 5 | Split cards: Day 1 (video slot), Growth (stage stepper + pixel plot + sparrow waking), Places (pixel map of India + list) | `sections/SplitCards.tsx` | cards rise in; growth auto-plays once; tiles pop |
| 6 | Guardians: floating 3D cut-outs | `sections/Guardians.tsx` | spring bounce-in, pointer tilt, idle float, flip to the fact |
| 7 | Pill cards: Oru in numbers, What comes next | `sections/Pills.tsx` | panels expand in place; `#impact` / `#next` links open them |
| 8 | Closing art + footer | `sections/Footer.tsx` | buddy springs in |

## Pages

Every button opens its own page (React Router v6 data router, `src/app/routes.tsx`). Each public page is prerendered to static HTML at build time (`dist/<route>/index.html`, plus `dist/404.html`) with its own title and canonical URL.

| URL | Page |
|---|---|
| `/` | Home (hero, mission, band, split sections, guardians, pills) |
| `/how-it-works` | Day 1 steps, the four missions, why small acts |
| `/guardians` | All six guardians (flip cards) |
| `/guardians/:id` | One guardian: fact, mission, where it lives (map), habitat scene, the others |
| `/grow` | Stage picker and all five pixel-plot stages |
| `/places` | Map and region list, every region linked to its guardian |
| `/impact` | Honest numbers (product facts, community totals at zero) |
| `/roadmap` | What comes next |
| `/play` | What the game will let you do (opening soon), install |
| anything else | Not-found page |

Hosting note: Amplify serves `/grow` from `grow/index.html` automatically. On S3 + CloudFront, add a CloudFront Function (viewer request) that appends `/index.html` to extension-less paths, and set `404.html` as the custom error page. `vite preview` does the same through a small plugin in `vite.config.ts`.

Motion added in this pass: the hero menu hides behind the logo and fans out on hover or focus; letters roll on buttons and menu links; marker, scribble and shimmer effects on chosen words (`<m>`, `<u>`, `<g>` tags in the i18n strings, rendered by `<Rich>`); and a curtain with the little truck between pages.

## Replacing images and videos

Every slot is defined in **`src/content/media.ts`**:

- **Videos.** Put the file in `public/media/videos/` and set `video: '/media/videos/your-file.mp4'` on a slot: the three hero highlights (`HIGHLIGHTS`) and the Day 1 card (`SPLIT_MEDIA.day1`). Until then, each slot shows its poster with a "Video coming soon" tag. Videos play muted and looped only while on screen, and never for reduced-motion visitors.
- **Characters and scenes.** Replace the files in `public/media/characters/` (transparent WebP cut-outs) and `public/media/scenes/` (painted habitats and the plaza), keeping the names, or change the paths.
- **Regenerating art from new source images.** See `scripts/art/README.md`. It runs a local, free background-removal pipeline (`rembg`); no paid service is needed. Source art lives in `design/source/`.
- **The mascot's name** is a placeholder ("Oru buddy" / "Oru साथी") in the `buddy.name` key of both i18n files.

## Design tokens

Light chrome with pastel accents taken from the logo, defined in `src/styles/index.css`:

| Token | Value | Use |
|---|---|---|
| `--bg` / `--surface` / `--surface-2` | `#ffffff` / `#f1f4f9` / `#e7ecf5` | page, cards, active states |
| `--ink` / `--muted` | `#1d2330` / `#5a6375` | text (AA on white and surfaces) |
| `--band` | `#20242e` | dark band |
| `--primary` | `#0a6e9e` | links, focus ring |
| `--sky` `--pink` `--butter` `--mint` `--lilac` `--coral` | `#3ec5f5` `#ff8fbf` `#ffd64a` `#6eddb0` `#a98cf0` `#ff8a65` | fills and accents only |

Missions: waste = mint, heat = coral, energy = butter, water = sky. Headings use **Baloo 2** (self-hosted, Latin + Devanagari); body text uses the system Noto Sans stack.

## Earlier public-only measurements

These measurements predate the immersive layouts and account integration. They are not current performance results.

| Metric | Result |
|---|---|
| First-load code (HTML + CSS + JS, gzip) | 140 KB (budget 160 KB; relaxed for the image-led design) |
| Hero image | 73 KB (960 px, phones) / 201 KB (1770 px, desktop), chosen with `srcset` |
| Character cut-outs | 7–14 KB each (WebP) |
| Lighthouse desktop | Performance 99 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 0.8 s, CLS 0.001) |
| Lighthouse mobile | Performance 88 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 3.7 s) |
| Tests | 9 passing: i18n parity, alt text / svg labels, highlights carousel, pills, flip cards (keyboard), places (keyboard), growth stepper |

## Accessibility

- [x] Skip link, landmarks, one `h1`, ordered headings, visible focus ring.
- [x] Every image has `alt` (decorative ones empty); every SVG is labelled or hidden (tested).
- [x] Carousel: pause/play, prev/next, close; auto-advance stops for reduced motion.
- [x] Flip cards are buttons with `aria-pressed`, and the hidden face is `aria-hidden`. Map regions are keyboard buttons with a list alternative. Pills use `aria-expanded` / `aria-controls`.
- [x] The scroll-fill statement starts at a grey that still passes 3:1 for large text; screen readers get the full sentence.
- [x] `prefers-reduced-motion`: no loader, no CSS animation, and Framer Motion animations reduced (`MotionConfig reducedMotion="user"`).
- [ ] Manual NVDA / TalkBack pass still to do.

## Needs a human

- [ ] **Videos.** Send the real clips; the slots are listed above.
- [ ] **Mascot name.** Replace the "Oru buddy" placeholder.
- [ ] **® mark.** It was removed from the web wordmark: Indian law (Trade Marks Act s.107) forbids using ® unless the mark is registered. Restore it only if "Oru" is registered.
- [ ] **Species facts and Hindi copy.** Have someone verify them (TODO in `sections/Guardians.tsx`).
- [ ] **Map.** The simplified pixel map of India carries a "not an official map" note. Confirm that's acceptable, or swap it for a region picker.
- [ ] **Dark mode.** Removed for the light palette you asked for; it can be added back with tokens.
- [ ] **`framer-motion` is pinned to 13.4.4.** 14.x was too new for pnpm's minimum-release-age policy; upgrade when it ages in.

## Backend integration

See [the verified integration report](../docs/10-FRONTEND-BACKEND-INTEGRATION.md) for the current route coverage, deployed AWS checks and service gaps.

`frontend` is the production website. `apps/web` remains the prototype for reference. Amplify builds the `web` workspace and publishes `frontend/dist`.

Run `pnpm export-env --frontend-only` from the repository root to populate `frontend/.env.local` from `cdk-outputs.json`. Only public API/Cognito settings are needed in the browser: `VITE_API_URL`, `VITE_COGNITO_CLIENT_ID`, and optional `VITE_COGNITO_REGION` (defaults to `ap-south-1`). Never put AWS credentials in a `VITE_*` variable. Public pages can build without a backend; sign-in displays a configuration error when the connection is missing.

The existing AWS backend stays in `services/api` and `infra`; the root frontend now calls it directly using Cognito ID tokens. The default Play button opens `/home`, which requires sign-in. `/play` remains the game introduction and links into the dashboard.

| URL | Account page |
|---|---|
| `/signin` | Demo or email/password sign-in |
| `/home` | Citizen balance, XP, streak, and scan entry |
| `/scan` | Camera QR scan and geolocation verification |
| `/console` | Territory health and hotspots; ward administrators only |
| `/console/review` | Approve/reject photo submissions; ward administrators only |

Account URLs receive client-rendered HTML shells at build time so direct links work on static hosting. They are excluded from search indexing and offline caching. Sessions are held in memory; a full reload requires sign-in again. Camera/location access requires HTTPS or localhost.

### Additional account pages

The root website now exposes all account features available in the existing API.

| URL | Feature |
|---|---|
| `/onboarding` | Language and location setup for authenticated accounts without a profile |
| `/tasks` | Daily, weekly, monthly task progress and segregation habit check-in |
| `/rewards` | Wallet, transaction history, coupon catalog, confirmed redemption and redeemed codes |
| `/leaderboard` | Citywide, local citizen and territory health rankings |
| `/community` | Hotspots, truck locations and geolocated issue reporting |
| `/proof` | JPEG upload to the signed S3 URL and submission verification status |
| `/profile` | Profile details and persisted language preference |
| `/collector` | Collector-only rotating QR and explicit truck location updates |
| `/console/qr-sources` | Administrator-only source listing and registration |

Console requests use the paths defined in `infra/lib/api-stack.ts`: `/v1/admin/territory-overview`, `/v1/admin/review-queue`, `/v1/admin/review-queue/resolve`, and `/v1/admin/qr-sources`.

Photo proof accepts JPEG files up to 10 MB. Status checks stop after two minutes or on a terminal/review status; use Refresh status to check again. The submission ID is preserved in the query string. API failures are displayed on-page; shared data pages have a retry action.
