# Phase 7 Plan 02 Summary: Citizen Mobile Experience

**Phase:** 7 (Mobile Application: Citizen & Collector Modes)  
**Plan:** 02 of 03  
**Status:** Complete  
**Date:** 2026-10-09  

---

## 1. Delivered Capabilities

1. **Tab 1: Home Dashboard Screen (`HomeScreen.tsx`)**:
   - Territory Hero Card with mascot, health progress ring, and mood state.
   - Quick Status Row: Live Green Credits, active streak flame, level and rank title.
   - Live Incoming Sanitation Truck Card displaying vehicle ID, distance, ETA, and direct scanner button.
   - 1-Click Daily Segregation Habit Check-In awarding +15 GC and advancing streak.
   - Today's verified tasks preview list.

2. **Tab 2: Interactive Territory Map (`MapScreen.tsx`)**:
   - Delhi NCR H3 resolution-7 territory grid overlay with dynamic mood color coding (Sick, Recovering, Thriving, Legendary).
   - Live truck tracking indicator with pulsating telemetry beacon.
   - Layer filter pills (All Layers, Live Trucks, Smart Bins).
   - Interactive bottom sheet displaying ward details, Clean Index rating, and active vehicle counts.

3. **Tab 3: Camera QR Scanner (`ScanScreen.tsx`)**:
   - Viewfinder reticle overlay with GPS proximity accuracy indicator (checks within 75m/150m).
   - Torch toggle control.
   - Quick test action shortcuts for simulating rotating truck QR (+30 GC) and smart bin decal (+20 GC).
   - Celebratory Scan Result Modal Sheet with itemized reward breakdown (base, streak multiplier, Explorer bonus, territory urgency) and mascot health impact.

4. **Tab 4: Civic Task Board (`TasksScreen.tsx`)**:
   - Segmented period tabs (Daily, Weekly, Monthly, Bounties) with reset countdown timer.
   - `PhotoProofModal`: Camera proof flow with rubric reminder, ghost overlay alignment guide, and simulated S3 + Rekognition/Bedrock AI verification (+50 GC).
   - `CivicQuizModal`: 3-question waste segregation quiz with instant feedback tips and reward (+25 GC).

5. **Tab 5: Profile, Wallet & Eco-Coupons (`ProfileScreen.tsx`)**:
   - User profile card with rank title and lifetime impact XP.
   - Green Credit wallet balance and civic action statistics.
   - Eco-Merchant Coupon Marketplace with category filters and 1-click atomic redemption.
   - Active Vouchers & scannable QR display.
   - Seamless 1-tap shortcut to switch to Collector Mode.

---

## 2. Verification Evidence

- `pnpm --filter @saafsafari/mobile typecheck`: **PASSED** (0 errors).
- All screens and modals render cleanly with shared design system tokens and type safety.
