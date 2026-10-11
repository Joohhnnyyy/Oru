# Oru mobile: running the real (AWS-backed) demo

The app now talks to the deployed backend: Cognito sign-in, real QR scans with camera and GPS, and real photo proof through S3, Step Functions, Rekognition and Bedrock.

## 1. Install the new native modules (once)
```bash
cd ~/Oru/apps/mobile
npx expo install expo-camera expo-location expo-image-picker react-native-qrcode-svg
cd ~/Oru && pnpm install
```
`expo install` picks the versions that match your Expo SDK. Because these are native modules, rebuild the dev client / APK (`eas build -p android --profile preview`) or use Expo Go.

## 2. Create the demo accounts (once, after deploying the backend)
```bash
cd ~/Oru
pnpm seed          # re-seeds data and rotates all QR secrets
pnpm demo:users    # demo-citizen / demo-collector / demo-admin  (password in app.json extra.demoPassword)
pnpm demo:qr       # writes printable bin QR codes to docs/demo-qr/index.html
```

## 3. What happens in the app
| Screen | Real flow |
|---|---|
| Launch | Signs in to Cognito as `demo-citizen` and loads `/v1/me` (onboards on first run) |
| Persona switch → Collector | Signs in as `demo-collector` and shows a **server-signed rotating QR** (`GET /v1/collector/qr-token`) that refreshes every 30 s and reports the phone's GPS (also sent to the Amazon Location tracker) |
| Scan | Camera reads an Oru QR → `POST /v1/scans` with GPS. A truck QR pays the citizen **and** the collector (+2 GC) in one DynamoDB transaction |
| Photo proof | Camera photo → presigned S3 upload → EventBridge → Step Functions → Rekognition + Bedrock Nova → verdict and reasoning shown in the app |

## 4. Recording tips
- **Truck handover:** use two phones (collector and citizen) standing together. Proximity is checked against the collector phone's live GPS, within 150 m.
- **Bin scan:** bins are geofenced (75 m) at their Delhi coordinates. For a demo elsewhere, register a bin at your location with `POST /v1/admin/qr-sources` (signed in as demo-admin), then run `pnpm demo:qr` again.
- **Photo proof:** a real cleanup or segregated-bins photo works best. Screenshots and photos of screens are rejected by design.
