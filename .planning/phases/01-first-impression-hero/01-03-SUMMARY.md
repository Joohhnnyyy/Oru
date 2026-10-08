---
phase: 01-first-impression-hero
plan: "03"
subsystem: 3d
tags: [react-three-fiber, threejs, webgl, physics, gltf]
requires:
  - phase: 01-first-impression-hero
    provides: Centered hero layout
provides:
  - Interactive 3D Keychain with Three.js & React Three Fiber
  - Local GLB models for carabiner, chain links, and 5 charms
  - Photorealistic chrome and frosted transmission materials
  - Spring-damper physics simulation with mouse pointer tracking and inertia
  - City HDRI environment reflections from local city.jpg
  - Bottom mask fade for seamless page blending
  - Graceful fallback for mobile, reduced-motion, and non-WebGL environments
affects: [first-impression-hero]
actuals:
  tokens: 1800
  tasks: 2
  commits: 1
tech-stack:
  added: []
  patterns: [Physics spring-damping integration in useFrame, GLTF preloading with Draco]
key-files:
  created:
    - butter-clone/src/three/KeychainScene.tsx
  modified:
    - butter-clone/src/sections/HeroSection/components/HeroMedia.tsx
key-decisions:
  - "Implemented physics spring-damper in useFrame matching chunk 6955 parameters (angular damping 2.9, linear damping 2.3)."
  - "Used local /images/hero/city.jpg for reflections and local Draco decoder."
  - "Desktop only loads 3D when prefers-reduced-motion is false, falling back gracefully to static image."
requirements-completed:
  - HERO-01
  - MEDIA-01
---

## Accomplishments
- Implemented `KeychainScene.tsx` with all 7 charms/models loaded from local `public/models/keychain/`.
- Configured chrome materials and physical transmission glass for the circle tag.
- Wired mouse position to spring-inertia torque and damping.
- Added bottom gradient mask fade on canvas.
- Integrated into `HeroMedia.tsx` with fallback image for mobile or reduced-motion.
