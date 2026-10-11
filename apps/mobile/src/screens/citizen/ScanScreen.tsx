import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable, Modal, ActivityIndicator, Linking } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Location from 'expo-location';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { Confetti, PopIn, CountUp } from '../../components/Motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { typography } from '../../theme/tokens';
import { api, ApiError, ScanResult } from '../../services/api';

const SvgComp = Svg as any;
const DefsComp = Defs as any;
const GradComp = LinearGradient as any;
const StopComp = Stop as any;
const RectComp = Rect as any;

/** QR codes encode {"v":1,"sourceId":"…","token":"…"} (bins: HMAC signature, trucks: rotating token). */
function parseOruQr(data: string): { sourceId: string; token: string } | null {
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed?.sourceId === 'string' && typeof parsed?.token === 'string') {
      return { sourceId: parsed.sourceId, token: parsed.token };
    }
  } catch {
    /* not an Oru code */
  }
  return null;
}

const FRIENDLY_ERRORS: Record<string, string> = {
  GEOFENCE_BREACH: 'You need to be standing next to this bin.',
  TRUCK_PROXIMITY_EXCEEDED: 'You need to be next to the collector.',
  INVALID_OR_EXPIRED_TOKEN: 'This QR has expired. Ask the collector to refresh it.',
  INVALID_QR_SIGNATURE: 'This is not a genuine Oru QR code.',
  COOLDOWN_ACTIVE: 'You scanned this recently. Try again in 4 hours.',
  MOCK_LOCATION: 'Turn off mock / fake GPS to scan.',
  QR_SOURCE_NOT_FOUND: 'This QR code is not registered.',
};

/** Four L-shaped corners instead of a full box, so it reads as a viewfinder. Breathes gently while idle, to signal "actively looking for a code". */
const Corners: React.FC<{ color: string; size: number; breathe?: boolean }> = ({ color, size, breathe }) => {
  const arm = 44;
  const base = { position: 'absolute' as const, width: arm, height: arm, borderColor: color, borderWidth: 6 };
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!breathe) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  return (
    <Animated.View style={{ width: size, height: size, opacity }}>
      <View style={[base, { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 28 }]} />
      <View style={[base, { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 28 }]} />
      <View style={[base, { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 28 }]} />
      <View style={[base, { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 28 }]} />
    </Animated.View>
  );
};

