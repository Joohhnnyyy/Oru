# Oru web: landing page

A single-page, chapter-driven scroll story for **Oru**, a climate-habit game for India. It is an installable PWA. It is built in the team's frontend stack (Vite + React 18 + TypeScript + Tailwind + i18next) and prerendered to static HTML at build time, so first paint needs no JavaScript.

The chapters: Why · Day 1 · Guardians (flip cards) · Day 7 and Day 30 (growth timeline) · Real places (pixel map) · Impact · Not the end.

## Run, build, deploy

```bash
pnpm install                     # from the repo root
pnpm --filter web dev            # http://localhost:5173 (client-rendered in dev)
pnpm --filter web build          # typecheck → client build → SSR build → prerender + SW manifest
pnpm --filter web preview        # serve dist/ at http://localhost:4173
pnpm --filter web size           # gzip budget report for dist/
pnpm --filter web test           # vitest
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web icons          # re-rasterise public/icons/icon.svg into the PWA PNGs
```

Environment (all optional; see `.env.example`). Values are zod-validated at build time, and an invalid value fails the build:

| Var | Default | Used for |
|---|---|---|
| `VITE_PLAY_URL` | `/home` | "Play now" links |
| `VITE_SOURCE_URL` | `https://github.com/Joohhnnyyy/Oru` | Footer source link |
| `VITE_SITE_URL` | `https://oru.example.org` | Canonical, Open Graph, JSON-LD URLs |

### Deploy to S3 + CloudFront

1. `pnpm --filter web build`, then upload `apps/web/dist/` to the bucket (private, using CloudFront Origin Access Control).
2. Set Cache-Control per path:

| Path | Cache-Control |
|---|---|
| `/assets/*` (content-hashed) | `public, max-age=31536000, immutable` |
| `/index.html`, `/` | `public, max-age=0, must-revalidate` |
| `/sw.js` | `no-cache` (browsers must always re-check the worker) |
| `/manifest.webmanifest`, `/offline.html` | `public, max-age=3600` |
| `/icons/*` | `public, max-age=604800` |

   ```bash
   aws s3 sync dist/ s3://BUCKET/ --delete --exclude "index.html" --exclude "sw.js" \
     --cache-control "public, max-age=31536000, immutable"
   aws s3 cp dist/index.html s3://BUCKET/index.html --cache-control "public, max-age=0, must-revalidate"
   aws s3 cp dist/sw.js s3://BUCKET/sw.js --cache-control "no-cache"
   ```
   (Then re-copy `manifest.webmanifest`, `offline.html` and `icons/` with their shorter max-age.)
3. Set the CloudFront default root object to `index.html`. Turn on compression (gzip + Brotli). Add a response-headers policy with `X-Content-Type-Options: nosniff` and a CSP of `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'`. Inline styles are needed only for small React `style` props.
4. Invalidate `/index.html` and `/sw.js` after each deploy.

Everything stays inside the AWS free tier at hackathon traffic: about 120 KB per first visit and a few hundred KB of storage. The repo-root `amplify.yml` also builds this app on Amplify Hosting. If you use Amplify, add the SPA rewrite listed in `docs/03-WEB-CONTEXT.md` §8.

## How it works

- **Prerendering:** `scripts/prerender.mjs` renders `<LandingPage />` with `react-dom/server` into `dist/index.html`, and the client hydrates it. Without JS, the full English story still reads.
- **i18n:** `src/i18n/en.json` ships with the page. `hi.json` is a separate 4.8 KB chunk loaded when someone switches language. The switch updates every string, `<html lang>`, the title and the meta description without a reload, and remembers the choice in `localStorage`.
- **Motion:** CSS transitions plus one IntersectionObserver hook (`useInViewOnce`) and one rAF-throttled scroll listener for the timeline rail. Sections fade in once; plot tiles pop in once per stage; count-ups run once. With `prefers-reduced-motion: reduce`, all transitions are off, every section is visible, the rail is full, count-ups show their final values and flip cards swap instantly.
- **PWA:** `public/sw.js` precaches the shell, CSS, JS (including the Hindi chunk), icons and `offline.html`. The build fills in the precache list and cache version. Navigation is network-first: offline, `/` falls back to the cached shell and any other path to `offline.html`. The "Install app" buttons use `beforeinstallprompt` and stay hidden where it isn't supported (iOS Safari, Firefox).

