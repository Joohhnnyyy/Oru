# Butter Homepage

## Project Reference

**Core value:** Deliver a polished, responsive, motion-rich recreation of the Butter video editor marketing homepage that communicates its block-based creative workflow through the page itself.

**Current focus:** Complete the existing homepage in coherent, asset-backed vertical slices, prioritizing the first impression and the distinctive scroll, media, and carousel interactions.

## Project Context

- The application lives in `butter-clone/`; this project scaffold documents and plans that app without changing its source.
- The approved synthesized source is `SPEC.md` together with `migration-docs/layout.md`, `animations.md`, `assets.md`, and `design-tokens.md`. The corrected layout contains 15 blocks, including the intro overlay and the three sections added by SPEC §12.
- The repository already uses React 19, Vite 8, TypeScript, and Tailwind CSS 4. These installed versions are the codebase truth; do not downgrade to the earlier React 18 scaffold described in SPEC §3.
- The app already has the approved motion and 3D libraries in its dependency set: GSAP/ScrollTrigger, Lenis, Three.js, React Three Fiber/Drei, and Framer Motion. Do not add dependencies without explicit approval.
- Existing `butter-clone/public/` content includes local images and logos, 33 unique homepage video clips, seven keychain GLB models, and Draco decoder files. Reuse the checked-in assets where they match the migration inventory.
- The original `reference/` export, `reference/index.html`, and `reference/marketing-assets` are absent. Do not assume those source assets can be extracted or compare against an unavailable live export; document unavailable assets rather than inventing or substituting them.
- The keychain hero's physics approach remains an open decision. Rapier is not approved, and the roadmap does not select a fake spring/pendulum alternative.
- This is a learning/portfolio recreation, not publication-ready customer branding. Keep the source's placeholder-branding/replacement caveat visible; do not expand the milestone into a rebrand.

## Scope

**In scope:** the corrected 15-block homepage, responsive layout, existing local media, scroll and hover motion, feature and creator interactions, accessible motion/media fallbacks, and build/performance verification.

**Out of scope for this milestone:** acquiring or fabricating the missing reference export, adding unapproved packages, selecting the hero physics implementation, and replacing placeholder branding or client assets for publication.

## Working Conventions

- Work in one section or user-visible interaction at a time; complete static layout before its animation.
- Preserve already-working code. Use the existing design tokens and typed component patterns; avoid `any`.
- Use extracted timings/easings where documented. Treat unextracted or observed behavior as a visual tuning target, not a recovered exact specification.
- Support 375px, 768px, and 1440px layouts. Every motion feature must respect `prefers-reduced-motion`; video is muted, inline, initially not preloaded, and only played while visible.
- After each implementation task, run the development app and TypeScript/build checks, inspect browser console behavior, and report what to verify visually.
