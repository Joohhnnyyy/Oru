# Asset inventory
## Images (reference/marketing-assets → public/images)
hero: `city.jpg` (1024×512) **is the 3D environment map** (loaded by `Environment files=`), not a visible background; `hero_fallback.png`. statement: `timeline.png`. text-effects: inflate/glow/focus/halftone .png, word_glow.png, inflate/{b,c,k,l,o,s}.png.
## Embedded-only images (extracted → public/images/embedded, 46 unique)
24 ticker logos (10 are not in `logos/`: Disney, Eight Sleep, Atlantic, Ritual, IDEO, Hims & Hers, Harry's, Grüns, Olipop, Olly), feature/section screenshots (timeline, 3D carousel, template collage, webgl artwork, sticker timeline), dial + slider GIFs (1.2 MB / 450 KB), effect thumbnails, Butter logo svg. **All third-party logos & Butter marks are placeholders only (SPEC §9).**
## Models (public/models/keychain)
b_tag 5KB, butter_tag 82KB, carabiner 68KB, chain_link 4KB, circle_tag 7KB, gothic_tag 262KB, key 465KB. **All 7 are used** (not 4). Draco: `draco_decoder.wasm`, `draco_wasm_wrapper.js` (no `draco_decoder.js` fallback in export).
## Fonts
2 woff2 in export (DieGrotesk/ABCDiatype) — **not copied**.
## Videos — 51 embedded files → 33 unique mp4 (webm = alt sources of 04 & 37; 24 gallery files are 3× loop copies of 8). Compressed 15.6 MB → 11.5 MB.
- statement-*: wild, halftone-horses, justified, art-dept → Statement
- blocks-halftone-poppy → BlocksShowcase · customizable-editor → Customizable · toolkit-library → Toolkit
- features-media-panel, features-export-share → Features (Import/Edit/Enhance/Ship)
- threeways-describe-prompt, threeways-code → ThreeWays
- tpl-* (8) → Templates carousel · create-more-faster → "Create more, faster" · double-block-webgl → DoubleBlock
- looks-* (12) → "Get the look" (Justified Studio / Dedcool / Sad Wild Thing)
## Not carried over (per brief)
Metricool `widget.js`, `c3po.jpg`, Clarity, GTM, Meta/X/Bing pixels, Iubenda, Customer.io, `server.py`.
