# Phase 6: Web Applications — Research & Technical Specifications

## 1. Frontend Architecture & Package Setup

### Workspace Integration
`apps/web` is a member of the pnpm workspace monorepo. It consumes:
- `@saafsafari/shared`: TypeScript types, Zod schemas (`UserProfile`, `TaskBoardResponse`, `WalletResponse`, `AdminTerritoryOverview`, `ReviewQueueItem`, etc.).
- `@saafsafari/game-rules`: Pure gamification logic, tier calculations, mascot definitions, H3 territory geometries (`DELHI_TERRITORIES`).

### Dependencies Needed for `apps/web`
- **Core**: `react` (^19.0.0), `react-dom` (^19.0.0), `vite` (^6.0.0).
- **Styling**: `tailwindcss` (^3.4.0), `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`.
- **Icons**: `lucide-react` (^1.0.0).
- **Maps**: `maplibre-gl` (^4.0.0).
- **QR Display**: `qrcode.react` (^4.0.0).
- **AWS Auth**: `@aws-sdk/client-cognito-identity-provider` (^3.700.0).

---

## 2. MapLibre GL Integration with H3 Territory Polygons

### GeoJSON Transformation
`DELHI_TERRITORIES` contains 61 res-7 territories with `boundary: [lat, lng][]`.
MapLibre / GeoJSON standard expects `[lng, lat]` coordinates for polygons, closed with the first coordinate matching the last.

```typescript
export function territoriesToGeoJson(territories: TerritoryMetadata[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: territories.map((t) => {
      const coordinates = [...t.boundary.map(([lat, lng]) => [lng, lat]), [t.boundary[0][1], t.boundary[0][0]]];
      return {
        type: 'Feature',
        id: t.h3Index,
        properties: {
          id: t.h3Index,
          name: t.name,
          ward: t.ward,
          mascot: t.mascot,
          health: t.health,
          mood: t.moodState,
          cleanIndex: t.cleanIndex,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };
    }),
  };
}
```

### Layer Styling & Paint Rules
- **Fill Layer**: Colored dynamically using MapLibre data expressions based on `health` or `mood`:
  - Sick (`#EF4444` / 0.4 opacity)
  - Recovering (`#F59E0B` / 0.45 opacity)
  - Thriving (`#10B981` / 0.5 opacity)
  - Legendary (`#8B5CF6` / 0.55 opacity)
- **Line Layer**: Border outline with highlight state on hover/selection (`#FFFFFF`, width: 2).
- **Center Symbols**: Mascot avatar or name label at `centerLat`, `centerLng`.

---

## 3. Authentication & Persona Switcher

To support seamless hackathon judging and live evaluation:
1. **Direct Cognito Auth**: Email OTP login against User Pool `ap-south-1_KZcMN2CaO`.
2. **Demo Persona Switcher**:
   - **Citizen Persona (Aarav Sharma)**: Pre-authenticated token or seed credential (`aarav.sharma@saafsafari.demo`), unlocks full citizen view, 420 GC balance, tier Van Rakshak.
   - **Municipal Admin Persona (Ward 34 Admin)**: Pre-elevated `ward_admin` credential (`ward34.admin@mcd.gov.in`), unlocks Cedar-protected municipal overview, review queue, and QR source management.
3. **Session Management**: Session store persists ID token, user profile, and active role in `localStorage` and provides an authenticated `fetch` wrapper injecting `Authorization: Bearer <idToken>`.

---

## 4. UI/UX Design System Specifications

### Typography & Colors
- **Font**: Inter & Outfit via Google Fonts.
- **Theme Palette**:
  - Dark Surface Base: `#0B0F19` (Void Navy)
  - Panel Background: `#111827` (Card Surface) with `backdrop-filter: blur(12px)`
  - Primary Accent: `#10B981` (Emerald Green)
  - Secondary Accent: `#F59E0B` (Warm Saffron)
  - Neutral Muted: `#94A3B8` (Cool Grey)
  - Text Primary: `#F8FAFC`
- **Component Patterns**:
  - Stat cards with glowing micro-indicators.
  - Mascot preview cards displaying mood animations and health progress bars.
  - Interactive coupon redeem sheet showing instant QR code and barcode.
  - High-density admin table with sortable columns and review modal with Rekognition badge tags.
