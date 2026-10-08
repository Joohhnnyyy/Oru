# External Integrations

**Analysis Date:** 2026-10-08

## APIs & External Services

**Browser-only frontend:**
- No backend or remote API client is configured in the app manifests or source tree under `butter-clone/src/`
- The product uses browser-native APIs such as `IntersectionObserver`, pointer events, WebGL, and smooth-scroll integration rather than external service calls

**Asset/CDN loads:**
- Google Fonts are imported in `butter-clone/src/index.css`
  - Service: Google Fonts
  - Usage: `Inter`, `Space Grotesk`, and `JetBrains Mono` for the landing page UI
  - Auth: none
- The 3D hero uses the `Environment preset="city"` helper from `@react-three/drei`
  - Service: PMNDRS environment assets loaded in-browser
  - Usage: lighting for the hero model scene
  - Auth: none

## Data Storage

**Databases:**
- None detected; the project is a static marketing landing page with no persistence layer

**File Storage:**
- Local static assets in `butter-clone/public/` for images, videos, logos, and `.glb` models

**Caching:**
- No custom cache layer is configured; caching is left to the browser and static asset hosting

## Authentication & Identity

**Auth Provider:**
- No auth provider or identity system is implemented
  - Implementation: static front-end-only page, no login/session flow

## Monitoring & Observability

**Error Tracking:**
- None detected in the project manifests or source code

**Logs:**
- No application logging framework is configured; behavior is primarily UI-render and animation focused

## CI/CD & Deployment

**Hosting:**
- Static Vite front-end build is implied by the project configuration; no deployment platform is configured in the repo

**CI Pipeline:**
- No CI workflow files were detected in the scanned project root

## Environment Configuration

**Required env vars:**
- None detected; there are no app-specific environment variables or runtime config loaders in the codebase

**Secrets location:**
- Not applicable for this static front-end application; no remote secrets or credential configuration is used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None; no API integration layer or webhook handler is implemented in the app

---

*Integration audit: 2026-10-08*
