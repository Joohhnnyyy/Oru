# Oru — screens, sitemap and motion handoff

Designed 11 October 2026. [Open the Figma design](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh).

80 screen concepts have desktop (1440px) and mobile (390px) layouts: **160 editable screen frames**. The design keeps the root frontend's Baloo 2 / Noto Sans typography, original guardian art, dark ink pill actions, open white chapters, pastel gradients and rounded cards. This is the design-first deliverable; Figma-only routes and planned capabilities are not claims of new frontend or backend implementation.

## Visual revision from the supplied frontend

The latest direction uses a cinematic layered opening, oversized editorial manifesto, asymmetrical mission panels, a dark growth chapter, staggered guardian collection and yellow closing invitation. Public heroes have stronger typography and full-width atmosphere. Floating navigation and a restrained operational layout carry the same identity into account and municipal screens. The original rainbow wordmark remains the main brand signature. Existing screen IDs and route links are preserved.

Six guardian cards have native front/back variants with 420ms Smart Animate. A five-stage growth selector is interactive at both breakpoints. Pixel plots and the regional cartogram are editable vectors. Shared transparent containers no longer clip typography or card shadows. All 160 frames were rearranged to prevent overlap after their heights changed.

## Working scroll preview

### Citizen world revision

[Enter the onboarding journey](http://127.0.0.1:4178/docs/design/citizen-preview.html#language) or [open citizen home](http://127.0.0.1:4178/docs/design/citizen-preview.html#home). The main site's “Enter Oru” invitation links to this journey. Language, neighbourhood, guardian reveal and home have been rebuilt in Figma at both breakpoints, preserving their frame IDs and incoming links. The citizen home centres on the guardian and one daily action; a quiet progress line and compact navigation replace the dashboard layout.

The browser prototype provides step-by-step navigation, remembered language selection, a sample neighbourhood, a guardian reveal, a greeting interaction and a daily-action confirmation dialog. Language selection demonstrates the choice; translated browser content is not implemented. Sample progress and confirmation stay in browser memory and do not submit actions or award credits. Production location permission, verification and API data remain application responsibilities.

Guardian reveal uses a one-second scale/opacity entrance, followed by a gentle five-second idle float. Story copy fades without moving; the world backdrop settles independently. Figma uses a timed depth proxy, with a 3.2-second timeline; production entrances should run once and idle motion only while visible. Browser system and manual reduced-motion settings remove all animation. The exported reveal diagnostic is `design/citizen-reveal-motion.mp4`, with a four-phase contact sheet in `design/citizen-reveal-contact-sheet.png`.

The runnable browser check is `design/verify-citizen-preview.js`: `(await import('./verify-citizen-preview.js')).verifyCitizenPreview()`. It passes at 1440×1000 and 390×844 for all four scenes, loaded artwork, viewport fit, forward/Back navigation, remembered language selection, confirmation/cancel and zero animations after reduced-motion navigation.

[Open the local preview](http://127.0.0.1:4178/docs/design/immersive-preview.html). The standalone file is design/immersive-preview.html. It reuses original frontend artwork, the installed Baloo font and editable pixel plots. Native CSS scroll timelines drive different background and foreground depth rates; IntersectionObserver reveals chapters. The growth chapter pins on desktop and becomes a normal stack on mobile. Six guardian cards flip and five growth stages can be selected. The mobile menu uses a native dialog with staggered link entrances.

The preview has a motion toggle and respects the system preference. Unsupported scroll-timeline browsers retain readable static imagery. This is an isolated visual prototype; production routes, API calls and backend behaviour have not been changed by this design pass. See [MDN animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) for native scroll-timeline support.

The Figma motion study is a timed depth proxy, not native scroll binding. Its MP4 and four-phase contact sheet are saved as design/cinematic-depth-preview.mp4 and design/cinematic-depth-contact-sheet.png. The choreography panel records desktop/mobile ranges, triggers and reduced-motion alternatives.

Browser checks passed at 1440×1000 and 390×844: foreground moves faster than background, no missing images or horizontal overflow, all five growth stages select, all six cards flip, the menu opens/closes, and motion off removes native animations. Re-run in the preview console with `(await import("./verify-immersive-preview.js")).verifyOruPreview()`.

## Sources and precedence

Read project, AWS, backend, web, mobile and game-design docs, plus the backend review/fix log. Compared these with apps/web routes, migration notes, the root frontend routes/styles/assets and mounted infra/lib/api-stack.ts endpoints. Root frontend visuals take precedence over the legacy video-editor prototype. Mounted API handlers and current game rules take precedence over aspirational endpoint and reward examples in older docs. The existing six guardian assets are retained.

## Figma organisation

- 00 • Start here & Oru foundations: cover, colour variables, text styles, reusable components and original assets.
- 01 • Complete screens & connected journeys: labelled sections for public, citizen, municipal/merchant, feedback and future concepts. Shared page placement permits native navigation across journeys.
- 02 • Sitemap & API coverage: every concept, route label, API availability and direct desktop/mobile frame links.
- 03 • Motion & implementation handoff: timing, triggers, accessibility and production boundaries.

Named desktop/mobile prototype starting points include landing, sign-in, collector, municipal overview, verified scan and future assistant. Menu, task, verification, reward and recovery controls connect to responsive destinations. Current-route controls remain in place. Some decorative elements are static.

## Scope and integration boundaries

Current root account routes include /signin, /onboarding, /home, /tasks, /scan, /rewards, /leaderboard, /community, /proof, /profile, /collector, /console, /console/review and /console/qr-sources. The design splits onboarding stages and reward wallet/catalogue for clarity; implement these as stages or aliases rather than breaking existing URLs. Feedback URLs in the inventory identify design states and need not become independent routes.

Email OTP, territory detail/map expansion, bounty creation, ward report export, merchant inventory upload, segregation assistant and bill comparison have planned UI or contracts. Do not infer mounted APIs from their presence in the design. Collector GPS updates already use GET /v1/collector/qr-token?lat=&lng=; do not invent a separate position endpoint.

Demo numbers, map geometry, city names, QR codes, reward codes, chart data and private-photo placeholders are illustrative. Production rewards, approvals, balances, health and signed tokens must come from services/api. No local reward calculation or simulated approval should replace the backend. Legal and contact copy remains design draft content.

The illustrated 7-day-streak / health-42 collector scan shows 50 GC and 67 XP, with 2 GC awarded to the collector and health 42 → 43; these match the current rules for that example. Cleanup approval shows 40 GC and 101 XP. Actual responses may differ. Task cards show base amounts, not promises of final awards.

## Animation contract

| Behaviour | Timing | Trigger and limit |
| --- | --- | --- |
| Marketing scroll depth | Desktop background 40px / foreground 80px; mobile half-depth | Scroll-driven in browser; timed proxy in Figma |
| Editorial chapter entrance | 900ms, Y 40 → 0, cubic-bezier(.22,1,.36,1) | Once on viewport entry |
| Desktop growth chapter | Pinned through 170vh | Ordinary stack on mobile and reduced motion |
| Page title / card entrance | 280ms ease-out; Y 18 → 0; 70ms card stagger | Once on entry |
| Guardian float | 3.2s; Y 0 → −8 → 0 | Only while visible and relevant |
| Guardian reveal | 700ms; scale .72 → 1.06 → 1 | Once after onboarding result |
| Guardian card flip / growth-stage selection | 420ms Smart Animate | Native interactive variants; immediate swaps for production reduced motion |
| Button hover / press | 120ms / 90ms | Native component variants; visible keyboard focus in implementation |
| Camera beam | 1.6s sweep | Stop with camera or verification |
| Verification status | 1.2s opacity pulse | Only while pending; announce actual status |
| Reward celebration | Scale settles by 700ms; 12 dots clear by 1.15s | Once after confirmed success |
| Ward chart entrance | 440ms fade and 12px settle | Once after data loads |
| Route transitions | 240ms Smart Animate | Responsive prototype links |
| Reduced motion | Immediate change | No float, scale, confetti or sweep |

Figma timeline previews loop by default. Generated snippets may contain repeat: Infinity; use repeat: 0 for entrances, reveals and celebrations in production. Only idle or pending effects may repeat while relevant. Respect prefers-reduced-motion and pause decorative animation off-screen or in hidden tabs. Keep status and controls usable throughout.

## Verification

- Audited all 160 frames: no horizontal text overflow and no missing original artwork.
- 646 layers have native keyframe animation; 1,409 reusable component instances are present after the citizen revision.
- Both reduced-motion frames contain zero keyframe tracks.
- Checked representative public, citizen, collector and municipal screenshots.
- Rendered a 15fps, 3.27-second reward MP4 and sampled opening, celebration and resting frames.
- Native button default/hover/pressed variants and responsive prototype destinations are present.
- Design review is separate from browser accessibility and production integration testing.

## Complete screen inventory

Every row below has a desktop and a mobile design. Frame IDs and links are also recorded in design/screen-manifest.json.

### public

| Concept / route | Integration status |
| --- | --- |
| [landing](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=5-19) · / | Existing public route; content screen |
| [how](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-26) · /how-it-works | Existing public route; content screen |
| [guardians](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-163) · /guardians | Existing public route; content screen |
| [guardian-leopard](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-316) · /guardians/leopard | Existing public route; content screen |
| [guardian-bustard](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-457) · /guardians/bustard | Existing public route; content screen |
| [guardian-dolphin](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-598) · /guardians/dolphin | Existing public route; content screen |
| [guardian-crane](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-739) · /guardians/crane | Existing public route; content screen |
| [guardian-turtle](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-880) · /guardians/turtle | Existing public route; content screen |
| [guardian-sparrow](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1021) · /guardians/sparrow | Existing public route; content screen |
| [grow](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1162) · /grow | Existing public route; content screen |
| [places](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1277) · /places | Existing public route; content screen |
| [impact](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1562) · /impact | Existing public route; content screen |
| [roadmap](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1699) · /roadmap | Existing public route; content screen |
| [play](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1836) · /play | Existing public route; content screen |
| [faq](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-1973) · /faq | Existing public route; content screen |
| [privacy](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2138) · /privacy | Existing public route; content screen |
| [terms](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2271) · /terms | Existing public route; content screen |
| [contact](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2404) · /contact | Existing public route; content screen |
| [not-found](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2509) · /404 | Existing public route; content screen |
| [public-menu](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=9-1934) · /menu | Responsive public navigation design |

### citizen

| Concept / route | Integration status |
| --- | --- |
| [signin](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2588) · /signin | Current password authentication; demo/Cognito account |
| [verify](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2719) · /verify | Planned email OTP; do not replace current authentication |
| [language](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2846) · /onboarding/language | Existing /onboarding stage; POST /v1/onboarding |
| [location](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-2961) · /onboarding/location | Existing /onboarding stage; browser permission + POST /v1/onboarding |
| [reveal](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-3103) · /onboarding/reveal | Existing onboarding outcome; illustrative guardian/territory |
| [home](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-3228) · /home | GET /v1/me, /v1/wallet, /v1/tasks, /v1/trucks/live |
| [map](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-3419) · /map | Planned map route; GET /v1/trucks/live available; polygons/detail API pending |
| [territory](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-3730) · /t/yamuna-bank | Planned territory detail route and contract |
| [tasks](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4003) · /tasks | GET /v1/tasks + POST /v1/tasks/checkin |
| [scan](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4204) · /scan | POST /v1/scans; permissions and source checks |
| [proof](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4323) · /proof | POST /v1/submissions + GET /v1/submissions/{id}; signed upload |
| [wallet](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4460) · /wallet | GET /v1/wallet; currently included on /rewards |
| [coupons](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4676) · /coupons | GET /v1/coupons + POST /v1/coupons/redeem; currently /rewards |
| [leaderboard](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-4839) · /leaderboard | GET /v1/leaderboards |
| [profile](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5024) · /profile | GET/PATCH /v1/me |
| [community](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5165) · /community | GET /v1/hotspots + GET /v1/trucks/live |
| [hotspot-report](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5434) · /community/report | POST /v1/hotspots; currently /community form |
| [collector](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5575) · /collector | GET /v1/collector/qr-token |
| [collector-route](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5688) · /collector/route | GET /v1/collector/qr-token?lat=&lng= updates live position; dedicated route planned |
| [account-menu](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=9-2114) · /account/menu | Responsive account navigation design |

### console

| Concept / route | Integration status |
| --- | --- |
| [overview](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-5935) · /console | GET /v1/admin/territory-overview |
| [territories](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6190) · /console/territories | GET /v1/admin/territory-overview; dedicated detail route planned |
| [review](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6429) · /console/review | GET /v1/admin/review-queue + POST /v1/admin/review-queue/resolve |
| [qr-sources](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6566) · /console/qr-sources | GET/POST /v1/admin/qr-sources |
| [qr-new](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6721) · /console/qr/new | POST /v1/admin/qr-sources; current registry inline form |
| [qr-print](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6880) · /console/qr/print | Registry QR preview; print-sheet UI planned |
| [hotspots](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-6991) · /console/hotspots | GET /v1/hotspots; municipal workflow UI planned |
| [bounty](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7172) · /console/bounties/new | Planned bounty creation; no mounted API route |
| [reports](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7321) · /console/reports | Planned ward reports/export; overview aggregates available |
| [merchants](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7492) · /console/merchants | Planned inventory management; coupon read/redeem exists |
| [merchant-import](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7653) · /console/merchants/import | Planned merchant CSV validation/publishing; no mounted API |
| [console-menu](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=9-2341) · /console/menu | Responsive municipal navigation design |

### states

| Concept / route | Integration status |
| --- | --- |
| [scan-verifying](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7782) · /scan/verifying | Alternate UI state; route label is a design identifier |
| [scan-success](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-7887) · /scan/success | Alternate UI state; route label is a design identifier |
| [scan-range](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8002) · /scan/out-of-range | Alternate UI state; route label is a design identifier |
| [scan-expired](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8107) · /scan/expired | Alternate UI state; route label is a design identifier |
| [scan-cooldown](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8212) · /scan/cooldown | Alternate UI state; route label is a design identifier |
| [camera-denied](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8317) · /scan/camera-denied | Alternate UI state; route label is a design identifier |
| [location-denied](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8422) · /onboarding/location-denied | Alternate UI state; route label is a design identifier |
| [habit-complete](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8527) · /tasks/complete | Alternate UI state; route label is a design identifier |
| [proof-processing](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8632) · /proof/processing | Alternate UI state; route label is a design identifier |
| [proof-review](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8737) · /proof/review | Alternate UI state; route label is a design identifier |
| [proof-approved](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8842) · /proof/approved | Alternate UI state; route label is a design identifier |
| [proof-rejected](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-8947) · /proof/rejected | Alternate UI state; route label is a design identifier |
| [redeem-confirm](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9052) · /coupons/confirm | Alternate UI state; route label is a design identifier |
| [redeem-success](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9161) · /coupons/redeemed | Alternate UI state; route label is a design identifier |
| [redeem-insufficient](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9268) · /coupons/insufficient | Alternate UI state; route label is a design identifier |
| [empty-tasks](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9373) · /tasks/empty | Alternate UI state; route label is a design identifier |
| [network-error](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9478) · /error/network | Alternate UI state; route label is a design identifier |
| [offline](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9583) · /offline | Alternate UI state; route label is a design identifier |
| [profile-saved](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9688) · /profile/saved | Alternate UI state; route label is a design identifier |
| [hotspot-reported](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9793) · /community/reported | Alternate UI state; route label is a design identifier |
| [review-resolved](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-9898) · /console/review/resolved | Alternate UI state; route label is a design identifier |
| [report-exported](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10003) · /console/reports/exported | Alternate UI state; route label is a design identifier |
| [session-expired](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10108) · /session-expired | Alternate UI state; route label is a design identifier |
| [reduced-motion](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10213) · /accessibility/reduced-motion | Alternate UI state; route label is a design identifier |

### motion

| Concept / route | Integration status |
| --- | --- |
| [assistant](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10318) · /assistant | P2 concept; no implemented assistant API |
| [assistant-result](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10429) · /assistant/result | P2 concept; guidance requires review |
| [energy](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10571) · /energy | P2 concept; no implemented bill API |
| [energy-result](https://www.figma.com/design/0NzcwCz3EQ7gZYqZyPnzMh?node-id=7-10692) · /energy/result | P2 concept; illustrative comparison |


## Application implementation

The approved designs now have routes in the root `frontend` app, including immersive onboarding/home and citizen/municipal navigation. Read [the integration report](10-FRONTEND-BACKEND-INTEGRATION.md) for actual API coverage and unavailable services. Prototype/sample values are not used as account data; feedback routes use the underlying live resource or an explicit unconfirmed state.
