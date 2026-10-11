# Oru — Engineered for Creativity

[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white)](https://greensock.com/)

A modern, high-fidelity creative video editor and platform landing page engineered for high-performance creative workflows, video editing, and interactive web experiences. Inspired by Butter, built under the **Oru** brand identity.

---

## 🌟 Key Highlights

- **Interactive 3D Hero Keychain**: Real-time spring-damper inertia physics (calibrated angular and linear damping), metallic chrome finishes, frosted physical glass transmission, and cursor reactivity powered by **Three.js** and **React Three Fiber** (`@react-three/fiber` & `@react-three/drei`).
- **15-Section Marketing Architecture**: Modular sections covering product showcases, interactive dials and multi-sliders, text effects, video demos, and draggable carousels.
- **GSAP & Lenis Smooth Scroll**: Unified 60fps scrolling engine driven by `gsap.ticker` and Lenis with full `prefers-reduced-motion` compliance.
- **Curated Asset Suite**: 24 brand ticker logos, 33 compressed demonstration videos, and custom vector brandmarks (`oru-logo.svg`, `oru-footer-wordmark.svg`).
- **GSD Engineering Governance**: Managed with structured Get Shit Done (GSD) milestones, specifications, and state tracking in [`.planning/`](file:///Users/anshjohnson/Oru-main/.planning).

---

## 📁 Repository Structure

```text
Oru-main/
├── .planning/                  # GSD planning contracts, roadmap, and state
│   ├── PROJECT.md              # Living project context & active scope
│   ├── REQUIREMENTS.md         # Formal requirements & acceptance criteria
│   ├── ROADMAP.md              # Project phases and milestones
│   └── STATE.md                # Real-time state memory & metrics
├── migration-docs/             # Extracted layout, token, and animation catalogs
│   ├── animations.md           # Motion specifications & easing curves
│   ├── asset-catalog.md        # Media index & video deduplication map
│   ├── design-tokens.md        # Typography, radius, and color definitions
│   └── layout.md               # 15-block structural breakdown
├── oru/                        # Core Vite + React application
│   ├── public/
│   │   ├── draco/              # Draco 3D geometry decoders
│   │   ├── images/             # Embedded graphics, text effects, timeline frames
│   │   ├── models/keychain/    # 7 GLB 3D keychain models
│   │   └── videos/             # 33 demonstration MP4 clips
│   ├── src/
│   │   ├── components/         # Navbar, Footer, IntroOverlay, LogoTrack, UI shell
│   │   ├── sections/           # 15 modular page sections
│   │   ├── three/              # KeychainScene.tsx (3D physics rig & canvas)
│   │   ├── hooks/              # useHomeMotion, useLenis, useReducedMotion
│   │   ├── lib/                # GSAP and Lenis singletons
│   │   └── index.css           # Tailwind v4 theme tokens & custom curves
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── reference/                  # Upstream reference export (read-only)
├── README.md                   # This project guide
└── SPEC.md                     # Engineering specification & rules
```

---

## 🎨 Design System & Tokens

Defined in [`oru/src/index.css`](file:///Users/anshjohnson/Oru-main/oru/src/index.css) using Tailwind CSS v4 `@theme`:

| Token | Hex | Usage |
|---|---|---|
| `--color-oru-white` | `#FAFAFA` | Primary page background |
| `--color-oru-off-white` | `#F7F7F7` | Card and secondary panel fills |
| `--color-oru-black` | `#1E1E1E` | Primary typography & dark accents |
| `--color-oru-true-black` | `#0F0F0F` | High-contrast overlays |
| `--color-oru-charcoal` | `#3C3C3C` | Body copy and muted headers |
| `--color-oru-light-grey` | `#EDEDED` | Media frames and border accents |
| `--color-oru-dark-grey` | `#E2E2E2` | Dividers and subtle outlines |
| `--color-oru-blue` | `#4DC5E5` | Brand interactive highlights |
| `--color-oru-green` | `#63AD45` | Accent callouts |
| `--color-oru-yellow` | `#E9D352` | Accent callouts |

> [!NOTE]
> Backward-compatible `--color-butter-*` aliases are preserved alongside `--color-oru-*` to ensure zero breaking changes across existing components.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20 or higher
- **Package Manager**: `pnpm` (recommended) or `npm`

### 1. Install Dependencies
```bash
cd oru
pnpm install
```

### 2. Start Development Server
```bash
pnpm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for Production
```bash
pnpm run build
```
Executes TypeScript type-checking (`tsc -b`) and bundles production assets via Vite into `oru/dist/`.

### 4. Lint & Code Quality
```bash
pnpm run lint
```
Runs high-speed static analysis with Oxlint.

---

## 🧩 Page Sections Overview

The landing page implements the complete 15-block flow:

| # | Section | Key Component | Content / Interaction |
|---|---|---|---|
| 1 | **Intro Overlay** | [`IntroOverlay.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/components/IntroOverlay.tsx) | Timed launch screen: *"Experience Oru."* |
| 2 | **Navbar** | [`Navbar.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/components/Navbar.tsx) | Floating pill navigation, dropdown panel, mobile drawer |
| 3 | **Hero** | [`Hero.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Hero.tsx) | Headline, CTA button, interactive 3D physics keychain |
| 4 | **Logo Marquee** | [`LogoMarquee.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/LogoMarquee.tsx) | Infinite horizontal brand logo ticker with edge masks |
| 5 | **Statement** | [`Statement.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Statement.tsx) | Editorial statement: *"Oru is the first video editor..."* |
| 6 | **Blocks Showcase** | [`BlocksShowcase.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/BlocksShowcase.tsx) | Interactive effect cards: Inflate, Glow, Focus, Halftone |
| 7 | **Customizable** | [`Customizable.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Customizable.tsx) | Interactive dial & multi-slider control demonstration |
| 8 | **Creative Toolkit** | [`Toolkit.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Toolkit.tsx) | Curated component library and media storage flow |
| 9 | **Features** | [`Features.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Features.tsx) | 4-step workflow: Import, Edit, Enhance, Ship |
| 10 | **Content Production** | [`ContentProduction.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/ContentProduction.tsx) | Accelerated timeline demonstration video |
| 11 | **Product Highlights** | [`ProductHighlights.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/ProductHighlightsSection/ProductHighlights.tsx) | Dual highlight cards with WebGL artwork and timeline |
| 12 | **Three Ways** | [`ThreeWays.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/ThreeWays.tsx) | Tabbed creation pathways: Remix, Describe, Code |
| 13 | **Get The Look** | [`GetTheLook.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/GetTheLook.tsx) | Accordion look selector with reactive video grid |
| 14 | **Templates** | [`Templates.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/sections/Templates.tsx) | Draggable brand template carousel |
| 15 | **Footer** | [`Footer.tsx`](file:///Users/anshjohnson/Oru-main/oru/src/components/Footer.tsx) | Column navigation, giant Oru wordmark, legal & attribution |

---

## 🛠 Tech Stack Details

- **UI & Architecture**: React 19, TypeScript strict mode, Vite 8
- **Styling**: Tailwind CSS v4, custom CSS easing curves (`--ease-in-out`), JetBrains Mono & Space Grotesk typography
- **3D Engine**: Three.js r186, React Three Fiber, React Three Drei, Draco 3D mesh compression
- **Animation**: GSAP 3.15, ScrollTrigger, Lenis smooth scrolling
- **Linting**: Oxlint

---

## 📜 Attribution & Legal

- **Brand**: Oru
- **Original Concept**: Inspired by the marketing design of Butter ([butter.video](https://www.butter.video/)).
- **Attribution Note**: *"Copyright © 2026 Oru. Design inspired by Butter."*
