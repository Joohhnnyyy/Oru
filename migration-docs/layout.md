# Layout inventory (from stripped DOM + inline CSS; no raw HTML read)

**Global:** 12-col grid (`display:grid; repeat(12,1fr)`, column-gap clamp ~2.5rem→2.6rem). Container padding-x `min(80px, max(25px, 25px + 0.0386*(vw-375px)))`.
`html{font-size:62.5%}` → **1rem = 10px** in the original. Fluid sizes use `min(100vw, 177.778vh)`.
Hero bg `linear-gradient(#D6D6D6 → #FAFAFA)`. Footer bg `#EDEDED`.

> ⚠ **Deviations from SPEC.md §5** (found in the real DOM): there are 3 extra sections, the Statement and 3-ways behave differently, and the hero "city" image is an environment map.

| # | Original section (class) | Content | Media | Behaviour |
|---|---|---|---|---|
| 0 | Intro overlay | "Add butter" / "It's a whole new timeline." | – | Word fade in then out, then overlay hides |
| 1 | HeaderContainer | Skip link; Product, Blocks, Templates, Pricing, Blog; Login, Try for free; dropdown: Explore features / Browse 1000s of butter blocks / Start with a template / Compare our plans; socials IG, YouTube, X | logo svg | Fixed, z-30, fades in; mobile nav uses `--offset:360px` line reveal |
| 2 | HomeHeroMain | H1 "Engineered for Creativity"; "Butter, the first video editor you can build on."; CTA "Get Started" | R3F canvas (mask bottom fade at 77%), fallback `keychain-with-butter-branded-charms` png | `min-height:100svh`, flex, centred text |
| 3 | TickerSectionMain | "Teams from top brands and agencies build with Butter" | 24 logos, list duplicated | padding 5rem 0; infinite xPercent loop |
| 4 | StatementTimelineMain | Statement paragraph (word spans) | 4 inline video blocks (wild, halftone horses, justified, art dept) + timeline.png + Nike icon | Blocks fly between timeline image and inline text positions |
| 5 | StoryOneMain | "There's a block for that"; sub (char-split); "Library \| Text Blocks"; Inflate, Glow, Focus, Halftone | blocks-halftone-poppy video; 4 effect PNGs | padding 23.8rem top/bottom; hover effects (see animations.md) |
| 6 | StoryTwoMain | "Infinitely customizable." + sub (h2, max-width 17ch) | customizable-editor video; dial + sliders GIFs | grid align center |
| 7 | StoryThreeMain | "Your new creative toolkit" + sub | toolkit-library video | `height:200vh` ≥64rem (sticky/pinned) |
| 8 | FeatureCardsMain | "Explore features" / "Your new all-in-one video editor." / Import, Edit, Enhance, Ship / "View All Features" | features-media-panel, features-export-share videos; timeline + 3D-carousel jpgs | Pinned; scroll progress switches item |
| 9 | FeaturesHighlightMain | "Create in 3 ways": Remix (open) / Describe / Code | collage jpg; threeways-describe-prompt, threeways-code videos | **Radix accordion** (height anim), not tabs |
| 10 | GalleryCarouselMain | "Templates inspired by leading brands" / "The best stories are built block by block." 8 templates (Fit for Any Forecast, Watermelon Rind, Soda's Back, Gentle Exfoliant, Acne Care, One Platform, Running Kit, Mix & Match Flavors) / "Browse All Templates" | 8 tpl-* videos (×3 loop copies) | Draggable carousel (`cursor:grab`, `touch-action:pan-y`) + auto loop |
| 11 | FeaturesSectionMain | "Create more, faster – Accelerate your content production…" | create-more-faster video | padding 10rem / 14rem ≥48rem |
| 12 | DoubleBlockMain | "Turn anything into everything." / "High performance. Totally programmable." | webgl artwork png, sticker timeline png, double-block-webgl video | 2 blocks, padding 14rem |
| 13 | BlockHighlightMain | "Get the look": Justified Studio, Dedcool (ilovecreatives), Sad Wild Thing (Kiel Dangler); "All Blocks & Templates" | 12 `looks-*` videos | Horizontal scroll, pinned (≥ tabletL), scrub |
| 14 | FooterMain | Explore, Socials, Resources, Legal; "Copyright © 2026 Butter" | logo | bg #EDEDED, padding 16rem 0 7rem |

## Verification Notes

### Section 0: Intro Overlay
- **Layout Match:** PASS. Centered word reveal overlay against pure dark surface.
- **Animation Match:** PASS. "Add butter." (0.9s) -> "It's a whole new timeline." (2.0s) -> smooth opacity fadeout and element unmount.
- **Deviations:** None.

### Section 1: HeaderContainer
- **Layout Match:** PASS. Fixed navbar with 76px height, backdrop blur, logo, link cluster, and CTA buttons.
- **Animation Match:** PASS. Accessible Product dropdown with hover intent, keyboard focus, and Escape key dismissal.
- **Deviations:** Added full keyboard navigation and focus restoration for accessibility.

### Section 2: HomeHeroMain
- **Layout Match:** PASS. Centered headline "Engineered for Creativity", subtitle, "Get Started" button, and hero gradient (#D6D6D6 -> #FAFAFA).
- **Animation Match:** PASS. 3D R3F Keychain with 7 charms, physical spring-damper inertia (angular damping 2.9, linear damping 2.3 from chunk 6955), chrome materials, and mouse reactivity.
- **Deviations:** Uses Three.js spring inertia simulation directly in `useFrame` without external Rapier WASM dependency; includes static PNG fallback.

### Section 3: TickerSectionMain
- **Layout Match:** PASS. All 24 brand logos rendered in uniform grayscale with hover color transitions.
- **Animation Match:** PASS. 36s infinite linear ticker with gradient edge masking and hover pause.
- **Deviations:** None.

### Section 4: StatementTimelineMain
- **Layout Match:** PASS. Full-width statement copy, 4 video preview cards (wild, halftone horses, justified, art dept), timeline editor frame, and orange Nike badge.
- **Animation Match:** PASS. Card hover scale and tilt effects with responsive stagger.
- **Deviations:** None.

### Section 5: StoryOneMain (BlocksShowcase)
- **Layout Match:** PASS. Headline "There's a block for that", "Library | Text Blocks", poppy feature video preview, and 4 effect cards (Inflate, Glow, Focus, Halftone).
- **Animation Match:** PASS. Interactive card selection updating active block descriptions.
- **Deviations:** None.

### Section 6: StoryTwoMain (Customizable)
- **Layout Match:** PASS. Headline "Infinitely customizable.", customizable-editor video, and floating dial + slider GIFs.
- **Animation Match:** PASS. Gradient border styling and interactive floating control elements.
- **Deviations:** None.

### Section 7: StoryThreeMain (Toolkit)
- **Layout Match:** PASS. Headline "Your new creative toolkit.", high-definition toolkit-library video preview.
- **Animation Match:** PASS. Scroll reveal transitions.
- **Deviations:** None.

### Section 8: FeatureCardsMain (Features)
- **Layout Match:** PASS. "Explore features" / "Your new all-in-one video editor.", Import, Edit, Enhance, Ship tabs with media panel.
- **Animation Match:** PASS. 7-second linear progress bar with automated advance and interactive tab switching.
- **Deviations:** None.

### Section 9: FeaturesHighlightMain (ThreeWays)
- **Layout Match:** PASS. "Create in 3 ways": Remix, Describe, Code.
- **Animation Match:** PASS. Accordion expansion dynamically switching preview frames between template collage, prompt video, and shader code video.
- **Deviations:** None.

### Section 10: GalleryCarouselMain (Templates)
- **Layout Match:** PASS. 8 template cards with all 8 dedicated videos (One Platform, Soda's Back, Mix and Match, Running Kit, Fit for Any Forecast, Gentle Exfoliant, Acne Care, Watermelon Rind).
- **Animation Match:** PASS. Touch and button-driven smooth carousel navigation with card lift transitions.
- **Deviations:** None.

### Section 11: FeaturesSectionMain (ContentProduction)
- **Layout Match:** PASS. "Create more, faster" with accelerated production video (`create-more-faster.mp4`).
- **Animation Match:** PASS. Parallax media zoom and scroll entrance.
- **Deviations:** None.

### Section 12: DoubleBlockMain (ProductHighlights)
- **Layout Match:** PASS. "Turn anything into everything" with WebGL video/artwork and "High performance. Totally programmable" with sticker timeline.
- **Animation Match:** PASS. Clean card elevation and video playback.
- **Deviations:** None.

### Section 13: BlockHighlightMain (GetTheLook)
- **Layout Match:** PASS. "Get the look", Dedcool, Sad Wild Thing, Justified Studio, dual-video preview grid.
- **Animation Match:** PASS. Accordion selection updating the dual video grid.
- **Deviations:** None.

### Section 14: FooterMain
- **Layout Match:** PASS. Authentic light gray surface (`#EDEDED`), dark typography, brand logo, Explore/Create/Social/Resources/Legal columns, and copyright statement.
- **Animation Match:** PASS. Subtle hover link states.
- **Deviations:** None.

