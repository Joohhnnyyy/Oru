---
phase: "1"
slug: "first-impression-hero"
status: draft
shadcn_initialized: false
preset: none
created: "2026-10-08"
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the fixed header and first-screen hero. Generated from the phase decisions and verified project assets/tokens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — use the existing project-authored Tailwind CSS 4 theme; do not initialize or add a component system |
| Preset | none |
| Component library | none |
| Icon library | none |
| Font | Space Grotesk for headings; Inter for body/UI; JetBrains Mono for the existing mono-label role |

Installed stack verified from `butter-clone/node_modules`: React 19.3.0 and Tailwind CSS 4.3.3. Existing color/font tokens are defined in `butter-clone/src/index.css`; retain those names and values. Do not add dependencies, introduce hardcoded component colors, or substitute an external component library.

**Decision provenance:** The centered headline/copy, CTA label/destination, local keychain asset and fallback behavior, spring/pendulum motion, fixed accessible header, Product dropdown inputs, and placeholder status of existing Butter outbound links are locked in `01-CONTEXT.md`. Responsive implementation details, spacing, type scale, and color proportions below are defaults aligned to the app tokens and migration inventory.

### Phase Surface and Interaction Contract

**Header**
- Keep the skip link as the first keyboard-reachable control; activating it moves focus to `main#main`, which must have a visible focus target and a scroll offset matching the fixed header.
- Render a fixed header at the top of the viewport above page content. Use the existing Butter white surface, tokenized subtle border/backdrop treatment, and a stacking order above the hero.
- At widths of 1024px and above, show the logo, primary navigation, and account actions in one row. Primary links are Product, Blocks, Templates, Pricing, and Blog; account actions remain Log in and Try for free. Below 1024px, replace the crowded link row with the mobile menu button and expandable navigation.
- Product is a real button-controlled dropdown, not a hover-only link. It opens on pointer hover, keyboard focus/activation, and click/tap; remains open while the pointer or keyboard focus is within it; and closes on Escape, outside activation, or when focus/pointer leaves. Escape returns focus to the Product trigger. Its links are Explore features, Browse 1000s of butter blocks, Start with a template, and Compare our plans, routed to available in-page sections or existing placeholder destinations.
- The mobile menu button exposes its expanded state and controlled menu. The expanded menu is keyboard operable, vertically scrollable if it exceeds the viewport, dismisses on Escape or link selection, and returns focus to its trigger when dismissed. Do not trap focus as if this navigation were a modal.
- Preserve the existing Butter outbound destinations only as learning-clone placeholders; do not imply that they are working Butter product destinations or introduce new outbound destinations. Retain safe new-tab link attributes where already applicable.

**Hero**
- Use a full first-screen section with centered alignment at 375px, 768px, and 1440px. Center the copy; constrain the headline to a readable measure and let it wrap without clipping. Keep the keychain below/behind the copy with sufficient separation and contrast so it never obscures text or the CTA.
- Headline: **Engineered for Creativity**. Supporting line: **Butter, the first video editor you can build on.** Primary action: **Get Started**, an in-page link to the product/features section (`#features`), not an external signup URL.
- Use the checked-in local keychain GLB assets for the capable desktop 3D presentation. Render the local keychain PNG (`/images/embedded/keychain-with-butter-branded-charms-57a4.png`) immediately as the initial/contingency presentation. Enhance to 3D after first paint on supported desktop; keep the PNG as the visible presentation on mobile, under reduced motion, when WebGL is unavailable, or if model/renderer loading fails.
- Motion is a restrained spring/pendulum-style sway built with installed dependencies only. Do not add Rapier or another package. Reduced-motion mode is fully static and uses the PNG. The `city.jpg` asset, if used by the scene, is environment lighting only—not visible hero artwork.
- Keep all media local and root-absolute from `public/`. If local 3D loading fails, preserve the text/action and static image rather than showing a broken-media icon, a remote replacement, or a blocking error screen.

**Scaffold alignment:** The current header/hero scaffold has a sticky header, lacks the Product menu, and uses split hero copy with different text/actions. Those are implementation gaps, not contract choices; this spec follows the locked phase decisions above.

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-to-label and compact inline gaps |
| sm | 8px | Compact control padding and related labels |
| md | 16px | Body-copy gaps and control padding |
| lg | 24px | Hero copy/action grouping |
| xl | 32px | Header group gaps and hero content separation |
| 2xl | 48px | Hero content-to-media separation |
| 3xl | 64px | Large hero breathing room |