## Performance budget (measured, gzip -9, production build)

| Item | Budget | Measured | Status |
|---|---|---|---|
| `index.html` (prerendered) | n/a | 15.4 KB | |
| CSS | n/a | 5.9 KB | |
| JS, first load | **≤ 30 KB** | **74.3 KB** | Over. See deviations. |
| **First load total (HTML + CSS + JS)** | **≤ 100 KB** | **95.6 KB** | OK |
| Hindi strings (lazy, on switch) | n/a | 4.8 KB | not in first load |
| `sw.js` | n/a | 0.8 KB | |
| Icons (PNG, largest) | < 20 KB each | 14.6 KB | OK |
| Video / audio / GIF / web fonts / third-party scripts | none | none | OK |
| External requests | own origin only | own origin only (verified in the network panel) | OK |

JS breakdown: react-dom 41.7 KB · i18next 13.6 KB · react-i18next 2.8 KB · react 1.7 KB · artwork 7.8 KB · app 7.5 KB · English strings 3.6 KB.

**Lighthouse 13.5 (mobile preset, local `vite preview`):** Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP 1.5 s, LCP 1.7 s, TBT 10 ms, CLS 0.

## Accessibility checklist (WCAG 2.2 AA)

- [x] Landmarks: `header`, two `nav`s (one shown per breakpoint), `main`, `footer`; skip link to `#main`.
- [x] One `h1`; chapters are `h2`, contents `h3`/`h4` in order.
- [x] Visible focus ring (3 px, primary colour) on every interactive element.
- [x] Touch targets ≥ 48 px: buttons, chapter pills, region list, footer link.
- [x] Flip cards are real `<button>`s with `aria-pressed`. Enter and Space work natively, and the hidden face is `aria-hidden` (tested).
- [x] Chapter menu: anchor links with `aria-current` on the chapter in view.
- [x] Map regions are `role="button"`, `tabindex="0"`, with `aria-pressed` and Enter/Space handling, plus a text-list alternative (tested). The detail panel is `aria-live="polite"`.
- [x] Every SVG is labelled (`role="img"` + `aria-label`) or hidden as decorative (tested).
- [x] Meaning never by colour alone: missions have names, map regions have names in the list, mood/stage changes have text.
- [x] Text is always ink/muted on light fills. Bright colours are fills only, with dark text on them in both themes.
- [x] `lang` on `<html>` updates on switch, and the language names carry their own `lang` attributes.
- [x] Reduced-motion mode verified in the browser (computed styles checked).
- [x] Count-up numbers: animated digits are `aria-hidden`; screen readers get the final value.
- [ ] Manual screen-reader pass (NVDA + TalkBack) still to do by a human.

## Assumptions

1. **The app name is "Oru"**, from the repo's CLAUDE.md. The headline uses option A, "grow small. spread wide."
2. **Framework:** you asked to keep the team's frontend framework, so this uses Vite + React 18 + TS + Tailwind + i18next instead of the brief's "vanilla JS, no framework". It lives in `apps/web` and will become the `/` route of the citizen app.
3. **Fonts:** the system stack, with `Noto Sans` / `Noto Sans Devanagari` listed first. Android ships both, so there's no font download.
4. **"Play now"** links to `/home`, the future citizen-app route (configurable). Until that app is deployed, the link leads nowhere useful.
5. **Guardian → mission links** are thematic choices: dolphin → water, sea turtle → waste, snow leopard → heat, bustard → energy, sparrow → heat, crane → water.
6. **The map is a coarse pixel cartogram**, not traced borders, and is labelled "not to scale and not an official map of India". Regions are game categories, not ecological zones. Cities are six approximate dots (Delhi, Mumbai, Kolkata, Hyderabad, Bengaluru, Chennai).
7. **Growth stage days (1, 3, 7, 14, 30)** are an example pace, and the page says so.
8. **Impact chapter:** the counted numbers are true facts about the product (4 missions, 6 guardians, 5 stages, 2 languages). Community totals show 0 with a "Starts at launch" badge, because no real data exists.
9. **Roadmap items** (pilot city, offline-first, more languages) are plausible next steps, not commitments.
10. **The example log** in Day 1 ("+3 seeds") is marked "Example only".

