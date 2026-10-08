# Technology Stack

**Analysis Date:** 2026-10-08

## Languages

**Primary:**
- TypeScript ~6.0.2 - app logic and components in `butter-clone/src/App.tsx`, `butter-clone/src/main.tsx`, and the UI sections under `butter-clone/src/components/`

**Secondary:**
- CSS - Tailwind v4 theme tokens and global styles in `butter-clone/src/index.css`

## Runtime

**Environment:**
- Vite React SPA runtime for the landing page project in `butter-clone/`

**Package Manager:**
- pnpm - lockfile present as `butter-clone/pnpm-lock.yaml`
- Lockfile: present

## Frameworks

**Core:**
- React 19.2.8 - component rendering via `butter-clone/src/main.tsx` and `butter-clone/src/App.tsx`
- Vite 8.3.0 - dev server, bundling, and build pipeline via `butter-clone/vite.config.ts`

**Testing:**
- No configured test runner in `butter-clone/package.json`; linting is provided by `oxlint`

**Build/Dev:**
- Tailwind CSS v4.3.3 with `@tailwindcss/vite` - utility styling and theme tokens in `butter-clone/src/index.css`
- TypeScript ~6.0.2 - static typing via `butter-clone/tsconfig.json` and `butter-clone/tsconfig.app.json`
- oxlint 1.81.0 - lint command defined in `butter-clone/package.json`

## Key Dependencies

**Critical:**
- `gsap` 3.15.0 - scroll and motion animation system for the landing page
- `lenis` 1.3.26 - smooth scrolling, mounted from `butter-clone/src/hooks/useLenis.ts`
- `three` 0.186.1 - 3D scene primitives and rendering support
- `@react-three/fiber` 9.8.1 - React binding for Three.js rendering used in the 3D hero scene
- `@react-three/drei` 10.7.9 - helper components such as `Environment` for the hero asset setup
- `framer-motion` 14.0.0 - light motion/hover effects outside the main GSAP scroll system

**Infrastructure:**
- `@types/react` 19.2.18 and `@types/react-dom` 19.2.7 - TypeScript support for the React app
- `@types/three` 0.186.0 - Three.js typing support
- `@vitejs/plugin-react` 6.1.1 - React plugin wired into Vite

## Configuration

**Environment:**
- The app is a static browser front-end configured in `butter-clone/package.json` and `butter-clone/vite.config.ts`
- `@` is aliased to `butter-clone/src` in `butter-clone/vite.config.ts`

**Build:**
- `butter-clone/vite.config.ts` loads both React and Tailwind plugins
- `butter-clone/tsconfig.json`, `butter-clone/tsconfig.app.json`, and `butter-clone/tsconfig.node.json` define TS compile settings
- Global design tokens and reduced-motion rules are defined in `butter-clone/src/index.css`

## Platform Requirements

**Development:**
- Local frontend development with Vite (`pnpm dev`) and browser-based testing
- WebGL is assumed for the 3D hero; modern browser support is required

**Production:**
- Static hosting target via a Vite build (`pnpm build`), with app assets kept in `butter-clone/public/` per `SPEC.md`
- No server-side runtime, database, or API is required by the existing architecture

---

*Stack analysis: 2026-10-08*