export const ScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [verifiedCredits, setVerifiedCredits] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef(false);

  const handleBarcode = async ({ data }: BarcodeScanningResult) => {
    if (lockRef.current) return;
    const qr = parseOruQr(data);
    if (!qr) {
      setError('That QR code is not an Oru code.');
      return;
    }
    lockRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const loc = await Location.requestForegroundPermissionsAsync();
      if (loc.status !== 'granted') throw new Error('Location permission is needed to verify you are at the bin.');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      const res = await api.verifyScan({
        sourceId: qr.sourceId,
        qrPayload: qr.token,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        isMockLocation: pos.mocked === true,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setResult(res);
      setTaskName(res.sourceName);
      setVerifiedCredits(res.creditsEarned);
      setSuccessVisible(true);
      refreshProfile();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const msg = err instanceof ApiError ? FRIENDLY_ERRORS[err.code] || err.message : err?.message;
      setError(msg || 'Scan failed. Please try again.');
      // allow another attempt after a short pause
      setTimeout(() => {
        lockRef.current = false;
      }, 2500);
    } finally {
      setBusy(false);
    }
  };

  const permissionBlocked = !!permission && !permission.canAskAgain && !permission.granted;

  return (
    <View style={styles.container}>
      {/* Full-bleed camera, or the permission prompt in its place */}
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={successVisible || busy ? undefined : handleBarcode}
        />
      ) : (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.permissionFill]}
          onPress={() => {
            if (permissionBlocked) {
              Linking.openSettings();
            } else {
              requestPermission();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={permissionBlocked ? 'Open settings to allow camera access' : 'Allow camera access'}
        >
          <Icon name="camera" color="#4C5A6B" size={34} strokeWidth={2.4} />
          <Text style={styles.permissionTitle}>{permissionBlocked ? 'Camera access blocked' : 'Camera access needed'}</Text>
          <Text style={styles.permissionHint}>{permissionBlocked ? 'Tap to open Settings' : 'Tap to allow'}</Text>
        </Pressable>
      )}

      {/* Scrim so the top bar and title stay legible over whatever the camera sees */}
      <SvgComp style={styles.topScrim} width="100%" height="260" pointerEvents="none">
        <DefsComp>
          <GradComp id="scanTopScrim" x1="0" y1="0" x2="0" y2="1">
            <StopComp offset="0" stopColor="#05070C" stopOpacity="0.75" />
            <StopComp offset="1" stopColor="#05070C" stopOpacity="0" />
          </GradComp>
        </DefsComp>
        <RectComp width="100%" height="100%" fill="url(#scanTopScrim)" />
      </SvgComp>

      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <Pressable
          style={styles.roundBtn}
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Icon name="close" color="#F7FFFF" size={22} strokeWidth={3} />
        </Pressable>

        <Pressable
          style={[styles.roundBtn, flashOn && { backgroundColor: theme.accentYellow }]}
          onPress={() => setFlashOn(!flashOn)}
          hitSlop={10}
          disabled={!permission?.granted}
          accessibilityRole="button"
          accessibilityLabel={flashOn ? 'Turn off flash' : 'Turn on flash'}
          accessibilityState={{ disabled: !permission?.granted, selected: flashOn }}
        >
          <Icon name="bolt" color={flashOn ? '#05070C' : '#F7FFFF'} size={20} filled={flashOn} strokeWidth={3} />
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Scan the bin</Text>
        <Text style={styles.subtitle}>Point at the QR sticker on the bin</Text>
      </View>

      <View style={styles.centerGroup} pointerEvents="box-none">
        <View style={styles.finder} pointerEvents="none">
          <Corners color={error ? '#FF6B7A' : theme.accentTurquoise} size={260} breathe={!busy && !error && !successVisible} />
        </View>
        <View style={styles.finderHint}>
          {busy ? (
            <ActivityIndicator color="#B5C0CF" />
          ) : (
            <Text style={[styles.finderHintText, error ? { color: '#FF8A8A' } : null]}>
              {error || 'Point at an Oru QR code'}
            </Text>
          )}
        </View>
      </View>

      {/* Success */}
      <Modal visible={successVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <PopIn>
              <View style={[styles.check, { backgroundColor: theme.accentLime, borderColor: '#2BA836' }]}>
                <Icon name="check" color="#05070C" size={46} strokeWidth={4} />
              </View>
            </PopIn>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Quest complete!</Text>

            <View style={styles.rewardRow}>
              <ChunkyCard style={styles.rewardCard} tint={theme.accentYellow}>
                <Text style={[styles.rewardLabel, { color: theme.inkAccent.accentYellow }]}>CREDITS</Text>
                <CountUp to={verifiedCredits} duration={700} format={(n) => `+${Math.round(n)}`} style={[styles.rewardValue, { color: theme.textPrimary }]} />
              </ChunkyCard>
              <ChunkyCard style={styles.rewardCard} tint={theme.accentLime}>
                <Text style={[styles.rewardLabel, { color: theme.inkAccent.accentLime }]}>STATUS</Text>
                <Text style={[styles.rewardValue, { color: theme.textPrimary, fontSize: 20 }]}>
                  {result?.collectorReward ? `+${result.collectorReward.creditsEarned} to collector` : 'Verified'}
                </Text>
              </ChunkyCard>
            </View>

            <ChunkyCard style={styles.summary}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.surface2 }]}>
                <Icon3D name="bin" size={44} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryName, { color: theme.textPrimary }]}>{taskName}</Text>
                <Text style={[styles.summaryTime, { color: theme.textMuted }]}>
                  {result ? `Territory health ${Math.round(result.territoryHealth)} · ${result.tier.currentTier.titleEn}` : 'Today'}
                </Text>
              </View>
            </ChunkyCard>

            <View style={styles.actions}>
              <ChunkyButton
                label="Continue"
                icon="check"
                variant="success"
                onPress={() => {
                  setSuccessVisible(false);
                  lockRef.current = false;
                  navigation.navigate('Home');
                }}
              />
              <ChunkyButton
                label="Do another quest"
                variant="secondary"
                onPress={() => {
                  setSuccessVisible(false);
                  lockRef.current = false;
                  navigation.navigate('Tasks');
                }}
              />
            </View>
          </View>
          <Confetti active={successVisible} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05070C' },
  topBar: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  centerGroup: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  titleBlock: { alignItems: 'center', paddingHorizontal: 20 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, color: '#F7FFFF', letterSpacing: -0.6 },
  subtitle: { fontFamily: typography.fontBodyMedium, fontSize: 15, color: '#8E9AA8', marginTop: 6 },
  finder: { alignItems: 'center', justifyContent: 'center', width: 260, height: 260, alignSelf: 'center' },
  camera: { width: 260, height: 260, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', gap: 6 },
  permissionFill: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E17', gap: 6 },
  permissionTitle: { fontFamily: typography.fontBodyBold, fontSize: 14, color: '#B5C0CF', marginTop: 4 },
  permissionHint: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, color: '#6B7A8C' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  cornersWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  finderHint: { position: 'absolute', bottom: -44, maxWidth: 280, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.10)' },
  finderHintText: { fontFamily: typography.fontBodySemiBold, fontSize: 12.5, color: '#B5C0CF', textAlign: 'center' },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(5,7,12,0.7)' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 2, borderBottomWidth: 0, padding: 24, paddingBottom: 36, alignItems: 'center' },
  check: { width: 88, height: 88, borderRadius: 44, borderWidth: 0, borderBottomWidth: 6, alignItems: 'center', justifyContent: 'center', marginTop: -68, marginBottom: 14 },
  sheetTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, letterSpacing: -0.6, marginBottom: 18 },
  rewardRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  rewardCard: { flex: 1, padding: 12, alignItems: 'center' },
  rewardLabel: { fontFamily: typography.fontBodyBold, fontSize: 11, letterSpacing: 1.4 },
  rewardValue: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, marginTop: 4, fontVariant: ['tabular-nums'] },
  summary: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, marginBottom: 20 },
  summaryIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  summaryName: { fontFamily: typography.fontBodyBold, fontSize: 15.5 },
  summaryTime: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 2 },
  actions: { width: '100%', gap: 12 },
});
