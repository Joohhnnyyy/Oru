import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { generateClientRotatingToken } from '../../utils/totp';
import { telemetryService, TelemetryPoint } from '../../services/telemetry';
import { colors, radii, spacing } from '../../theme/tokens';

export const CollectorHomeScreen: React.FC = () => {
  const { user, switchPersona } = useAuth();
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
    <View style={styles.container}>
      <AppHeader title="सफाई संग्रहकर्ता (Collector Mode)" />

      <View style={styles.content}>
        {/* Source Badge & Status */}
        <View style={styles.badgeRow}>
          <Text style={styles.sourceBadge}>
            🚛 {user?.assignedVehicleId || 'DL-1M-4821'} • {user?.territoryName || 'Ward 34'}
          </Text>
          <PressableScale
            style={[styles.routeToggle, isOnRoute ? styles.routeActive : styles.routePaused]}
            onPress={handleToggleRoute}
            haptic={false}
          >
            <View style={[styles.routeDot, isOnRoute ? styles.routeDotActive : null]} />
            <Text style={[styles.routeToggleText, isOnRoute ? styles.routeToggleTextActive : null]}>
              {isOnRoute ? 'On Route (Streaming GPS)' : 'Shift Paused'}
            </Text>
          </PressableScale>
        </View>

        {/* Big Rotating QR Frame (~70% screen width) */}
        <View style={styles.qrCard}>
          <Text style={styles.qrHindiTitle}>नागरिक कचरा सत्यापन क्यूआर</Text>
          <Text style={styles.qrEngSub}>Citizen Verification QR (Scan to award credits)</Text>

          {/* High-Contrast Scannable QR Representation */}
          <View style={styles.qrBox}>
            <View style={styles.qrPattern}>
              <Text style={styles.qrMatrixText}>■ □ ■ ■ □ ■</Text>
              <Text style={styles.qrMatrixText}>□ ■ □ ■ ■ □</Text>
              <Text style={styles.qrMatrixText}>■ □ ■ □ ■ ■</Text>
              <Text style={styles.qrMatrixText}>□ ■ ■ ■ □ ■</Text>
              <Text style={styles.qrTokenDisplay}>
                HMAC TOKEN: {tokenData.token.slice(-16)}
              </Text>
            </View>
          </View>

          {/* Countdown Progress Ring */}
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              🔄 Refreshes in: <Text style={styles.countdownSec}>{tokenData.secondsRemaining}s</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(tokenData.secondsRemaining / 30) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Shift Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{scansCount}</Text>
            <Text style={styles.metricLabel}>Citizen Scans Today</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>+{creditsEarned} GC</Text>
            <Text style={styles.metricLabel}>Collector Incentive</Text>
          </View>
        </View>

        {/* Quick simulation for demonstration */}
        <PressableScale
          style={styles.simulateScanBtn}
          onPress={handleSimulateScanReceived}
          haptic={false}
        >
          <Text style={styles.simulateScanBtnText}>⚡ Simulate Citizen Handover (+10 GC)</Text>
        </PressableScale>

        {/* Switch back to citizen mode */}
        <PressableScale
          style={styles.switchBtn}
          onPress={() => switchPersona('citizen')}
          haptic="light"
        >
          <Text style={styles.switchBtnText}>← Switch Back to Citizen Mode</Text>
        </PressableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  content: {
    flex: 1,
    padding: spacing.s2,
    justifyContent: 'space-between',
  },
  badgeRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceBadge: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  routeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  routeActive: {
    backgroundColor: colors.surfaceAccentSubtle,
    borderColor: colors.borderAccent,
  },
  routePaused: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.textTertiary,
    marginRight: 6,
  },
  routeDotActive: {
    backgroundColor: colors.surfaceRaised,
  },
  routeToggleText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  routeToggleTextActive: {
    color: colors.textAccent,
  },
  qrCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderAccentSubtle,
    padding: spacing.s3,
    alignItems: 'center',
  },
  qrHindiTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  qrEngSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  qrBox: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  qrPattern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrMatrixText: {
    fontSize: 22,
    letterSpacing: 4,
    marginVertical: 1,
    color: '#000000',
  },
  qrTokenDisplay: {
    marginTop: 10,
    fontSize: 9,
    color: '#000000',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdownContainer: {
    width: '100%',
    alignItems: 'center',
  },
  countdownText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  countdownSec: {
    color: colors.surfaceRaised,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    padding: spacing.s2,
    alignItems: 'center',
  },
  metricVal: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  simulateScanBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  simulateScanBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  switchBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  switchBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