## Things a human must verify

- [ ] **Species facts.** Each fact in `src/i18n/en.json` and `hi.json` (marked TODO in `sections/Guardians.tsx`) needs checking against a conservation source (IUCN Red List, WII, ZSI): the Ganges dolphin as national aquatic animal (2009), olive ridley mass nesting in Odisha, snow leopard habitat, great Indian bustard power-line threat, World Sparrow Day (20 March), sarus crane as the tallest flying bird.
- [ ] **Hindi copy.** A native speaker should review all of `hi.json`, especially the headline ("छोटे से उगो। दूर तक फैलो।"), "गोडावण (सोन चिरैया)" and the tone.
- [ ] **Map depiction.** Indian rules on depicting the country's boundaries are strict. Check that the schematic silhouette and its "not an official map" note are acceptable for publication, or replace the map with a non-geographic region picker.
- [ ] **Name and trademark.** Check "Oru" for conflicts in India (app stores, trademark registry, domains). The team repo's `main` also uses "Oru" for an unrelated video-editor landing page.
- [ ] **Mission LiFE wording.** "JSON-LD aligned with Mission LiFE" is a product intention. Confirm the export format before launch, or soften the line.
- [ ] **`VITE_SITE_URL`.** Set the real domain; Open Graph and JSON-LD use it.
- [ ] **Art review.** The six guardians and the icon are original inline SVG drawn for this project. Check that they read clearly on a real low-end phone.

## Deviations from the brief (changelog)

| Brief | What shipped | Why |
|---|---|---|
| Vanilla ES modules, no framework | React 18 + TypeScript + Tailwind v4 + i18next, prerendered | You asked to keep the project's frontend framework. Prerendering keeps first paint JS-free. |
| First-load JS ≤ 30 KB | 74.3 KB gzip | React + react-dom (43 KB) and i18next (16 KB) are required by the team stack and on their own exceed 30 KB. The total first load (95.6 KB) is still under 100 KB, and Lighthouse Performance is 99. Meeting 30 KB would mean dropping React for this page (e.g. Preact or vanilla islands), which CLAUDE.md says needs sign-off. |
| Self-hosted font subset or system stack | System stack | Zero font bytes; Noto fonts are already on Android. |
| One large guardian SVG in the hero | The river dolphin, on a pixel meadow | As specified. CLAUDE.md's "Gilu" squirrel greeter wasn't used, because the brief's six guardians don't include a squirrel. |
| Zod-validated env in `config/env.ts` (CLAUDE.md) | Validation runs at build time (`env.schema.ts` in `vite.config.ts`); `config/env.ts` stays the only read site | Saves 5.2 KB of runtime JS for three constants that can't change at runtime. |
| Brand green `#1B8A5A` (CLAUDE.md) | Soft Meadow tokens from this brief (`--primary #14532D`) | The brief defines its own palette. The citizen app can keep `#1B8A5A`; reconcile before launch. |
| Separate chapter menu | A sticky pill nav (header) plus a chapter menu card after the hero, sharing one "current chapter" state | Covers both the sticky header nav and the chapter menu from the brief without duplicate logic. |
| Map regions link to guardians | Selecting a region fills a live panel with a "Meet the …" link to that guardian's card | Keeps one tap per region and gives a keyboard/text equivalent. |
