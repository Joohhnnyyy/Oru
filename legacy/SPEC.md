# SPEC.md — Oru Landing Page

> Read this file at the start of every session. Update it when decisions change.

## 1. Goal
Rebuild the marketing homepage as a clean React + TypeScript project under the **Oru** brand identity, with smooth layout, interactive feel, and fluid animations. Inspired by Butter (butter.video) with all branding and package identity migrated to Oru.

## 2. Folder layout
```
oru-main/
├── reference/        ← unzipped original export. READ-ONLY. Never edit.
├── SPEC.md           ← this file
├── .planning/        ← GSD project planning & state tracking
└── oru/              ← the application (all work happens here)
```
- To view the original: open `reference/index.html` in a browser, or run `python3 server.py` inside `reference/` (serves on port 8080).
- `reference/index.html` is ~37 MB because videos and images are embedded as base64. **Do not open or paste it into the AI context.** Use screenshots of the original instead.
- Do **not** build from `reference/assets/cdn/**/_next/static/chunks/*.js`. They are minified and are not source code.

## 3. Stack
- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`), tokens in `@theme`
- GSAP + ScrollTrigger for scroll-linked animation
- Lenis for smooth scroll, synced to GSAP ticker
- three.js via `@react-three/fiber` + `@react-three/drei` for the 3D hero
- Framer Motion only for small enter/hover effects
- Package manager: pnpm

```bash
pnpm create vite butter-clone --template react-ts
pnpm add gsap lenis three @react-three/fiber @react-three/drei framer-motion
pnpm add -D tailwindcss @tailwindcss/vite
```

## 4. Design tokens (taken from the original CSS)
```css
@theme {
  --color-butter-white: #FAFAFA;
  --color-butter-off-white: #F7F7F7;
  --color-butter-black: #1E1E1E;
  --color-butter-true-black: #0F0F0F;
  --color-butter-charcoal: #3C3C3C;
  --color-butter-light-grey: #EDEDED;
  --color-butter-dark-grey: #E2E2E2;
  --color-butter-red: #FF3333;
  --color-butter-blue: #4DC5E5;
  --color-butter-green: #63AD45;
  --color-butter-yellow: #E9D352;
  --color-butter-pink: #F9ABFF;
}
```

**Fonts.** The original uses ABC Diatype (body) and Die Grotesk (headings). Both are paid. **Do not ship them.** Use free substitutes:
- Headings: Space Grotesk
- Body: Inter (or Geist)
- Mono accents: JetBrains Mono

## 5. Page structure (top to bottom)
Build as one scrolling page, one component per section in `src/sections/`.

| # | Component | Content / behaviour |
|---|---|---|
| 1 | `Navbar` | Links: Product, Blocks, Templates, Pricing, Blog. Right side: Login, "Try for free". Social icons (Instagram, YouTube, X) in a mobile menu. Sticky. |
| 2 | `Hero` | H1 "Engineered for Creativity". Subline "Butter, the first video editor you can build on." CTA "Get Started". City background image + 3D keychain (see section 7). |
| 3 | `LogoMarquee` | Label "Teams from top brands and agencies build with Butter". Infinite horizontal logo scroll. |
| 4 | `Statement` | Large paragraph: "Butter is the first video editor where creatives can build and remix custom design tools right on timeline." Each word fades in on scroll (scrubbed). |
| 5 | `BlocksShowcase` | Heading "There's a block for that". Sub: "Browse curated blocks for motion graphics, kinetic type, 3D, shader effects, and beyond." Label "Library / Text Blocks". Four cards: Inflate, Glow, Focus, Halftone. |
| 6 | `Customizable` | Heading "Infinitely customizable." Sub: "Make blocks your own with intuitive dials, sliders, prompts, and even with code." |
| 7 | `Toolkit` | Heading "Your new creative toolkit". Sub: "Customize and save your favorite blocks so your team never starts from scratch again." |
| 8 | `Features` | Heading "Your new all-in-one video editor." Four items (Import, Edit, Enhance, Ship), sticky section where scroll progress switches the active item and its video. Button "View All Features". |
| 9 | `ThreeWays` | Heading "Create in 3 ways". Tabs: Remix, Describe, Code. |
| 10 | `Templates` | Heading "Templates inspired by leading brands". Cards: Justified Studio, Dedcool, Kiel Dangler. Subhead "The best stories are built block by block." |
| 11 | `Footer` | Links, socials, legal. |

**Feature copy:**
- Import: "Drop in photos, videos, audio, and assets from anywhere, instantly."
- Edit: "Powerful timeline editing with speed controls, voiceovers, and built-in stock libraries."
- Enhance: "Layer animations, effects, and shaders to elevate every frame."
- Ship: "Collaborate in real time and export in up to 60fps, including Image, Video, GIF & ProRes."
- Remix: "Start from templates and pre-built blocks designed for real campaigns."

Also on the original: a "Skip to content" link and a "Explore features" / "Browse 1000s of butter blocks" dropdown panel under Product.

## 6. Assets
Copy from `reference/` into `butter-clone/public/`:

| From (in reference) | To (in public) | Used for |
|---|---|---|
| `marketing-assets/images/hero/city.jpg`, `hero_fallback.png` | `public/images/hero/` | Hero background and fallback |
| `marketing-assets/models/keychain/**/*.glb` | `public/models/keychain/` | 3D hero (key, carabiner, chain_link, b_tag, butter_tag, circle_tag, gothic_tag) |
| `marketing-assets/images/text-effects/*` (inflate.png, glow.png, focus.png, halftone.png, word_glow.png, inflate/*.png) | `public/images/text-effects/` | BlocksShowcase cards |
| `marketing-assets/images/statement/timeline.png` | `public/images/statement/` | Statement or features section |
| `assets/cdn/images.prismic.io/butter/*` | `public/logos/` | Logo marquee (**placeholders only**, see section 9) |
| `assets/cdn/www.gstatic.com/draco/versioned/decoders/1.5.5/*` | `public/draco/` | Draco decoder for the `.glb` files |

**Videos.** 49 mp4 clips (plus 2 webm) are embedded in `reference/index.html` as base64. Extract them with a script that finds `data:video/(mp4|webm);base64,` strings and writes each to `public/videos/clip_NN.mp4`. Then rename each by what it shows. Compress with ffmpeg (`-crf 28`).

## 7. Behaviour details

**Smooth scroll:** create one Lenis instance, drive it from `gsap.ticker`, call `ScrollTrigger.update` on Lenis scroll. Disable on `prefers-reduced-motion`.

**Videos:** `<video muted loop playsInline preload="none">`. Call `.play()` only when in view (IntersectionObserver), pause when out of view.

**Statement reveal:** split into word spans, start at ~20% opacity, scrub to 100% by scroll position.

**Headings:** staggered reveal of words or letters on enter.

**Logo marquee:** seamless infinite loop, pause on hover is optional.

**3D hero:**
- Load with `useGLTF.setDecoderPath('/draco/')`.
- Assemble key + carabiner + chain_link + butter_tag into one group.
- Add `<Environment preset="city" />`.
- Group follows the pointer (lerped) and reacts to scroll.
- Fallback: show `hero_fallback.png` on mobile, if WebGL fails, or with reduced motion.

**Animation timing:** exact durations and easings are **not extracted**. Treat them as `[observed, tune by eye]` against the original running side by side. Start with duration 0.8s and `power3.out`.

## 8. Rules for the AI agent
1. Never edit anything inside `reference/`.
2. Never paste or read `reference/index.html` in full. Ask me for a screenshot instead.
3. Work on **one section per task**. Static layout first, animation after.
4. After each task: run the dev server, check for TypeScript and console errors, and tell me what to look at in the browser.
5. Keep components small and typed. No `any`.
6. All colours and fonts come from the tokens in section 4. No hard-coded hex values in components.
7. Mobile-first. Test at 375px, 768px and 1440px.
8. Add `prefers-reduced-motion` handling to every animation.
9. Do not add dependencies beyond section 3 without asking.
10. I will commit to git after each working section. Do not rewrite files that already work unless I ask.

## 9. Before this is published (replace everything that isn't mine)
- [x] Brand name "Butter" → Oru
- [x] All headline and body copy updated to Oru branding
- [ ] Client logos (Netflix, Airbnb, SpaceX, etc.) → custom placeholders or licensed logos
- [ ] Keychain 3D models → custom models or procedural shapes
- [x] Fonts → free fonts only (Space Grotesk + Inter + JetBrains Mono)
- [ ] Template names (Justified Studio, Dedcool, Kiel Dangler) → custom examples
- [x] Footer note: "Design inspired by Butter"

## 10. Build order
1. Project setup, tokens, folder structure, copy assets
2. Navbar + Footer (static)
3. Hero (static: text + background image)
4. LogoMarquee
5. Statement
6. BlocksShowcase
7. Customizable + Toolkit
8. Features
9. ThreeWays
10. Templates
11. Lenis + GSAP animations
12. 3D keychain in the Hero
13. Responsive pass, performance (compress videos, WebP images), reduced motion
14. Replace branding (section 9), deploy

## 11. Done when
- [ ] All 11 sections present and visually close to the original at 1440px and 375px
- [ ] Smooth scroll and scroll reveals work
- [ ] 3D hero works, with a working fallback
- [ ] Lighthouse mobile performance ≥ 80
- [ ] No console errors, TypeScript passes (`pnpm build`)
- [ ] Section 9 checklist complete

## 12. Decisions & corrections (from extraction, Oct 2026)
- Real page has **15 blocks**, not 11: added Intro overlay, "Create more, faster", "Turn anything into everything", "Get the look" (see migration-docs/layout.md).
- Statement is a **fly-in of media blocks** (not a word fade). ThreeWays is an **accordion**. Gallery is a **draggable carousel**.
- `city.jpg` is the 3D **environment map**, not a visible background.
- Videos use `data:video/mp4;codecs=avc1;base64,` — SPEC §6 regex missed them. 51 files → 33 unique after dedupe.
- Keychain uses physics (Rapier) — pending decision: add `@react-three/rapier` or fake it with a spring/pendulum.
- Original root font-size is 62.5% (1rem = 10px). Easings: see design-tokens.md.
