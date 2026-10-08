<!-- refreshed: 2026-10-08 -->
# Architecture

**Analysis Date:** 2026-10-08

## System Overview

```text
┌───────────────────────────────────────────────────────────────────────┐
│                        React app entry / shell                        │
│ `src/main.tsx`                                                        │
├───────────────────────────────────────────────────────────────────────┤
│ `src/App.tsx`                                                        │
│ Mounts smooth-scroll hook and renders the page shell                 │
├──────────────────┬──────────────────┬────────────────────────────────┤
│ `src/components` │ `src/sections`   │ `src/hooks`                    │
│ Shared layout    │ Page sections   │ Motion + viewport logic        │
│ `Header.tsx`     │ `Hero.tsx`       │ `useHomeMotion.ts`             │
│ `Navbar.tsx`     │ `Statement.tsx`  │ `useLenis.ts`                 │
│ `Footer.tsx`     │ `Features.tsx`   │ `useReducedMotion.ts`         │
│ `layout/*`      │ `ThreeWays.tsx`  │ `useInView.ts`                │
└────────┬─────────┴────────┬─────────┴──────────┬─────────────────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│ `src/lib`                                                             │
│ GSAP and Lenis adapters: `lib/gsap.ts`, `lib/lenis.ts`               │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Static assets / browser media                                         │
│ `public/` and `src/assets/`                                           │
│ Images, GLB, videos, logos, and embedded background resources        │
└───────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Boots the app, runs smooth scrolling, renders the page shell | `src/App.tsx` |
| `PageShell` | Root layout wrapper around the main page content | `src/components/layout/PageShell.tsx` |
| `MainContent` | Composes the landing page: header, sections, footer, and home motion | `src/components/layout/MainContent.tsx` |
| `Header` | Provides the skip link and wraps the navigation chrome | `src/components/Header.tsx` |
| `Navbar` | Sticky header controls, desktop/mobile navigation, menu state | `src/components/Navbar.tsx` |
| `Hero` | Intro section and main visual stage | `src/sections/Hero.tsx` |
| `LogoMarquee` | Rotating brand marquee section | `src/sections/LogoMarquee.tsx` |
| `Statement` | Editorial intro with stacked media and copy | `src/sections/Statement.tsx` |
| `BlocksShowcase` | Block library cards and section layout | `src/sections/BlocksShowcase.tsx` |
| `Customizable` | Customization narrative and editor mockup section | `src/sections/Customizable.tsx` |
| `Toolkit` | Creative toolkit section | `src/sections/Toolkit.tsx` |
| `Features` | Production flow overview and feature cards | `src/sections/Features.tsx` |
| `ThreeWays` | Creation-mode accordion with accessible expanded panels | `src/sections/ThreeWays.tsx` |
| `Templates` | Template gallery / CTA grid | `src/sections/Templates.tsx` |
| `Footer` | Site footer columns and legal metadata | `src/components/Footer.tsx` |
| `useHomeMotion` | Applies section entrance and parallax-like motion with GSAP | `src/hooks/useHomeMotion.ts` |
| `useLenis` | Starts a single Lenis instance when reduced motion is not enabled | `src/hooks/useLenis.ts` |

## Pattern Overview

**Overall:** Single-page marketing site with a composition-first component tree and hook-driven animation.

**Key Characteristics:**
- Page content is segmented into standalone section components under `src/sections/`.
- Shared UI chrome lives under `src/components/` and is reused by layout wrappers.
- Animation and scroll behavior are centralized in `src/hooks/` and `src/lib/` rather than inside every section.
- Styling is driven by Tailwind theme tokens defined in `src/index.css` to keep colors, typography, and motion settings consistent.
- The app is client-rendered with minimal local state; the only notable stateful UI is navigation and accordion expansion.

## Layers

**Application shell:**
- Purpose: Start the React tree and mount page-level logic.
- Location: `src/App.tsx`, `src/main.tsx`
- Contains: Top-level bootstrap, global CSS import, and smooth-scroll startup.
- Depends on: React, Vite, CSS, `useLenis` hook.
- Used by: Browser runtime only.

**Page composition layer:**
- Purpose: Assemble the long-form landing page in a predictable order.
- Location: `src/components/layout/`, `src/sections/`
- Contains: Header, main sections, footer, and section-level layout wrappers.
- Depends on: `src/hooks/` for motion and `src/components/*` for shared UI.
- Used by: `MainContent` and layout wrappers.

**Behavior layer:**
- Purpose: Encapsulate scroll-driven motion, viewport detection, and reduced-motion guards.
- Location: `src/hooks/`, `src/lib/`
- Contains: GSAP setup, Lenis setup, viewport/scroll observers, and animation defaults.
- Depends on: browser APIs and the React component tree.
- Used by: page sections and app shell.

**Asset layer:**
- Purpose: Hold static images, videos, and 3D model references that are exposed via `public/`.
- Location: `public/`, `src/assets/`
- Contains: Background imagery, branded logos, media cards, and embedded scenes.
- Depends on: browser asset loading; not part of TypeScript runtime.
- Used by: Hero, statement, feature sections, and marquee components.

## Data Flow

### Primary Request Path

1. `src/main.tsx` creates the React root and renders `<App />` (`src/main.tsx`).
2. `src/App.tsx` calls `useLenis()` and returns `PageShell` (`src/App.tsx`).
3. `src/components/layout/MainContent.tsx` composes `Header`, each landing-page section, and `Footer` (`src/components/layout/MainContent.tsx`).
4. `src/hooks/useHomeMotion.ts` queries `main` and section elements, then registers GSAP / ScrollTrigger animation effects (`src/hooks/useHomeMotion.ts`).
5. The browser paints each section while `Lenis` and GSAP drive smooth scrolling and reveal animations (`src/lib/lenis.ts`, `src/lib/gsap.ts`).

### Navigation + Interaction Flow

1. `src/components/Navbar.tsx` stores `menuOpen` in local React state.
2. Desktop and mobile navigation are rendered conditionally from that state.
3. `src/sections/ThreeWays.tsx` stores `activeMethod` in local React state to control the accordion expansion.
4. The UI updates without a global store or API layer, matching the static marketing-page architecture.

**State Management:**
- Local component state is used for menu toggles and accordion behavior.
- Motion state is managed in GSAP and ScrollTrigger rather than React state.
- No persistent app store or server-side state is present.

## Key Abstractions

**`useLenis`:**
- Purpose: Mount a single smooth-scroll instance while respecting reduced motion.
- Examples: `src/hooks/useLenis.ts`
- Pattern: Hook-based browser lifecycle management with early return guard.

**`useHomeMotion`:**
- Purpose: Centralize entrance and parallax-like animation logic for the landing page.
- Examples: `src/hooks/useHomeMotion.ts`
- Pattern: GSAP context + DOM queries + ScrollTrigger registration inside a `useEffect`.

**Section components:**
- Purpose: Present specific marketing blocks as independent, self-contained units.
- Examples: `src/sections/Hero.tsx`, `src/sections/Features.tsx`, `src/sections/ThreeWays.tsx`
- Pattern: Composition over a shared layout grid and tokenized styling.

**Theme tokens:**
- Purpose: Define the visual vocabulary for the page.
- Examples: `src/index.css`
- Pattern: Tailwind `@theme` variables for colors, fonts, and radii.

## Entry Points

**Application bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser load via Vite/React.
- Responsibilities: Create root, import global CSS, and mount the app.

**App shell boot:**
- Location: `src/App.tsx`
- Triggers: Root render.
- Responsibilities: Attach the Lenis hook and render `PageShell`.

**Page composition:**
- Location: `src/components/layout/MainContent.tsx`
- Triggers: App render.
- Responsibilities: Compose the full marketing-page sequence.

## Architectural Constraints

- **Threading:** Single-threaded browser UI; animation tasks are scheduled on the main thread through GSAP and CSS transforms.
- **Global state:** No centralized global store; state is local to the component that owns it (`src/components/Navbar.tsx`, `src/sections/ThreeWays.tsx`).
- **Circular imports:** No circular import pattern detected in the current structure; component dependencies are mostly one-way from layout to sections to hooks.
- **Reduced motion:** `prefers-reduced-motion` is checked explicitly in `src/hooks/useReducedMotion.ts` and applied broadly to simplify motion behavior.
- **Static-site orientation:** The architecture assumes a single long marketing page instead of route-driven app navigation.

## Anti-Patterns

### Overly broad sections

**What happens:** Several top-level files in `src/sections/` hold a large amount of layout and media composition logic, such as `src/sections/Features.tsx` and `src/sections/Hero.tsx`.
**Why it's wrong:** This increases coupling between structure, styling, and animation and makes isolated changes more fragile.
**Do this instead:** Keep page-level composition in the section file but move repeated sub-markup into dedicated files under `src/sections/*/components/` and keep animation logic in hooks.

### Implicit animation coupling to DOM structure

**What happens:** `src/hooks/useHomeMotion.ts` queries `main` and section DOM nodes directly to attach GSAP behavior.
**Why it's wrong:** The animation layer depends on CSS selectors and markup assumptions; refactors to structure may silently break motion.
**Do this instead:** Prefer stable data attributes or props for target selectors and keep section-specific animation concerns closer to those sections.

## Error Handling

**Strategy:** This app does not implement a formal error boundary or global exception layer. Recovery is handled by defensive DOM queries and reduced-motion fallbacks.

**Patterns:**
- Guard conditions for missing DOM nodes (`if (!main || reducedMotion) return` in `src/hooks/useHomeMotion.ts`).
- Optional chaining and null-safe selectors before GSAP registration.
- Accessibility-first fallbacks such as the skip link and reduced-motion handling in `src/index.css`.

## Cross-Cutting Concerns

**Logging:** No application logger is configured; console logging is not part of the active pattern.
**Validation:** No client-side form validation or data validation layer is present because the app is a static marketing site.
**Authentication:** Not applicable; the project is not a user-authenticated app.

---

*Architecture analysis: 2026-10-08*
