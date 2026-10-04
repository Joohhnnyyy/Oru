# Phase 6: Web Applications (Citizen Portal & Municipal Console) — Context & Scope

## 1. Executive Summary

Phase 6 implements the web client applications for SaafSafari within `apps/web`:
1. **Citizen Web Portal**: Responsive web experience for citizens to track territory environmental health, inspect Uber H3 hexagonal cells with interactive mascots, complete daily habit check-ins, manage Green Credit wallets, redeem merchant coupons, and compete on leaderboards.
2. **Municipal Admin Console**: High-density operational dashboard for municipal ward admins (`ward_admin`) to monitor citywide territory health across 61 wards, view illegal dumping hotspot density heatmaps, register smart dustbins/trucks with printable QR codes, and resolve AI-flagged photo proof submissions.

Both portals connect directly to the live backend deployed in AWS `ap-south-1` (`https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com`) and authenticate via Cognito User Pool `ap-south-1_KZcMN2CaO`.

---

## 2. Requirements & Traceability

| Requirement | Description | UI Target |
|-------------|-------------|-----------|
| **MAP-01** | Interactive MapLibre map displaying H3 res-7 hexagonal cells colored by mascot/health | Citizen & Admin Map Views |
| **MAP-02** | Inspect territory details: Health (0-100), active animal mascot, 4 mood states (Sick, Recovering, Thriving, Legendary) | Territory Detail Drawer / Modal |
| **WALT-01** | View Green Credit balance, lifetime XP, tier title (Beej to Van Rakshak), and transaction history | Citizen Wallet Screen |
| **WALT-02** | Browse eco-merchant coupons and redeem rewards via atomic conditional API with unique redemption codes | Coupon Marketplace & Modal |
| **LEAD-01** | View weekly individual leaderboards for home territory and citywide rankings | Leaderboard Tab |
| **LEAD-02** | View territory-vs-territory competitive rankings based on weekly health gains | Leaderboard Tab |
| **ADM-01** | Ward admins view ward-level territory health overview and hotspot density heatmap | Municipal Console Dashboard |
| **ADM-02** | Ward admins register and manage QR sources (bins, trucks, e-waste) and export printable QR codes | Municipal QR Registry |
| **ADM-03** | Ward admins review flagged photo submissions, approve/reject with feedback, completing Step Functions callbacks | Municipal Review Queue |

---

## 3. Technology Stack & Key Decisions

- **Framework**: Vite + React 19 + TypeScript in `apps/web`.
- **Styling**: Tailwind CSS with custom theme tokens (Forest Emerald, Warm Saffron Amber, Clean Sky Blue, Dark Slate).
- **Map & Geospatial**: MapLibre GL JS with Amazon Location Service tile endpoints / OpenStreetMap vector basemaps, rendering GeoJSON H3 polygon overlays from `@saafsafari/game-rules`.
- **Authentication**: Amazon Cognito Identity JS / AWS SDK Cognito client with passwordless Email OTP + 1-click Demo Persona switcher (Aarav - Citizen, Ward 34 Admin) for frictionless hackathon judge evaluation.
- **State Management & Data Fetching**: Lightweight React hooks + authenticated API client leveraging `@saafsafari/shared` types and schemas.
- **Icons & Motion**: Lucide React icons with fluid CSS transitions and glassmorphism cards.
- **Hosting**: Prepared for AWS Amplify Hosting build artifact generation.

---

## 4. Plan Breakdown

- **06-01-PLAN.md**: Web Foundation, Cognito Authentication, Navigation Shell, and Interactive MapLibre H3 Territory Map (`MAP-01`, `MAP-02`).
- **06-02-PLAN.md**: Citizen Experience: Deterministic Task Board, Wallet, Coupon Catalog & Atomic Redemption, and Leaderboards (`WALT-01`, `WALT-02`, `LEAD-01`, `LEAD-02`).
- **06-03-PLAN.md**: Municipal Admin Console, Hotspot Heatmap, QR Registry Manager, Review Queue, and Amplify Hosting Build (`ADM-01`, `ADM-02`, `ADM-03`).
