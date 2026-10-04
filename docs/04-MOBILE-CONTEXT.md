# SaafSafari — Mobile App Context (Expo / React Native)

The mobile app is the **primary citizen surface** (QR scanning, camera proofs, GPS) and the **Collector mode** for truck drivers and kabadiwalas. Target: Android first (APK via EAS for the demo); iOS builds later from the same code.

Reality check for a 4-day hackathon: one developer can ship Expo + web only if they share `packages/shared`, `packages/game-rules` and `packages/ui-tokens`. Do not duplicate types or rules in the app.

---

## 1. Stack
| Concern | Choice |
|---|---|
| Framework | Expo SDK (latest stable) + Expo Router (file-based), TypeScript strict |
| Server state | TanStack Query + `@tanstack/query-async-storage-persister` (cached tasks/territories offline) |
| Client state | Zustand |
| Auth | `aws-amplify` v6 Auth + `@aws-amplify/react-native` (Cognito email OTP, Google via hosted UI + `expo-web-browser`) |
| Secure storage | `expo-secure-store` (tokens), AsyncStorage (cache) |
| Camera / QR | `expo-camera` (CameraView with barcode scanning, QR only) |
| Location | `expo-location` (foreground for citizens; background task for Collector mode via `expo-task-manager`) |
| Maps | `@maplibre/maplibre-react-native` with Amazon Location style URL (API key) — requires a dev build (not Expo Go) |
| Hex grid | `h3-js` |
| Images | `expo-image-picker` (camera only, no gallery for proofs), `expo-image-manipulator` (resize to 1280 px, JPEG 0.7), keep EXIF |
| QR display (collector) | `react-native-qrcode-svg` |
| Notifications | `expo-notifications` (Expo push service; token registered to backend) |
| Animations | Reanimated + Lottie for mascot mood transitions |
| i18n | i18next + `expo-localization`; EN/HI |
| Haptics | `expo-haptics` on scan success |
| Build | EAS Build (`preview` profile → APK), EAS Update for OTA fixes during judging |

## 2. Folder structure
```
apps/mobile/
├── app.config.ts                    # reads EXPO_PUBLIC_* env, permissions text in EN/HI
├── eas.json
├── app/                             # Expo Router
│   ├── _layout.tsx                  # providers, auth gate, i18n, query client
│   ├── (auth)/{sign-in,verify}.tsx
│   ├── (onboarding)/{language,location,home-reveal}.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx              # tabs: Home, Map, Scan (center FAB), Tasks, Profile
│   │   ├── index.tsx                # Home
│   │   ├── map.tsx
│   │   ├── scan.tsx
│   │   ├── tasks.tsx
│   │   └── profile.tsx
│   ├── territory/[h3].tsx
│   ├── submit/[taskId].tsx          # camera proof flow (single / before-after)
│   ├── submission/[id].tsx          # status
│   ├── wallet.tsx
│   ├── coupons/index.tsx
│   ├── coupons/[merchantId].tsx
│   ├── leaderboards.tsx
│   ├── assistant.tsx                # Saaf Mitra (P2)
│   └── collector/
│       ├── _layout.tsx              # guard: cognito group "collector"
│       ├── index.tsx                # big rotating QR + today's scan count + earnings
│       └── route.tsx                # sharing-location toggle, route status
├── src/
│   ├── lib/{api,auth,map,h3,format,env}.ts
│   ├── lib/offlineQueue.ts          # P2: queued scans/submissions with original timestamp + location
│   ├── tasks/backgroundLocation.ts  # collector position task (TaskManager)
│   ├── hooks/                       # same names as web: useMe, useTasks, useTerritories, useWallet...
│   ├── components/
│   │   ├── mascot/{Mascot,MoodLottie,HealthRing}.tsx
│   │   ├── map/{TerritoryMap,TruckMarkers,DropPointMarkers}.tsx
│   │   ├── scan/{ScannerView,ScanOverlay,ScanResultSheet}.tsx
│   │   ├── proof/{CameraCapture,BeforeAfterFlow,UploadProgress}.tsx
│   │   ├── credits/{CreditPop,Breakdown}.tsx
│   │   ├── tasks/{TaskCard,PeriodTabs,CommunityGoalBar}.tsx
│   │   └── ui/                      # Button, Card, Sheet, Toast, Skeleton
│   └── i18n/{en.json,hi.json}
└── assets/{mascots,lottie,fonts}
```

