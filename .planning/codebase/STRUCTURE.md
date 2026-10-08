# Codebase Structure

**Analysis Date:** 2026-10-08

## Directory Layout

```text
butter-clone/
├── public/                              # Static assets served by Vite
│   ├── images/
│   ├── logos/
│   ├── models/
│   └── videos/
├── src/                                 # React + TypeScript app source
│   ├── components/                      # Shared UI wrappers and layout chrome
│   │   ├── footer/
│   │   ├── header/
│   │   ├── layout/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LazyVideo.tsx
│   │   ├── LogoTrack.tsx
│   │   ├── Marquee.tsx
│   │   ├── Navbar.tsx
│   │   └── SplitText.tsx
│   ├── hooks/                           # Motion, viewport, and scroll hooks
│   │   ├── useHomeMotion.ts
│   │   ├── useInView.ts
│   │   ├── useLenis.ts
│   │   └── useReducedMotion.ts
│   ├── lib/                             # GSAP and Lenis wrappers
│   │   ├── gsap.ts
│   │   └── lenis.ts
│   ├── sections/                        # Landing-page section components
│   │   ├── BrandLogoMarquee/
│   │   ├── ContentProductionSection/
│   │   ├── CreativeEditorSection/
│   │   ├── CreativeToolkitSection/
│   │   ├── CustomizationSection/
│   │   ├── FeaturesSection/
│   │   ├── GetTheLookSection/
│   │   ├── HeroSection/
│   │   ├── ProductHighlightsSection/
│   │   ├── TemplatesSection/
│   │   ├── BlocksShowcase.tsx
│   │   ├── Customizable.tsx
│   │   ├── Features.tsx
│   │   ├── Hero.tsx
│   │   ├── LogoMarquee.tsx
│   │   ├── Statement.tsx
│   │   ├── Templates.tsx
│   │   ├── ThreeWays.tsx
│   │   └── Toolkit.tsx
│   ├── App.tsx                          # App bootstrap and Lenis mount
│   ├── index.css                        # Tailwind theme tokens + shared utility CSS
│   ├── main.tsx                         # React render root entry
│   └── vite-env.d.ts
├── .gitignore
├── .oxlintrc.json
├── CHANGELOG.md
├── CODER.md
├── DATABASE.md
├── README.md
├── TASKS.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── node_modules/                        # Installed dependencies; not source-owned
```

## Directory Purposes

**`src/components/`:**
- Purpose: Shared UI shell and reusable page chrome.
- Contains: Header/footer wrappers, navigation controls, media wrappers, and generic helpers.
- Key files: `src/components/Navbar.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/LogoTrack.tsx`

**`src/sections/`:**
- Purpose: Long-form marketing page sections grouped by feature area.
- Contains: Full-page blocks such as hero, logo marquee, product features, and template spots.
- Key files: `src/sections/Hero.tsx`, `src/sections/Features.tsx`, `src/sections/Statement.tsx`, `src/sections/ThreeWays.tsx`

**`src/hooks/`:**
- Purpose: Encapsulate client-side behavior and browser API lifecycle management.
- Contains: Smooth scroll, motion setup, viewport detection, and reduced-motion checks.
- Key files: `src/hooks/useLenis.ts`, `src/hooks/useHomeMotion.ts`, `src/hooks/useReducedMotion.ts`

**`src/lib/`:**
- Purpose: Thin adapters around third-party libraries, especially GSAP and Lenis.
- Contains: Bootstrapping and configuration wrappers.
- Key files: `src/lib/gsap.ts`, `src/lib/lenis.ts`

**`public/`:**
- Purpose: Static asset delivery for images, logos, videos, and 3D files.
- Contains: Browser-served media referenced by the sections.
- Key files: `public/images/`, `public/videos/`, `public/models/`, `public/logos/`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root mount.
- `src/App.tsx`: App-level hook wiring.
- `src/components/layout/MainContent.tsx`: Page assembly.

**Configuration:**
- `vite.config.ts`: Vite configuration.
- `package.json`: Package manifest and scripts.
- `src/index.css`: Tailwind theme tokens and CSS that supports the app.

**Core Logic:**
- `src/hooks/useHomeMotion.ts`: page motion orchestration.
- `src/hooks/useLenis.ts`: smooth-scroll lifecycle.
- `src/lib/gsap.ts`: GSAP registration and setup.

**Testing:**
- Not detected in the current project layout; no `*.test.*` or `vitest/jest` configuration was found in the root tree.

## Naming Conventions

**Files:**
- React components use PascalCase, for example `Hero.tsx`, `Navbar.tsx`, `Footer.tsx`.
- Hook files use the `useX.ts` naming convention, for example `useLenis.ts` and `useHomeMotion.ts`.
- Utility wrappers and library configs use descriptive lowercase paths, for example `src/lib/gsap.ts`.

**Directories:**
- Feature-specific sections are grouped by area name, for example `HeroSection/`, `FeaturesSection/`, and `ContentProductionSection/`.
- Shared UI is grouped by role, for example `layout/`, `header/`, and `footer/`.

## Where to Add New Code

**New Feature/Section:**
- Primary code: `src/sections/`
- Subcomponents: `src/sections/<SectionName>/components/`
- Example: `src/sections/FeaturesSection/components/FeatureCard` pattern already used in the codebase.

**New Reusable UI:**
- Primary code: `src/components/`
- Shared layout wrappers: `src/components/layout/`
- Example: shared chrome and layout wrappers are kept out of feature sections.

**New Motion Logic:**
- Primary code: `src/hooks/`
- GSAP setup wrappers: `src/lib/`
- Example: all page animation is routed through `useHomeMotion`, `useLenis`, and `src/lib/gsap.ts`.

**Utilities / helpers:**
- Primary code: `src/lib/`
- Example: cross-section helper logic should be centralized here rather than repeated directly in section files.

## Special Directories

**`public/`:**
- Purpose: Static asset delivery for logos, videos, images, and 3D models.
- Generated: No.
- Committed: Yes.

**`src/sections/<Name>/`:**
- Purpose: Section-specific component groupings with nested component trees.
- Generated: No.
- Committed: Yes.

**`src/components/layout/`:**
- Purpose: Top-level page composition wrappers; not feature-specific.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-10-08*
