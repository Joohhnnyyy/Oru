# Design tokens (verified against inline `:root`)

SPEC.md §4 colours are all confirmed. **Missing from spec:** `--butter-light: #EBEBEB`.

## Easings (extracted) — `[extracted from source]`
| name | cubic-bezier |
|---|---|
| in | `0.815, 0.005, 0.810, 0.195` |
| out | `0.200, 0.715, 0.205, 0.990` |
| inOut | `0.835, 0.120, 0.225, 0.770` |
| outFast | `0, 0, 0, 1` |
GSAP default ease is `"none"`; custom eases `in/out/inOut/outFast` registered with CustomEase.

## Breakpoints (from @media)
`40rem · 48rem (tablet) · 64rem (tabletL) · 77.5rem · 112.5rem` (+ max-width 47.9375rem, 63.9375rem). Original root font = 62.5% so rem values are ×10px.

## Misc
- Radii seen: .5, .75, .8, 1, 1.1, 1.25, 1.6, 2, 2.2, 3.2rem, 50%.
- Glow shadow: `0 0 70px rgb(233 211 82 / 40%)`; hairline: `inset 0 0 0 1px rgba(0,0,0,.15)`.
- Transitions: bg/colour/transform `.2s var(--ease-out)`; colour `.5s inOut`; mask-position `.6s inOut`; bg `1s out`.
- Weight mostly 400 (some 500/600); line-height 0.96 / 1 / 1.25 / 1.3125; letter-spacing 0.008–0.044em.
- Fonts: DieGrotesk (headings), ABCDiatype (body) → **not shipped**; Space Grotesk / Inter / JetBrains Mono.
- Exact heading font sizes are styled-components with fluid clamps; **tune against live original by eye** (the only large clamps found belonged to an unrelated hidden page).
