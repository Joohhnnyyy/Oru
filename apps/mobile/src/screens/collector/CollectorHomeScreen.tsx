import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { generateClientRotatingToken } from '../../utils/totp';
import { telemetryService, TelemetryPoint } from '../../services/telemetry';
import { typography } from '../../theme/tokens';

import { Icon3D } from '../../components/Icon3D';

export const CollectorHomeScreen: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const { theme } = useTheme();
  const [isOnRoute, setIsOnRoute] = useState(true);
  const [scansCount, setScansCount] = useState(14);
  const [creditsEarned, setCreditsEarned] = useState(140);
  const [tokenData, setTokenData] = useState(() =>
    generateClientRotatingToken(user?.assignedSourceId || 'truck-dl1m-4821'),
  );
  const [, setLastCoord] = useState<TelemetryPoint | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTokenData(generateClientRotatingToken(user?.assignedSourceId || 'truck-dl1m-4821'));
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.assignedSourceId]);

  useEffect(() => {
    if (isOnRoute) {
      telemetryService.startBroadcasting(user?.assignedVehicleId || 'DL-1M-4821', (pt) => {
        setLastCoord(pt);
      });
    } else {
      telemetryService.stopBroadcasting();
    }

    return () => telemetryService.stopBroadcasting();
  }, [isOnRoute, user?.assignedVehicleId]);

  const handleToggleRoute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsOnRoute(!isOnRoute);
  };

  const handleSimulateScanReceived = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScansCount((c) => c + 1);
    setCreditsEarned((g) => g + 10);
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
                {isOnRoute ? 'On route · streaming GPS' : 'Shift paused'}
              </Text>
            </View>
            <ChunkyButton small variant={isOnRoute ? 'secondary' : 'success'} label={isOnRoute ? 'Pause' : 'Start'} onPress={handleToggleRoute} />
          </ChunkyCard>

          <ChunkyCard style={styles.qrCard} tint={theme.accentCyan}>
            <Text style={[styles.qrTitle, { color: theme.textPrimary }]}>Citizen verification QR</Text>
            <Text style={[styles.qrSub, { color: theme.textSecondary }]}>Citizens scan this to award credits</Text>

            <View style={styles.qrBox}>
              {['■ □ ■ ■ □ ■', '□ ■ □ ■ ■ □', '■ □ ■ □ ■ ■', '□ ■ ■ ■ □ ■'].map((row) => (
                <Text key={row} style={styles.qrRow}>{row}</Text>
              ))}
              <Text style={styles.qrToken}>{tokenData.token.slice(-16)}</Text>
            </View>

            <View style={styles.refresh}>
              <Text style={[styles.refreshText, { color: theme.textSecondary }]}>
                Refreshes in <Text style={{ color: theme.inkAccent.accentCyan }}>{tokenData.secondsRemaining}s</Text>
              </Text>
              <ChunkyProgress value={tokenData.secondsRemaining / 30} color={theme.accentCyan} track={theme.surface3} height={12} />
            </View>
          </ChunkyCard>

          <View style={styles.metrics}>
            <ChunkyCard style={styles.metric} tint={theme.accentYellow}>
              <Text style={[styles.metricVal, { color: theme.textPrimary }]}>{scansCount}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Scans today</Text>
            </ChunkyCard>
            <ChunkyCard style={styles.metric} tint={theme.accentLime}>
              <Text style={[styles.metricVal, { color: theme.inkAccent.accentLime }]}>+{creditsEarned}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Incentive (GC)</Text>
            </ChunkyCard>
          </View>

          <ChunkyButton label="Simulate handover (+10 GC)" variant="warning" onPress={handleSimulateScanReceived} />
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
