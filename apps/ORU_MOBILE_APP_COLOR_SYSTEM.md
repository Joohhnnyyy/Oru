# Oru Mobile App Color System

**Version:** 1.0\
**Platforms:** iOS and Android\
**Purpose:** Mobile-specific color tokens, component rules,
accessibility guidance, and implementation examples.

## 1. Mobile color philosophy

The mobile app should feel like a small, tactile neon object: dark,
focused, responsive, and easy to scan. Use obsidian as the primary
surface, cyan for the main action and active state, and the warmer
colors as selective accents. Do not use the entire rainbow on every
screen.

Color has three jobs: 1. **Structure:** backgrounds, surfaces, dividers,
and readable text. 2. **Interaction:** primary actions, selection,
focus, progress, and feedback. 3. **Brand expression:** holographic
gradients, icon extrusion, and controlled glow.

Keep functional UI simpler than the 3D brand artwork. A button must look
like a button before it looks like a neon object.

## 2. Core brand tokens

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  `oru.bg`                `#05070C`               Main app background

  `oru.face`              `#05070C`               Dark logo/icon face

  `oru.cyan`              `#00CFFF`               Primary accent, active
                                                  state, key progress

  `oru.turquoise`         `#00E5D4`               Secondary accent and
                                                  gradient transition

  `oru.lime`              `#43E34F`               Positive/energetic
                                                  highlight, sparing use

  `oru.yellow`            `#FFE34D`               Warm accent,
                                                  highlights, attention
                                                  decoration

  `oru.pink`              `#FF83D0`               Secondary decorative
                                                  accent

  `oru.lavender`          `#B8A7FF`               Optional secondary glow
                                                  and illustration detail

  `oru.highlight`         `#F7FFFF`               Specular edge and
                                                  bright text/highlight
                                                  where contrast is
                                                  suitable
  -----------------------------------------------------------------------

## 3. Functional UI tokens

These neutrals and semantic colors are recommended companion tokens for
production UI. They extend the logo palette and are not replacements for
the brand colors.

  -------------------------------------------------------------------------
  Token                     Suggested value         Usage
  ------------------------- ----------------------- -----------------------
  `mobile.surface.1`        `#0B0F16`               Main cards and
                                                    navigation surfaces

  `mobile.surface.2`        `#111824`               Raised cards, sheets,
                                                    and input backgrounds

  `mobile.surface.3`        `#192231`               Selected or emphasized
                                                    neutral surface

  `mobile.border`           `#273344`               Default borders and
                                                    separators

  `mobile.text.primary`     `#F7FFFF`               Main text

  `mobile.text.secondary`   `#B5C0CF`               Supporting text

  `mobile.text.muted`       `#7F8B9C`               Metadata; do not use
                                                    for important content

  `mobile.action.primary`   `#00CFFF`               Main CTA fill or active
                                                    accent

  `mobile.action.pressed`   `#00A9D1`               Pressed state

  `mobile.focus`            `#F7FFFF`               Visible focus/selection
                                                    outline

  `mobile.success`          `#43E34F`               Success state, paired
                                                    with a label/icon

  `mobile.warning`          `#FFE34D`               Warning state, paired
                                                    with a label/icon

  `mobile.error`            `#FF6B7A`               Error state; use a
                                                    separate semantic red

  `mobile.info`             `#00CFFF`               Informational state
  -------------------------------------------------------------------------

## 4. Gradient recipes

Use gradients for branded artwork, selected hero elements, progress, or
small highlights. Avoid using gradients behind long blocks of text.

### Primary neon

``` css
linear-gradient(135deg, #00CFFF 0%, #00E5D4 45%, #43E34F 100%)
```

### Liquid extrusion

``` css
linear-gradient(
  180deg,
  #43E34F 0%,
  #FFE34D 24%,
  #FF83D0 48%,
  #00E5D4 72%,
  #00CFFF 100%
)
```

### Holographic accent

``` css
linear-gradient(135deg, #00CFFF 0%, #43E34F 35%, #FFE34D 55%, #FF83D0 78%, #B8A7FF 100%)
```

### Dark glass surface

``` css
linear-gradient(145deg, #111824 0%, #080B11 100%)
```

These are suggested starting gradients. Adjust direction to match the
actual shape and light source.

## 5. Glow tokens

Use glow mainly for the logo, selected iconography, active navigation,
and occasional primary CTA emphasis. Avoid glowing every card and every
button.

``` css
:root {
  --oru-mobile-glow-cyan-tight: 0 0 0 1px rgba(0, 207, 255, 0.72);
  --oru-mobile-glow-cyan: 0 0 14px rgba(0, 207, 255, 0.24);
  --oru-mobile-glow-cyan-wide: 0 0 28px rgba(0, 207, 255, 0.10);
  --oru-mobile-glow-green: 0 0 16px rgba(67, 227, 79, 0.12);
  --oru-mobile-glow-pink: 0 0 16px rgba(255, 131, 208, 0.12);
}
```