Structural dimensions (not spacing tokens): preserve the existing header height from the current implementation. Use at least 48px for icon-only and touch navigation controls, aligned to the spacing grid and exceeding the 44px accessibility minimum.

---

## Typography

Use the app’s `--font-heading` (Space Grotesk) and `--font-body` (Inter) tokens. Keep the declared type scale to these four sizes; the display size may fluidly scale between the existing 32px and 64px steps.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label / navigation | 14px | 400 | 1.4 |
| Section / dropdown heading | 32px | 600 | 1.2 |
| Hero display | 64px, fluid down to 32px | 600 | 1.1 |

Only use weights 400 and 600 in this phase. Keep hero supporting copy at 16px (line-height 1.5); use the 14px role for compact navigation labels and the 32px role for dropdown-level headings. Do not load paid source fonts or add font packages.

---

## Color

Use Tailwind utilities and existing CSS theme tokens only. Hex values below document the existing tokens; never hardcode these values in component styles.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `butter-white` / `--color-butter-white` (`#FAFAFA`) | Main canvas and hero base |
| Secondary (30%) | `butter-off-white` (`#F7F7F7`), `butter-light-grey` (`#EDEDED`), `butter-dark-grey` (`#E2E2E2`) | Header/menu surfaces, subtle borders, and hero tonal gradient |
| Accent (10%) | `butter-black` / `--color-butter-black` (`#1E1E1E`) | Strong action surfaces and active/focus emphasis |
| Destructive | None | No destructive actions in this phase |

Accent reserved for: Get Started and Try for free button emphasis, the open Product-trigger state, and keyboard-visible focus outlines. Use `butter-black` for ordinary text as the existing ink token; do not create extra accent colors or use accent styling indiscriminately on every link. Keep all surface, text, hover, border, and focus colors sourced from existing tokens, including any opacity variants.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Get Started |
| Empty state heading | Not applicable — the hero is static marketing content, not a data-dependent surface. |
| Empty state body | Always render the headline, supporting line, CTA, and local keychain PNG fallback; do not show an empty-hero state. |
| Error state | “3D preview unavailable; showing the static keychain image.” Preserve the local image and all hero copy/action; announce the fallback politely to assistive technology if 3D initialization fails. |
| Destructive confirmation | None — this phase has no destructive actions or confirmation dialog. |

Required hero copy is exact: **Engineered for Creativity** and **Butter, the first video editor you can build on.** The CTA label is exact: **Get Started**.

---

## UI Considerations

Applicable state considerations resolved: 6 covered, 2 dismissed, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Hero media | ✅ covered | The hero always renders its local keychain PNG and fixed copy; there is no blank/data-empty presentation. |
| loading | Hero media / 3D scene | ✅ covered | Keep the local PNG visible from first render; enhance to local 3D only after first paint on capable desktop. No spinner blocks the hero. |
| error | Hero media / 3D scene | ✅ covered | On WebGL, GLB, or renderer failure, retain the local PNG and hero controls; use the error copy above and never request remote media. |
| populated | Hero media | ✅ covered | Desktop happy path shows the locally assembled keychain with subtle spring/pendulum motion; static image remains the supported alternate. |
| loading | Header and navigation | dismissed | Header labels and menu contents are local, synchronous UI; there is no navigation loading state to display. |
| error | Header and navigation | dismissed | Navigation uses local anchors or existing external placeholders, with no in-app request/submit flow or asynchronous result state. |
| overflow | Header/navigation | ✅ covered | Switch to the mobile menu below 1024px; allow the expanded menu to scroll within the viewport and keep every link reachable. |
| long-text | Hero heading and Product menu | ✅ covered | Allow the centered heading and longest dropdown label to wrap; constrain menu width to the viewport and never clip or ellipsize required copy. |

Additional accessibility contract: all header/menu actions work by keyboard and touch; focus indicators are visible using existing tokens; hover never becomes the only way to open Product; and the hero’s motionless local fallback is equivalent in meaning to the 3D presentation. No list-collection surface exists in this phase, so zero/one/many collection states do not apply.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | Not applicable — shadcn is not initialized, no third-party registry or block is requested, and no new dependencies are authorized. |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending
