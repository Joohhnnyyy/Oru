# Codebase Concerns

**Analysis Date:** 2026-10-08

## Tech Debt

**Brand and migration compliance drift:**
- Issue: The app still ships Butter branding and external Butter product URLs in navigation and CTAs instead of the client-specific placeholders required by SPEC §9.
- Files: `src/components/header/DesktopNavigation.tsx`, `src/components/header/HeaderActions.tsx`, `src/components/header/MobileNavigation.tsx`, `src/components/Navbar.tsx`, `src/sections/HeroSection/components/HeroContent.tsx`
- Impact: This is a direct migration blocker; it keeps the clone tied to the original product and makes the app non-compliant with the stated branding replacement goal.
- Fix approach: Replace brand text, links, and logo assets with local placeholders or client-owned assets before release; keep all references local to the project.

**Hero implementation is still a 2D placeholder instead of the specified 3D scene:**
- Issue: The hero renders a static image and the animation layer never mounts the GLTF/keychain scene described in SPEC §7 and `migration-docs/animations.md`.
- Files: `src/sections/Hero.tsx`, `src/sections/HeroSection/components/HeroMedia.tsx`, `src/sections/HeroSection/components/HeroContent.tsx`, `src/hooks/useHomeMotion.ts`
- Impact: The page does not match the original interaction model, and the project misses a core requirement from the migration brief.
- Fix approach: Replace the placeholder image with a real `@react-three/fiber` keychain scene or clearly gate the 3D content behind a proper fallback path that matches the spec.

**Section construction is duplicated and fragmented across component folders:**
- Issue: The project uses both `src/sections/*` and nested `src/sections/.../components/*` patterns, with repeated sections like `Hero`, `Features`, `Templates`, and `Toolkit` split across multiple files.
- Files: `src/sections`, `src/components/layout/MainContent.tsx`
- Impact: The codebase is harder to reason about, harder to modify safely, and more likely to drift from section-level tasks as the project grows.
- Fix approach: Consolidate shared render structures and keep each section in a single owned file unless the subcomponents are truly reused.

## Known Bugs

**Hero fallback path is effectively dead code:**
- Symptoms: `HeroMedia` supports `variant="fallback"`, but `Hero` always renders the default variant and never toggles to the fallback based on mobile, WebGL failure, or reduced-motion conditions.
- Files: `src/sections/Hero.tsx`, `src/sections/HeroSection/components/HeroMedia.tsx`
- Trigger: Rendering the page on low-power or reduced-motion devices does not switch to the fallback image path.
- Workaround: None; the fallback logic is not wired into the current render flow.

**The asset strategy is not fully aligned with the migration brief:**
- Symptoms: The app references many embedded assets under `public/images/embedded` and `public/videos` without a clear extraction/renaming pipeline or runtime loading strategy for large media blocks.
- Files: `src/components/LazyVideo.tsx`, `src/sections/Features.tsx`, `src/sections/ThreeWays.tsx`, `src/sections/Templates.tsx`, `public/videos`
- Trigger: The page loads all video assets in a single marketing page, even though the animation brief calls for viewport-based play/pause triggers.
- Workaround: Heavy media remains reachable but unoptimized under the current bundle strategy.

**The site still contains original Butter copy and external references in multiple places:**
- Symptoms: CTA labels, SEO copy, and product links still advertise Butter-specific services even though the project brief specifically says the clone should be renamed before publication.
- Files: `src/sections/HeroSection/components/HeroContent.tsx`, `src/components/header/HeaderActions.tsx`, `src/components/header/MobileNavigation.tsx`, `src/components/LogoTrack.tsx`
- Trigger: The landing page is rendered as-is from the original brand.
- Workaround: None; this is content-level drift rather than a technical runtime bug.

## Security Considerations

**External product links are embedded directly in the marketing surface:**
- Risk: The page links out to `https://app.butter.video/*` and other third-party sites without a local trust boundary or content review for the final branded version.
- Files: `src/components/header/HeaderActions.tsx`, `src/components/header/MobileNavigation.tsx`, `src/components/header/DesktopNavigation.tsx`
- Current mitigation: No custom redirect layer or validation logic; links are plain anchors.
- Recommendations: Replace external links with project-owned destinations or local anchors before launch; audit every outbound link and asset URL as part of release prep.

**Asset URLs are treated as trusted public file paths without an allowlist:**
- Risk: The app assumes every path under `public/` is safe to render, which is fine for a static site but fragile if later content becomes user-controlled.
- Files: `public`, `src/sections/*`, `src/components/LazyVideo.tsx`
- Current mitigation: The app serves static assets only from the Vite public directory.
- Recommendations: Keep the asset directory controlled and avoid user-supplied paths in future content pipelines.

## Performance Bottlenecks

**Large media payload and autoplay-heavy page load:**
- Problem: The landing page loads multiple high-resolution images and many MP4 files, with `fetchPriority="high"` on the hero image and autoplay-only video sections on first paint.
- Files: `src/sections/HeroSection/components/HeroMedia.tsx`, `src/components/LazyVideo.tsx`, `public/videos`
- Cause: There are 33+ MP4 assets in `public/videos`, many of which are looped previews and are not prefiltered by viewport or importance.
- Improvement path: Add progressive loading, per-section image placeholders, and stricter intersection-based start conditions for all background or preview media.

**Global GSAP animation graph is broad and may be expensive on lower-end devices:**
- Problem: `useHomeMotion` adds scroll and pointer-driven animations to every section in the main content, not just a few targeted elements.
- Files: `src/hooks/useHomeMotion.ts`, `src/lib/gsap.ts`, `src/lib/lenis.ts`
- Cause: It registers per-section `ScrollTrigger` animations, pointer tilt, and repeating GSAP tweens, all on one page.
- Improvement path: Reduce the number of active animated elements, disable certain section animations below a motion budget, and gate heavy animation passes behind `prefers-reduced-motion` or a reduced-performance check.

