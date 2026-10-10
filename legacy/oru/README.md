# Oru Frontend Application

The client application for **Oru**, a high-fidelity video editor landing page built with React 19, Vite 8, TypeScript, Tailwind CSS v4, Three.js, GSAP, and Lenis.

---

## 🚀 Development Scripts

Run the following commands inside this directory (`oru/`):

| Command | Purpose |
|---|---|
| `pnpm run dev` | Starts local Vite development server with HMR on `http://localhost:5173` |
| `pnpm run build` | Compiles TypeScript (`tsc -b`) and builds production bundle to `dist/` |
| `pnpm run lint` | Runs fast Oxlint static analysis on all source files |
| `pnpm run preview` | Serves the generated production bundle locally |

---

## 📂 Source Code Structure

```text
src/
├── assets/                 # App assets (icons, fallback images)
├── components/             # Reusable UI components
│   ├── header/             # DesktopNavigation, MobileNavigation, ProductDropdown, HeaderActions
│   ├── footer/             # FooterBrand, FooterColumn, FooterCopyright, FooterLinkColumns
│   ├── layout/             # MainContent, PageShell
│   ├── Footer.tsx          # Master footer with giant Oru wordmark
│   ├── Header.tsx          # Site header wrapper
│   ├── IntroOverlay.tsx    # "Experience Oru" initial transition overlay
│   ├── LazyVideo.tsx       # IntersectionObserver video with reduced-motion support
│   ├── LogoTrack.tsx       # Infinite ticker row of partner logos
│   └── Navbar.tsx          # Floating pill navbar
├── hooks/                  # Custom React hooks
│   ├── useHomeMotion.ts    # GSAP scroll reveals & entrance orchestrator
│   ├── useInView.ts        # Intersection-based lazy triggers
│   ├── useLenis.ts         # Lenis smooth-scroll lifecycle hook
│   └── useReducedMotion.ts # Media query hook for accessibility
├── lib/                    # Library instances and singletons
│   ├── gsap.ts             # GSAP core with ScrollTrigger registration
│   └── lenis.ts            # Lenis instance synced to GSAP ticker
├── sections/               # 15 distinct marketing timeline sections
│   ├── ContentProductionSection/
│   ├── CreativeEditorSection/
│   ├── CreativeToolkitSection/
│   ├── CustomizationSection/
│   ├── FeaturesSection/
│   ├── GetTheLookSection/
│   ├── HeroSection/
│   ├── ProductHighlightsSection/
│   ├── TemplatesSection/
│   ├── BlocksShowcase.tsx
│   ├── Customizable.tsx
│   ├── Features.tsx
│   ├── Hero.tsx
│   ├── LogoMarquee.tsx
│   ├── Statement.tsx
│   ├── ThreeWays.tsx
│   └── Toolkit.tsx
├── three/                  # 3D Canvas & WebGL physics rig
│   └── KeychainScene.tsx   # React Three Fiber canvas with spring-damper physics
├── App.tsx                 # Root component
├── index.css               # Tailwind CSS v4 design tokens and easing curves
└── main.tsx                # Application DOM entry point
```

---

## 🎨 Theme Tokens

Tailwind CSS v4 tokens are declared under `@theme` in [`src/index.css`](file:///Users/anshjohnson/Oru-main/oru/src/index.css):

- Color tokens: `oru-white`, `oru-off-white`, `oru-black`, `oru-true-black`, `oru-charcoal`, `oru-light-grey`, `oru-dark-grey`, `oru-blue`, `oru-green`, `oru-yellow`, `oru-pink`.
- Fonts: Space Grotesk (`font-heading`), Inter (`font-body`), JetBrains Mono (`font-mono`).
- Easing curves: `--ease-in`, `--ease-out`, `--ease-in-out`.
