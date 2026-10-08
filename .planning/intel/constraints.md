## Page structure and content
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/layout.md
- type: schema
- content: Build a single scrolling marketing homepage in React, with responsive composition. SPEC.md §5 lists 11 sections; its §12 and migration-docs/layout.md describe the corrected 15-block layout, adding an intro overlay, Create more, faster, Turn anything into everything, and Get the look. The linked layout inventory also corrects Statement to media-block motion, ThreeWays to an accordion, Gallery to a draggable carousel, and clarifies the city image as an environment map. Preserve the section copy and example names found in the source; no replacement copy or branding is supplied here.

## Frontend platform and dependency boundary
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md
- type: protocol
- content: The specified stack is Vite, React 18, strict TypeScript, Tailwind CSS v4, GSAP with ScrollTrigger, Lenis, three.js with @react-three/fiber and @react-three/drei, Framer Motion for small enter/hover effects, and pnpm. Do not add dependencies beyond the listed stack without asking. SPEC.md §12 records that the physics-based keychain would need @react-three/rapier, which is not listed; the implementation choice remains pending rather than authorized.

## Visual system and typography
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/design-tokens.md
- type: schema
- content: Use the color tokens in SPEC.md §4; migration-docs/design-tokens.md confirms them and records the additional --butter-light token (#EBEBEB). The original paid fonts are not to be shipped; the specified free substitutes are Space Grotesk for headings, Inter or Geist for body, and JetBrains Mono for mono accents. The migration notes also record root font sizing, breakpoints, and extracted easing values. Exact large heading font sizes are not supplied and are to be tuned against the original.

## Animation and interaction behavior
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/animations.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/layout.md
- type: protocol
- content: Scope includes GSAP/ScrollTrigger reveals and scroll-linked motion, Lenis synchronized with GSAP, reduced-motion handling, viewport-based video playback, the ticker loop, statement media-block movement, pinned Toolkit and Features sections, accordion height animation, draggable looping gallery, and pinned horizontal Get the look motion. animations.md supplies extracted timings and behaviors for several effects, while identifying some behavior as observed/tune by eye (including Glow/Halftone card effects and gallery behavior); it says Lenis option values were not found. Use its extracted values where present and retain the identified tune-by-eye gaps rather than treating them as exact. The 3D hero uses Rapier physics per the migration notes, but adding @react-three/rapier requires approval under SPEC.md §8.9; SPEC.md §12 leaves physics versus a spring/pendulum fake undecided.

## Local media and asset handling
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/assets.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/layout.md
- type: schema
- content: The intended asset work is to copy the specified images, keychain models, Draco decoder files, and logo assets into butter-clone/public; extract embedded video data, deduplicate and rename clips, and compress them as described in the sources. assets.md records 51 embedded video files resolving to 33 unique mp4 files, identifies the WebM alternates and gallery loop copies, and lists the section-specific media and model inventory. The city image is an environment map, not a visible hero background. Third-party logos and Butter marks are placeholders pending replacement before publication; the listed paid fonts are not copied. Current repository check: the referenced reference/ directory, reference/index.html, and reference/marketing-assets path do not exist, so the source media needed for copy/extraction is unavailable in this checkout.

## Accessibility, responsiveness, and publishing constraints
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md; C:/Users/Asmi/OneDrive/Desktop/oru/migration-docs/assets.md
- type: nfr
- content: The page is mobile-first and is to be tested at 375px, 768px, and 1440px. Every animation must account for prefers-reduced-motion; the 3D hero has a mobile/WebGL/reduced-motion fallback; videos are muted, looping, inline, initially not preloaded, and played only while in view. Before publication, replace Butter branding and copy, client logos, keychain models (or remove the scene), and template examples as the source checklist specifies. The completion checks in SPEC.md §11 include 1440px and 375px visual closeness, working smooth scroll/reveals and 3D fallback, mobile Lighthouse performance of at least 80, no console errors, and a passing pnpm build.

## Work and verification conventions
- source: C:/Users/Asmi/OneDrive/Desktop/oru/SPEC.md
- type: protocol
- content: Do not edit reference/ or read its large index.html in full. Work on one section per task, static layout before animation, and after each task run the dev server, check TypeScript and console errors, and report what to inspect in the browser. Keep components small and typed with no any; use tokens instead of hard-coded component hex colors; do not rewrite working files without request. SPEC.md gives the build order and states that animation values not extracted from the original should be tuned by eye.
