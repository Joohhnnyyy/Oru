# Animation catalog
Source: beautified copies of `app/page-*.js`, `app/layout-*.js`, chunk `5891` (constants), `6955` (3D). Labels: **[extracted]** = read from source, **[observed]** = must be tuned by eye. GSAP defaults `ease:"none"`.

## Global
- **Smooth scroll [extracted]**: Lenis drives `gsap.updateRoot` via a ticker (`ticker.lagSmoothing(0)`, default `updateRoot` removed). Lenis option values not found → use library defaults, tune.
- **Text reveal constants [extracted]**: lineDuration 0.6, lineDelay 0.1, wordDuration 1, wordDelay 0.05, charDuration 0.01, charDelay 0.1, trigger `rootMargin "0px 0px -10% 0px"`, mask show/hide 0.5s.
- **Line reveal [extracted from saved DOM state]**: each line starts `translateY(60%) opacity 0` → `0 / 1`. Features/Gallery/Footer headings split by words; Story sub-heading split by chars (blur filter 0 at rest).
- **Hue-rotate loop [extracted]**: words/elements `filter:hue-rotate(0→360deg)`, 5s linear, repeat; speed boosted by pointer delta (clamped ≤100). Hero words carry `text-shadow rgba(255,0,0,0) 0 0 8px` (red glow on interaction).

## Per section
| Section | Animation | Status |
|---|---|---|
| Intro overlay | SplitText words (mask): `from opacity 0, stagger .03, dur .4, ease in`, delay 1s; then `to opacity 0, stagger .03, dur .4, ease out` at `>+0.45`; then overlay `opacity 0` over 0.5s `in`, `display:none` | extracted |
| Page transition | opacity 0→1 `power3.out` (0.45s), hide `power3.in` 0.5s | extracted |
| Hero | R3F canvas, masked bottom fade; see 3D below. Entrance of text: line reveal | extracted + observed |
| Ticker | `fromTo xPercent 0 → -100/N`, `ease none`, `duration 1.5 × logoCount`, `repeat -1` (N = copies; 24 logos ⇒ 36 s) | extracted |
| Statement | ScrollTrigger once: first block `from y:-300px, rotation:15, duration 2, ease out` (start `top-=300px bottom`). Then per block `to {scale,x,y} 1.5s power2.inOut`, stagger 0.1 (0.05 reversed), rotation random ±15 → 0 (0.75s in / 0.75s out). Direction (forward/back) toggles on scroll direction while section active (start `top bottom` end `bottom top`). Blocks fly between **statement-block-wrapper** (inline in text) and **timeline-block-wrapper** (in timeline.png) | extracted |
| Media parallax | `gsap.from(media,{scale:.8})`, scrub, start `top bottom` end `top top` | extracted |
| BlocksShowcase cards | **Focus**: char blur gradient `8px→0` on hover (segments of word_glow text), 0.8s `out`, stagger .02. **Inflate**: letters scale 0↔1 with random rotate ±20, 0.8s `back.out(1)` in / 0.4s `power2.out` out, stagger .02, neighbouring words shift ±0.15em. Glow/Halftone: not found | extracted (Focus, Inflate), observed (rest) |
| Looping gradient frame | timeline repeat -1, 4 keyframes, 1s linear each | extracted |
| Toolkit | pinned, `height:200vh` ≥64rem | extracted (CSS) |
| Features | pin container; each item ScrollTrigger `start top center`, `end bottom center`; `onEnter→setProgress(i)`, `onEnterBack→setProgress(i-1)`. Progress bar: `--offset -100%→0%`, 7s linear; on complete advance to next (autoplay when in view) | extracted |
| Three ways | Radix accordion, height keyframes `0 ↔ var(--radix-accordion-content-height)` | extracted (CSS) |
| Gallery carousel | draggable (grab cursor, pan-y); items ×3 loop | observed |
| Get the look | ≥ tabletL: `to x: -(scrollWidth - innerWidth)`, `scrub:true`, pin, `start center center`, `end bottom bottom`, `invalidateOnRefresh` | extracted |
| Video | `preload none`; play/pause by IntersectionObserver (rootMargin `0 0 -30% 0` or `20px`) | extracted |

## 3D keychain [extracted, chunk 6955] — uses **physics** (Rapier rigid bodies + joints)
- Camera fov 35, far 500, group at `[0,-4,10]`. Directional light 1.6 at `[-29,-14.8,-35]` target `[0,2.2,0]`. Env map `city.jpg` ("city").
- Main ring: torus r 0.5, offsetY 3.2, metal 1 / rough 0.2. Chain ring r .12/.08.
- Rigid body: dynamic, canSleep, angularDamping 2.9, linearDamping 2.3. Pointer force strength 4.4, radius 2.
- 7 charms around ring (positionAngle / directionAngle / z): −60/−70/.2, −40/−60/−.2, −10/−10/.4, 20/10/.8, 40/50/−1, 70/80/.4 + key; materials metalness 1 rough .1; circle_tag transmission .8, rough .21, metal .63.
- ⚠ Requires `@react-three/rapier` (+ leva debug panel in original). **Not in SPEC §3 → needs approval (rule 9).**
