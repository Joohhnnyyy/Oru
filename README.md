# Butter Video — Engineered for Creativity

A high-fidelity, responsive clone of [butter.video](https://www.butter.video/), featuring:
- **Interactive 3D Hero Keychain**: Real-time spring-damper inertia physics (calibrated angular & linear damping), metallic chrome finishes, frosted physical glass transmission, and cursor reactivity powered by **Three.js** and **React Three Fiber**.
- **15-Section Architecture**: Complete marketing timeline layout matching the official site.
- **Authentic Assets & Video Demonstrations**: 24 brand ticker logos, 33 compressed demonstration videos, and embedded design controls (dials, multi-sliders, timelines, and WebGL artworks).
- **Responsive & Accessible**: Keyboard-operable `Product` dropdown with outside dismiss, skip-to-content links, touch-friendly template carousel, and reduced-motion fallbacks.

---

## 📁 Project Structure

```text
├── butter-clone/               # Vite + React + TypeScript + Tailwind CSS application
│   ├── public/
│   │   ├── draco/              # Draco 3D geometry decoders
│   │   ├── images/             # Embedded graphics, text effects, timeline frames
│   │   ├── models/keychain/    # 7 GLB 3D keychain models (carabiner, charms, links)
│   │   └── videos/             # 33 demonstration MP4s (templates, features, looks)
│   ├── src/
│   │   ├── components/         # Navigation, Header, Footer, IntroOverlay, LogoTrack
│   │   ├── sections/           # 15 distinct marketing sections
│   │   ├── three/              # KeychainScene.tsx (3D R3F Canvas & physics rig)
│   │   └── hooks/              # useHomeMotion, useLenis, useReducedMotion
│   └── package.json
├── migration-docs/             # Extracted layout, token, asset, and animation catalogs
├── .planning/                  # GSD planning contracts and roadmap
└── README.md
```

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js 20+
- `npm` or `pnpm`

### 1. Install Dependencies
```bash
cd butter-clone
npm install
# or: pnpm install
```

### 2. Start Development Server
```bash
npm run dev
# or: pnpm dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📦 How to Push to Git / GitHub

A root `.gitignore` is already pre-configured to exclude `node_modules/`, `dist/`, logs, and temporary environment files.

To push this project to your GitHub repository:

### Step 1: Stage All Files
```bash
git add .
```

### Step 2: Make Initial Commit
```bash
git commit -m "feat: complete Butter clone with 3D keychain, animations, and 15 sections"
```

### Step 3: Link to Your GitHub Repository
Create a new repository on [GitHub](https://github.com/new), then run:
```bash
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git branch -M main
git push -u origin main
```

---

## 🛠 Tech Stack
- **Framework**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS 4 + Custom Easing Curves
- **3D & Graphics**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Animation & Smooth Scroll**: GSAP + ScrollTrigger + Lenis
