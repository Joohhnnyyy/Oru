import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { generateClientRotatingToken } from '../../utils/totp';
import { telemetryService, TelemetryPoint } from '../../services/telemetry';

export const CollectorHomeScreen: React.FC = () => {
  const { user, switchPersona } = useAuth();
  const [isOnRoute, setIsOnRoute] = useState(true);
  const [scansCount, setScansCount] = useState(14);
  const [creditsEarned, setCreditsEarned] = useState(140);
  const [tokenData, setTokenData] = useState(() =>
    generateClientRotatingToken(user?.assignedSourceId || 'truck-dl1m-4821'),
  );
  const [lastCoord, setLastCoord] = useState<TelemetryPoint | null>(null);

  // Synchronized 1-second interval tracking token expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenData(generateClientRotatingToken(user?.assignedSourceId || 'truck-dl1m-4821'));
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.assignedSourceId]);

  // Telemetry streaming
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

  const handleSimulateScanReceived = () => {
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
          <TouchableOpacity
            style={[styles.routeToggle, isOnRoute ? styles.routeActive : styles.routePaused]}
            onPress={() => setIsOnRoute(!isOnRoute)}
          >
            <View style={[styles.routeDot, isOnRoute ? styles.routeDotActive : null]} />
            <Text style={styles.routeToggleText}>
              {isOnRoute ? 'On Route (Streaming GPS)' : 'Shift Paused'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Big Rotating QR Frame (B7.1: ~70% screen width) */}
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
        <TouchableOpacity
          style={styles.simulateScanBtn}
          onPress={handleSimulateScanReceived}
        >
          <Text style={styles.simulateScanBtnText}>⚡ Simulate Citizen Handover (+10 GC)</Text>
        </TouchableOpacity>

        {/* Switch back to citizen mode */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => switchPersona('citizen')}
        >
          <Text style={styles.switchBtnText}>← Switch Back to Citizen Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  badgeRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceBadge: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  routeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  routeActive: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  routePaused: {
    backgroundColor: '#334155',
    borderColor: '#64748B',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  routeDotActive: {
    backgroundColor: '#10B981',
  },
  routeToggleText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#131D33',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#3B82F6',
    padding: 18,
    alignItems: 'center',
  },
  qrHindiTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  qrEngSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
  },
  qrBox: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 14,
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
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  countdownSec: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricVal: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
  },
  simulateScanBtn: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  simulateScanBtnText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '700',
  },
  switchBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});
