# Phase 1: First Impression & Hero - Context

**Gathered:** 2026-10-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the first-screen experience: responsive navigation and the hero's specified copy, action, local 3D keychain presentation, and reliable static fallback. Use the checked-in assets and dependencies; do not depend on the missing reference export or remote media. The wider page storytelling and interactions remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Hero content and composition
- Restore the specified “Engineered for Creativity” headline and supporting line: “Butter, the first video editor you can build on.”
- Use a centered hero heading and supporting copy, following the corrected layout inventory rather than the current split text-and-image treatment.
- Use the “Get Started” action and link it to the in-page product/features section instead of relying on an external signup destination.
- Build the visual around the available local keychain model and provide a local static image fallback.

### Hero 3D and asset strategy
- Implement lightweight spring/pendulum-style keychain sway using the dependencies already installed; do not add Rapier or another package.
- Use the checked-in local keychain PNG as the static fallback; do not use the city environment panorama as visible hero artwork.
- Load 3D after first paint on capable desktop devices. Use the static image on mobile, when reduced motion is preferred, or when WebGL is unavailable or fails.
- Use checked-in `public/` media only. Missing original-export files get an intentional local fallback or placeholder; do not fetch or invent assets.

### Navigation behavior
- Use the documented fixed header and retain the skip-to-content link.
- Open the Product menu on pointer hover and keyboard focus, with a click/tap path for touch devices.
- Keep the current mobile menu button; make the expanded menu keyboard-operable and dismissible.
- Keep existing Butter outbound links clearly as learning-clone placeholders until a later rebrand; use local anchors when no destination exists.

### Claude's Discretion
- Choose component boundaries and responsive details consistent with the existing typed React/Tailwind patterns.
- Tune unextracted easing and 3D presentation by eye while preserving reduced-motion behavior and cleaning up effects.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing hero content and media components are in `butter-clone/src/sections/HeroSection/components/HeroContent.tsx` and `HeroMedia.tsx`.
- Local keychain artwork is available at `butter-clone/public/images/embedded/keychain-with-butter-branded-charms-57a4.png`.
- Existing keychain GLB models and Draco decoders are under `butter-clone/public/models/keychain/` and `butter-clone/public/draco/`.
- Existing 3D dependencies include Three.js, React Three Fiber, and Drei; no Rapier package is installed.
- Navigation components are in `butter-clone/src/components/header/`; shared reduced-motion behavior is in `butter-clone/src/hooks/useReducedMotion.ts`.

### Established Patterns
- The app uses React 19, strict TypeScript, Vite 8, Tailwind CSS 4, root-absolute URLs for `public/`, and `pnpm build` for validation.
- GSAP and custom eases are initialized in `butter-clone/src/lib/gsap.ts`; Lenis setup lives in `butter-clone/src/lib/lenis.ts`.
- Hero and section motion currently initializes in `butter-clone/src/hooks/useHomeMotion.ts`; effects must respect reduced motion and clean up on unmount.
- The original `reference/` export is absent; the codebase and local asset inventory are the available implementation sources.

### Integration Points
- The hero is composed in `butter-clone/src/sections/Hero.tsx` and mounted in `butter-clone/src/components/layout/MainContent.tsx`.
- Header and primary navigation are rendered by `butter-clone/src/components/Header.tsx` and its components under `butter-clone/src/components/header/`.
- 3D scene integration belongs in the existing `butter-clone/src/three/KeychainScene.tsx` placeholder and the hero media composition.

</code_context>

<specifics>
## Specific Ideas

- Follow the corrected 15-block layout and use the hero wording and behavior from `SPEC.md` and `migration-docs/layout.md`.
- Preserve the local keychain as the hero visual; `city.jpg` is an environment map, not the visible hero background.
- Keep asset-loading and motion behavior local, responsive, and usable without animation.
</specifics>

<deferred>
## Deferred Ideas

- Statement-to-timeline media motion, Blocks card interactions, logo ticker, and wider scroll choreography belong to Phase 2.
- Toolkit pinning, feature progression, and creation-method accordion media belong to Phase 3.
- Template/get-the-look carousels, remaining feature blocks, intro overlay, footer completion, and full-page QA belong to Phase 4.
- Publication rebranding and replacement of client logos/models are outside this learning-clone milestone.

</deferred>
