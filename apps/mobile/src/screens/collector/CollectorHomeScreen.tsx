import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { api, CollectorQrToken } from '../../services/api';
import { typography } from '../../theme/tokens';

import { Icon3D } from '../../components/Icon3D';

export const CollectorHomeScreen: React.FC = () => {
  const { user, token, switchPersona, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const [isOnRoute, setIsOnRoute] = useState(true);
  const [qr, setQr] = useState<CollectorQrToken | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  /** Fetch the server-signed rotating QR and report our live GPS position with it. */
  const fetchQr = useCallback(async () => {
    try {
      let position: { latitude: number; longitude: number } | undefined;
      const perm = await Location.getForegroundPermissionsAsync();
      const granted = perm.granted || (await Location.requestForegroundPermissionsAsync()).granted;
      if (granted) {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        position = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }
      const next = await api.getCollectorQrToken(position);
      setQr(next);
      setQrError(null);
      setSecondsRemaining(Math.ceil(next.refreshInMs / 1000));
    } catch (err: any) {
      setQrError(err?.message || 'Could not load QR');
    }
  }, []);

  // Refresh just before each 30-second window rolls over
  useEffect(() => {
    if (!isOnRoute || !token) return;
    fetchQr();
    const tick = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          fetchQr();
          refreshProfile(); // pick up +2 GC handover rewards
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [isOnRoute, token, fetchQr, refreshProfile]);

  const handleToggleRoute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsOnRoute(!isOnRoute);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Collector" subtitle="सफाई संग्रहकर्ता · shift mode" />

        <View style={styles.body}>
          <ChunkyCard style={styles.vehicle} tint={isOnRoute ? theme.accentLime : undefined}>
            <View style={[styles.truckIcon, { backgroundColor: theme.surface2 }]}>
              <Icon3D name="truck" size={40} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vehicleId, { color: theme.textPrimary }]}>{user?.assignedVehicleId || 'DL-1M-4821'}</Text>
              <Text style={[styles.vehicleMeta, { color: isOnRoute ? theme.accentLime : theme.textSecondary }]}>
                {isOnRoute ? 'On route · live GPS shared with each QR' : 'Shift paused'}
              </Text>
            </View>
            <ChunkyButton small variant={isOnRoute ? 'secondary' : 'success'} label={isOnRoute ? 'Pause' : 'Start'} onPress={handleToggleRoute} />
          </ChunkyCard>

          <ChunkyCard style={styles.qrCard} tint={theme.accentCyan}>
            <Text style={[styles.qrTitle, { color: theme.textPrimary }]}>Citizen verification QR</Text>
            <Text style={[styles.qrSub, { color: theme.textSecondary }]}>Citizens scan this to award credits</Text>

            <View style={styles.qrBox}>
              {isOnRoute && qr ? (
                <>
                  <QRCode value={qr.qrPayload} size={200} />
                  <Text style={styles.qrToken}>{qr.sourceName}</Text>
                </>
              ) : qrError ? (
                <Text style={styles.qrToken}>{qrError}</Text>
              ) : isOnRoute ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.qrToken}>Shift paused</Text>
              )}
            </View>

            <View style={styles.refresh}>
              <Text style={[styles.refreshText, { color: theme.textSecondary }]}>
                Refreshes in <Text style={{ color: theme.inkAccent.accentCyan }}>{secondsRemaining}s</Text>
              </Text>
              <ChunkyProgress value={secondsRemaining / 30} color={theme.accentCyan} track={theme.surface3} height={12} />
            </View>
          </ChunkyCard>

          <View style={styles.metrics}>
            <ChunkyCard style={styles.metric} tint={theme.accentYellow}>
              <Text style={[styles.metricVal, { color: theme.textPrimary }]}>{user?.lifetimeXp ?? 0}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Lifetime XP</Text>
            </ChunkyCard>
            <ChunkyCard style={styles.metric} tint={theme.accentLime}>
              <Text style={[styles.metricVal, { color: theme.inkAccent.accentLime }]}>{user?.greenCredits ?? 0}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Green Credits</Text>
            </ChunkyCard>
          </View>

          <ChunkyButton label="Switch to citizen mode" variant="secondary" onPress={() => switchPersona('citizen')} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 60 },
  body: { paddingHorizontal: 20, gap: 14 },
  vehicle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  truckIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  vehicleId: { fontFamily: typography.fontDisplayBold, fontSize: 17 },
  vehicleMeta: { fontFamily: typography.fontBodyBold, fontSize: 12.5, marginTop: 2 },
  qrCard: { alignItems: 'center', gap: 4 },
  qrTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 20 },
  qrSub: { fontFamily: typography.fontBodyMedium, fontSize: 13 },
  qrBox: { marginVertical: 14, backgroundColor: '#F7FFFF', borderRadius: 20, padding: 20, alignItems: 'center', width: '80%' },
  qrRow: { fontSize: 26, letterSpacing: 4, color: '#05070C', lineHeight: 32 },
  qrToken: { marginTop: 8, fontFamily: typography.fontBodyBold, fontSize: 11, color: '#64748B', letterSpacing: 1 },
  refresh: { width: '100%', gap: 8 },
  refreshText: { fontFamily: typography.fontBodyBold, fontSize: 13, textAlign: 'center' },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, alignItems: 'center', padding: 14 },
  metricVal: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, fontVariant: ['tabular-nums'] },
  metricLabel: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 2 },
});