Treat these as visual references, not mandatory shadows for every
component. Prefer the tight edge and near halo; use the wide halo
sparingly.

## 6. Component color rules

### App shell and navigation

-   Use `oru.bg` for the main canvas.
-   Use `mobile.surface.1` for bottom navigation, top bars, and major
    panels.
-   Active navigation: cyan icon plus a clear label or indicator. Do not
    rely on glow alone.
-   Inactive navigation: secondary text color.
-   Avoid rainbow-filled navigation bars.

### Buttons

**Primary:** cyan fill with dark text only if contrast testing confirms
the chosen text/background pair. Otherwise use a light label on a darker
cyan-accented surface.\
**Secondary:** surface 2 with a subtle border and bright text.\
**Tertiary:** transparent background, text/icon accent.\
**Destructive:** semantic error treatment, never pink just because pink
is in the brand palette.

States: - Rest: stable fill and clear label. - Pressed: slight
darkening/compression. - Disabled: muted surface and text, with no
glow. - Loading: concise progress indicator and retained button
dimensions.

### Cards and sheets

-   Use a dark neutral surface, a 1 px subtle border, and consistent
    corner radii.
-   Reserve gradient borders or glow for featured cards, selected items,
    or onboarding.
-   Keep content and controls readable without requiring the user to
    distinguish close neon shades.

### Forms

-   Input background: `mobile.surface.2`.
-   Default border: `mobile.border`.
-   Focus: cyan border plus a visible focus indicator.
-   Error: semantic error color and a text explanation.
-   Success: success icon/label; do not turn the entire field bright
    green.

### Charts and status

-   Use cyan for the primary series, turquoise for a second series, lime
    for positive status, yellow for caution, pink/lavender for secondary
    categories.
-   Never use only color to distinguish chart series; include labels,
    markers, patterns, or direct values.
-   Limit simultaneously visible series to maintain clarity.

### Empty, loading, and onboarding states

-   Use one focal illustration or icon with a restrained glow.
-   Use droplets as small accent details.
-   Keep explanatory text static and easy to read.
-   Onboarding may use more of the full spectrum than daily-use screens.

## 7. Mobile readability and accessibility

-   Use `#F7FFFF` for primary text on dark surfaces and verify contrast
    for every actual pairing.
-   Use secondary text for supporting content, not essential
    instructions.
-   Do not use cyan, lime, yellow, pink, or lavender as small body text
    on a dark background without contrast testing.
-   Do not communicate success, warning, or error through color alone.
-   Maintain clear focus/selection states for external keyboards and
    accessibility navigation.
-   Ensure touch targets are comfortably sized; color should not be the
    only cue that something is interactive.
-   Check color behavior in dark mode, bright sunlight, and reduced
    brightness.
-   Glow and transparency can lower effective contrast, so evaluate the
    rendered component, not only the token values.

## 8. Motion and color together

-   Press feedback: slightly darken the accent or compress the control;
    avoid a flash.
-   Selected state: smoothly transition border/accent color over
    approximately 160--220 ms.
-   Icon reveal: bring in the extrusion and rim without making the whole
    screen pulse.
-   Ambient effects: pause when the app is backgrounded and reduce or
    remove them when reduced motion is enabled.
-   Do not animate color continuously on text, error messages, or
    important status indicators.

## 9. Suggested mobile CSS variables

``` css
:root {
  color-scheme: dark;

  --oru-bg: #05070C;
  --oru-face: #05070C;
  --oru-cyan: #00CFFF;
  --oru-turquoise: #00E5D4;
  --oru-lime: #43E34F;
  --oru-yellow: #FFE34D;
  --oru-pink: #FF83D0;
  --oru-lavender: #B8A7FF;
  --oru-highlight: #F7FFFF;

  --mobile-surface-1: #0B0F16;
  --mobile-surface-2: #111824;
  --mobile-surface-3: #192231;
  --mobile-border: #273344;
  --mobile-text-primary: #F7FFFF;
  --mobile-text-secondary: #B5C0CF;
  --mobile-text-muted: #7F8B9C;
  --mobile-action-pressed: #00A9D1;
  --mobile-error: #FF6B7A;
}
```

## 10. Implementation checklist

-   [ ] Keep brand colors and semantic UI colors separate.
-   [ ] Use obsidian and neutral surfaces for most of the screen.
-   [ ] Reserve rainbow gradients for illustration and emphasis.
-   [ ] Check text and control contrast after glow/transparency is
    applied.
-   [ ] Include pressed, disabled, loading, focus, success, warning, and
    error states.
-   [ ] Respect reduced motion and pause ambient effects in the
    background.
-   [ ] Test on small, low-brightness, and high-brightness devices.