**The marquee and repeated DOM work are simple but still run continuously:**
- Problem: The rotating logo track uses a CSS transform animation with a loop and repeated image elements, while other sections are also in motion.
- Files: `src/components/LogoTrack.tsx`, `src/index.css`
- Cause: The loop has constant motion and no explicit pause/cancel strategy for low-power devices or background tabs.
- Improvement path: Use `prefers-reduced-motion` and respect `document.visibilityState` to pause non-essential animation loops when the tab is inactive.

## Fragile Areas

**Animation orchestration is highly coupled to DOM selectors:**
- Files: `src/hooks/useHomeMotion.ts`, `src/lib/gsap.ts`
- Why fragile: The effect relies on `main.querySelectorAll(':scope > section:not(#hero)')` and a single set of element selectors to determine what animates. This is easy to break when a new section is inserted or when markup structure changes.
- Safe modification: Centralize section animation metadata in a declarative structure and keep selectors local to each section rather than scanning the whole page.
- Test coverage: Very low; no animation test harness exists.

**Video playback behavior depends on intersection timing and browser policies:**
- Files: `src/hooks/useInView.ts`, `src/components/LazyVideo.tsx`
- Why fragile: `IntersectionObserver` callbacks can race with video autoplay restrictions, mobile browser throttling, and reduced-motion settings, causing incomplete or delayed playback loops.
- Safe modification: Add explicit error handling, `video.muted = true`, and central fallbacks when autoplay is denied.
- Test coverage: No browser-level regression tests exist.

**Asset loading is spread across static file names instead of a cataloged system:**
- Files: `public/images`, `public/videos`, `src/sections/*`
- Why fragile: The app depends on many hard-coded asset strings, which makes refactors and quality checks brittle and can break when file names change.
- Safe modification: Move asset references into a shared manifest or `const` map and validate them at build time.
- Test coverage: None.

## Scaling Limits

**The current structure is tuned for one page, not a multi-page or content-managed front end:**
- Current capacity: One static marketing page with a small set of components and no CMS or dynamic data layer.
- Limit: It is not designed for large content variations, localization, or rapidly changing brand assets.
- Scaling path: Factor section data into typed config objects and add a content schema if the marketing site grows.

**Asset size will continue to grow as more motion preview files are added:**
- Current capacity: `public/videos` already contains dozens of MP4 loops and the page eagerly exposes them.
- Limit: Browsers on mobile may hit poor performance, memory pressure, or battery drain.
- Scaling path: Use a CDN, lazy-loaded thumbnails, and a curated subset of videos for the in-view experience.

## Dependencies at Risk

**Animation stack is heavy and version-sensitive:**
- Package: `gsap`, `lenis`, `@react-three/fiber`, `three`, `framer-motion`
- Risk: The project depends on animation and 3D libraries whose interaction patterns are tightly coupled to the current page behavior. The migration docs specifically call out a 3D hero and note that a Rapier-based physics scene would be needed to match the original behavior, which is not in the current dependency list.
- Impact: A future spec-compliance upgrade could require large dependency changes and more runtime GPU work.
- Migration plan: Keep the current stack minimal, constrain motion to a few strong primitives, and only add new dependencies when the required behavior is validated.

**The app includes a larger dependency footprint than the current feature set needs:**
- Package: `framer-motion`, `@react-three/fiber`, `@react-three/drei`, `three`, `lenis`
- Risk: Several libraries are installed even though the code does not use all of them in a way that is critical to core behavior.
- Impact: Increased bundle size, more compatibility risk, and a slower onboarding curve for future maintenance.
- Migration plan: Audit actual usage and keep only the libraries that are directly required by the shipped sections.

## Missing Critical Features

**3D hero and required fallback path are not implemented:**
- Problem: The brief requires a keychain-like 3D hero, a Draco decoder setup, and a fallback for mobile or reduced-motion users.
- Blocks: `SPEC.md`, `migration-docs/animations.md`, `migration-docs/assets.md`, `src/sections/Hero.tsx`, `src/sections/HeroSection/components/HeroMedia.tsx`

**Video and image extraction pipeline is not traceable in the app repo:**
- Problem: The project expects the original asset extraction workflow (`reference/` → `public/`) but there is no checked-in automation to enforce or document it.
- Blocks: `SPEC.md`, `migration-docs/assets.md`, `public`

**There is no automated verification layer for correct rendering and motion behavior:**
- Problem: The page has no visual or interaction tests, so regressions in section layout, accessibility, or animation timing can ship without detection.
- Blocks: `package.json`, `src`

## Test Coverage Gaps

**No test framework or test files are configured:**
- What's not tested: Render correctness, animation timing, asset loading behavior, navigation semantics, and reduced-motion fallbacks.
- Files: `package.json`, `src`
- Risk: Layout and interaction regressions are easy to miss, especially for a motion-heavy landing page.
- Priority: High

**Accessibility and reduced-motion safety are not covered by automation:**
- What's not tested: Focus states, skip-link behavior, reduced-motion media suppression, and mobile navigation states.
- Files: `src/components/header/MobileNavigation.tsx`, `src/components/Header.tsx`, `src/hooks/useReducedMotion.ts`, `src/hooks/useInView.ts`
- Risk: The page could ship with invalid keyboard or motion accessibility behavior even though the broad implementation is present.
- Priority: High

---

*Concerns audit: 2026-10-08*