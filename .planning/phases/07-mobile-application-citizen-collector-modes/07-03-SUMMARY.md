# Phase 7 Plan 03 Summary: Collector Mode & Telemetry

**Phase:** 7 (Mobile Application: Citizen & Collector Modes)  
**Plan:** 03 of 03  
**Status:** Complete  
**Date:** 2026-10-09  

---

## 1. Delivered Capabilities

1. **HMAC-SHA256 Rotating TOTP QR Engine (`totp.ts`)**:
   - Time-synchronized 30-second window step generator matching backend `services/api/src/handlers/scans/verifyScan.ts`.
   - Generates client-side formatted tokens with remaining seconds countdown.

2. **Collector Mode Interface (`CollectorHomeScreen.tsx`)**:
   - High-contrast, single-hand friendly UI with prominent Hindi/English labeling.
   - Large rotating QR code occupying ~70% screen width.
   - Smooth 30-second animated countdown ring.
   - Shift metrics (citizen scans verified, collector credits earned).
   - "On Route" toggle enabling/pausing GPS transmission.
   - Quick simulation button for receiving citizen handovers (+10 GC).
   - Instant 1-tap role toggle back to Citizen mode.

3. **Live GPS Telemetry Service (`telemetry.ts`)**:
   - Location streaming service broadcasting coordinates every 15 seconds to Amazon Location Service tracker (`POST /v1/trucks/telemetry`).
   - Breadcrumb coordinate sequence through MCD Ward South 34.

4. **Android APK Packaging Configuration (`eas.json`)**:
   - Configured preview APK build profiles for EAS (Expo Application Services) direct sideload distribution.

---

## 2. Verification Evidence

- `pnpm --filter @saafsafari/mobile typecheck`: **PASSED** (0 errors).
- `pnpm -r typecheck`: **PASSED** across all packages in monorepo.
- Bi-directional persona switching and rotating QR countdown ring tested and verified.
