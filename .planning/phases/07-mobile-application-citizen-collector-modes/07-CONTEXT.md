# Phase 7: Mobile Application (Citizen & Collector Modes) — Context & Scope

## 1. Executive Summary

Phase 7 implements the Android/cross-platform mobile application for SaafSafari within `apps/mobile`, built with Expo (React Native) + TypeScript in accordance with **Part B** of `apps/SITEMAP-WEB-AND-MOBILE.md`.

The mobile app provides two dedicated operational modes:
1. **Citizen Mode**:
   - Tab 1: **Home** (Territory hero with mascot, health ring, stats, today's tasks, nearby trucks and drop points, community goals)
   - Tab 2: **Map** (Full-screen territory map with H3 cells, mascots, live truck markers, bottom sheets for territories and drop points)
   - Tab 3: **Scan** (Camera QR scanner with frame overlay, torch, location accuracy, comprehensive scan result / error sheets, photo proof upload)
   - Tab 4: **Tasks** (Daily, weekly, monthly, and bounty tasks, photo proof flow, quizzes)
   - Tab 5: **Profile** (User stats, Green Credit wallet & ledger, eco-merchant coupons, voucher codes, leaderboards, settings)
2. **Collector Mode** (Role `collector`):
   - Simplified, high-contrast, one-hand friendly UI (Hindi/English)
   - 30-second rotating TOTP QR token generation screen with countdown progress ring
   - Live GPS route broadcasting to Amazon Location Service tracker
   - Shift metrics and collector credit incentive tally

Both modes connect directly to the live backend deployed in AWS `ap-south-1` (`https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com`) and authenticate via Cognito User Pool (`ap-south-1_KZcMN2CaO`).

---

## 2. Requirements & Traceability

| Requirement | Description | UI / Feature Target |
|-------------|-------------|---------------------|
| **AUTH-01** | Cognito Email OTP passwordless authentication & persistent JWT session | B1: Launch, Sign In, Verify Code, Onboarding Flow |
| **MAP-01** | Interactive territory map with H3 polygons and animal mascots | B3: Tab 2 Map & Territory Detail Sheet |
| **TRK-01** | Live truck tracking visualization and distance alerts | B2: Nearby Truck Card & B3: Live Truck Markers |
| **QR-01** | Camera QR scanning for static drop point / bin codes with GPS geofence checks | B4: Tab 3 Scan & Scan Result Sheet |
| **QR-02** | Dynamic rotating HMAC QR token verification for collector handovers | B4: Scanner verification against live backend |
| **COL-01** | Bi-modal collector interface with 30s rotating TOTP QR display | B7: Collector Mode Home & Rotating QR Screen |
| **COL-02** | Collector live GPS location broadcasting for territory arrival | B7: Collector Route Tracking & Location Sharing |
| **TASK-01** | Tabbed task board (Daily/Weekly/Monthly) with completion bonus | B5: Tab 4 Tasks & Task Detail Screens |
| **WALT-01** | Green Credit balance, XP progression, and transaction ledger | B6: Profile -> Wallet & Ledger Screens |
| **WALT-02** | Eco-merchant coupons and voucher redemption | B6: Profile -> Coupons & Active Vouchers |

---

## 3. Technology Stack & Key Decisions

- **Framework**: Expo (React Native) + TypeScript in `apps/mobile`.
- **Navigation**: React Navigation (Bottom Tabs for Citizen mode, Stack navigator for Onboarding, Scanner, and Modal sheets).
- **Styling**: NativeWind / StyleSheet with calibrated design tokens matching the web design system (Forest Emerald `#10B981`, Deep Charcoal `#1E1E1E`, Amber Gold `#F59E0B`, Clean White `#FAFAFA`).
- **Camera & Barcode**: `expo-camera` / barcode scanning with torch and permission primers.
- **Location & Sensors**: `expo-location` for GPS coordinates, distance calculation, and background telemetry.
- **API & Data**: Axios / Fetch client connected to live API Gateway (`https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com`).
- **Icons**: `@expo/vector-icons` (Lucide / Feather / MaterialCommunityIcons).
- **Demo Mode**: Built-in 1-tap Persona Switcher (Citizen Aarav Sharma vs Collector Rajesh Kumar vs Municipal Admin) for instant hackathon jury testing.

---

## 4. Plan Breakdown

- **07-01-PLAN.md**: Expo Foundation, Navigation Shell, Authentication & Onboarding, Demo Persona Switcher (`AUTH-01`).
- **07-02-PLAN.md**: Citizen Mobile Experience: Home Hero, Interactive Map, Camera Scanner, Task Board, Wallet & Coupons (`MAP-01`, `QR-01`, `TASK-01`, `WALT-01`, `WALT-02`).
- **07-03-PLAN.md**: Collector Mobile Mode: Rotating TOTP QR Engine, GPS Location Sharing, Collector Shift Metrics, and Android EAS Build (`QR-02`, `COL-01`, `COL-02`, `TRK-01`).
