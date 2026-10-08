# Roadmap: Butter Homepage

## Phases

- [x] **Phase 1: First Impression & Hero** - Complete the responsive entry experience using existing navigation, hero, and local media assets.
- [ ] **Phase 2: Narrative & Scroll Motion** - Make the brand proof and creative-story sections cohesive, animated, and grounded in the local asset inventory.
- [ ] **Phase 3: Product Workflow Interactions** - Deliver the pinned toolkit/features stories and working creation-method previews.
- [ ] **Phase 4: Discovery & End-to-End Finish** - Complete the inspiration-to-footer journey and verify responsive, accessible, performant behavior across the full page.

## Phase Details

### Phase 1: First Impression & Hero
**Goal**: Visitors can enter the homepage through a coherent responsive header and hero, and see the intended first-screen assets without broken or remote-media dependencies.
**Depends on**: Nothing (first phase)
**Requirements**: FRAME-01, HERO-01, MEDIA-01
**Open decision**: The keychain physics approach remains undecided. Neither Rapier nor a spring/pendulum substitute is authorized by this roadmap.
**Success Criteria** (what must be TRUE):
  1. A keyboard user can use the skip link, navigate the primary menu and Product dropdown, and reach an operable mobile navigation.
  2. The hero presents the specified headline, supporting copy, and Get Started action with the local fallback available when 3D is unsuitable or unavailable.
  3. Matching checked-in images, logos, videos, models, and decoder assets display without broken media; unavailable original-export items use an intentional fallback rather than a broken or remote image.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Narrative & Scroll Motion
**Goal**: Visitors understand the creative-block proposition through asset-backed brand proof and narrative sections whose scroll motion follows the corrected layout.
**Depends on**: Phase 1
**Requirements**: TICK-01, STORY-01, STORY-02, STORY-03, MOTION-01
**Success Criteria** (what must be TRUE):
  1. Visitors see the local brand logos move in a seamless ticker; the ticker can be paused or made static for reduced-motion preferences.
  2. Scrolling through the statement section moves its media blocks between the inline text and timeline composition.
  3. The four Blocks showcase cards expose their corresponding local visuals and documented hover behaviors; behavior not extracted from source is tuned by eye rather than claimed exact.
  4. The customizable-editor story presents its local video and dial/slider previews at desktop and mobile widths.
  5. Scroll-triggered reveals stay synchronized with smooth scrolling; documented timing/easing values are reflected where available, and unextracted effects look coherent without claiming exact source timings.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Product Workflow Interactions
**Goal**: Visitors can understand the product workflow by moving through the toolkit, editor features, and creation-method previews.
**Depends on**: Phase 2
**Requirements**: PROD-01, PROD-02, PROD-03
**Success Criteria** (what must be TRUE):
  1. The Toolkit section stays legible during its sticky/pinned scroll sequence and shows its local library preview.
  2. Scrolling the Features section changes the active Import, Edit, Enhance, and Ship item and presents the matching media and progress state.
  3. Selecting Remix, Describe, or Code in the creation accordion opens that item and displays its matching preview without tab-like behavior replacing the specified accordion.
  4. The product sections remain usable on small screens and do not require motion to access their content.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Discovery & End-to-End Finish
**Goal**: Visitors can explore the remaining examples and complete a stable, accessible journey through the entire corrected homepage.
**Depends on**: Phase 3
**Requirements**: DISC-01, DISC-02, DISC-03, FRAME-02, PAGE-01, A11Y-01, QUAL-01
**Success Criteria** (what must be TRUE):
  1. Visitors can drag or swipe the eight-template carousel and browse its loop; its content remains available when motion is reduced.
  2. The Create more, faster and Turn anything into everything stories show their matching local media, and Get the look presents its creator examples in the pinned horizontal desktop layout and a usable small-screen layout.
  3. Visitors can reach and use the complete footer; scrolling from the intro overlay to the footer reveals all 15 corrected blocks in the documented order.
  4. At 375px, 768px, and 1440px the page remains usable; reduced-motion and video playback behavior follow the accessibility requirements, including a working hero fallback.
  5. `pnpm build` passes without build or TypeScript errors, browser-console errors are absent during the completed flows, and mobile Lighthouse performance is at least 80.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. First Impression & Hero | 3/3 | Complete | 2026-10-08 |
| 2. Narrative & Scroll Motion | 0/TBD | Next | - |
| 3. Product Workflow Interactions | 0/TBD | Not started | - |
| 4. Discovery & End-to-End Finish | 0/TBD | Not started | - |