## 3. Permissions (copy must be explicit, shown before the OS prompt)
| Permission | When asked | Why (shown to user) |
|---|---|---|
| Camera | First scan / first proof | "To scan bin & truck QR codes and take proof photos" |
| Location (foreground) | Onboarding | "To find your home territory and verify you're at the drop point" |
| Location (background) | Collector mode only | "So citizens can see your truck/cart on the map while you're on route" (foreground service notification on Android) |
| Notifications | After first reward | "Truck nearby, bounties in your area, streak reminders" |

## 4. Core flows

### Scan (P0)
1. `scan.tsx` opens `CameraView` with `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`; ignore non-`saaf://` payloads.
2. On read: pause scanner, haptic, get `Location.getCurrentPositionAsync({ accuracy: High })` (timeout 8 s; if accuracy > 100 m show "Move to open sky" hint and retry once).
3. POST `/v1/scans` with `Idempotency-Key` generated **once per QR read** (reuse on retry).
4. Success → `ScanResultSheet`: CreditPop, breakdown, task progress ticks, territory health delta, mascot mood change animation if `moodChanged`.
5. Errors → localized messages (`COOLDOWN_ACTIVE`, `OUT_OF_RANGE` with distance, `TOKEN_EXPIRED` → "Ask the driver to refresh the QR").

### Photo proof (P1)
1. Camera only (no gallery) to reduce fakes. Before/after tasks force two captures with a ghost overlay of the "before" frame to match angle.
2. Resize → request presigned POST → upload with progress → navigate to `submission/[id]` which polls status (3 s × 20), then shows "Under review" with push notification on decision.

### Collector mode (P0 for trucks/kabadiwalas)
- Full-screen QR (`react-native-qrcode-svg`, size ≈ 70% width, max brightness via `expo-brightness`), countdown ring, auto-refresh at 25 s from `GET /v1/collector/token`.
- Toggle "On route": starts background location task posting every 15 s to `/v1/collector/position` (batch if offline).
- Shows today's scans and GC earned — this is the informal-recycler incentive; show it in the video.
- Large text, Hindi default, minimal UI — assume low literacy and a cheap phone.

### Onboarding
Language → explain 3 slides (Do → Verify → Earn & heal your territory) → location → `POST /v1/onboarding` → **Home reveal**: map zooms to the hex, mascot Lottie plays in its current mood, line like "Your territory: Dolphin Domain — Yamuna Bank. Health 18. The dolphin needs you."

## 5. Offline & low-end device behaviour
- Cache last territories, tasks, wallet with the query persister; app opens to cached state with an "Offline" pill.
- P2 offline queue: store `{type, payload, capturedAt, lat, lng, idemKey}`; on reconnect replay in order. Server accepts `clientTs` up to 30 min old for static QR scans only (rotating tokens expire — tell the user to scan again).
- Map: disable 3D/pitch, cap max zoom 17, limit symbol layers. Keep JS bundle lean; no heavy chart libs in mobile.
- Target: cold start < 3 s on a ₹8–10k Android phone; test on a real low-end device or emulator with 2 GB RAM profile.

## 6. Env (`apps/mobile/.env`)
```
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_COGNITO_USER_POOL_ID=
EXPO_PUBLIC_COGNITO_CLIENT_ID=
EXPO_PUBLIC_COGNITO_DOMAIN=
EXPO_PUBLIC_LOCATION_STYLE_URL=   # https://maps.geo.ap-south-1.amazonaws.com/v2/styles/Standard/descriptor?key=...
EXPO_PUBLIC_ASSET_CDN_URL=
EXPO_PUBLIC_AWS_REGION=ap-south-1
```

## 7. eas.json (minimum)
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "android": { "buildType": "apk" }, "distribution": "internal" },
    "production": {}
  }
}
```
MapLibre and background location need a **development build**; budget 20–30 min for the first EAS build on Day 1 so it doesn't block Day 2.

## 8. Shared with web (import, never copy)
- `packages/shared`: zod schemas, API types, error codes.
- `packages/game-rules`: expected-credit preview on task cards (client shows the same number the server will award).
- `packages/ui-tokens`: animal colours, mood labels, spacing.

## 9. Done criteria for the demo
- APK installed on two phones: one in Collector mode showing rotating QR + live location, the other scanning it and receiving credits with breakdown; mascot changes mood on screen.
- A before/after cleanup proof is auto-approved by the Bedrock pipeline within ~15 s.
- Coupon redeemed; code shown with copy button.
