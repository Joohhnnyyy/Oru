import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';

export const ScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateCredits } = useAuth();
  const [torchOn, setTorchOn] = useState(false);
  const [scanResult, setScanResult] = useState<{
    credits: number;
    source: string;
    breakdown: { base: number; streak: number; explorer: number; territoryNeed: number };
  } | null>(null);

  const toggleTorch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTorchOn(!torchOn);
  };

  const handleSimulateScan = (type: 'truck' | 'bin') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const credits = type === 'truck' ? 30 : 20;
    const result = {
      credits,
      source: type === 'truck' ? 'MCD Sanitation Truck DL-1M-4821' : 'Central Market Smart Bin #402',
      breakdown: {
        base: type === 'truck' ? 20 : 15,
        streak: 5,
        explorer: 3,
        territoryNeed: 2,
      },
    };
    updateCredits(credits);
    setScanResult(result);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Camera QR Scanner" />

      {/* Viewfinder Canvas */}
      <View style={styles.cameraBox}>
        {/* Top Controls */}
        <View style={styles.cameraTopBar}>
          <View style={styles.gpsPill}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS ±4m Accuracy (In Range)</Text>
          </View>
          <PressableScale
            style={[styles.torchBtn, torchOn && styles.torchBtnActive]}
            onPress={toggleTorch}
            haptic={false}
          >
            <Text style={styles.torchText}>🔦 {torchOn ? 'ON' : 'OFF'}</Text>
          </PressableScale>
        </View>

        {/* Viewfinder Reticle */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticleFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Text style={styles.reticleHint}>Align QR code inside box</Text>
          </View>
        </View>

        {/* Bottom Fast Testing Shortcuts */}
        <View style={styles.scanControls}>
          <Text style={styles.helperText}>Scan dynamic QR on MCD truck or static decal on smart bins</Text>
          
          <View style={styles.testActions}>
            <PressableScale
              style={styles.simulateBtn}
              onPress={() => handleSimulateScan('truck')}
              haptic={false}
            >
              <Text style={styles.simulateBtnText}>⚡ Simulate Truck Scan (+30 GC)</Text>
            </PressableScale>

            <PressableScale
              style={[styles.simulateBtn, styles.binBtn]}
              onPress={() => handleSimulateScan('bin')}
              haptic={false}
            >
              <Text style={styles.simulateBtnText}>📦 Simulate Bin Scan (+20 GC)</Text>
            </PressableScale>
          </View>
        </View>
      </View>

      {/* Result Modal Sheet */}
      <Modal visible={!!scanResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.celebrateEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>Action Verified!</Text>
            <Text style={styles.resultCredits}>+{scanResult?.credits} Green Credits</Text>
            <Text style={styles.resultSource}>{scanResult?.source}</Text>

            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>REWARD BREAKDOWN</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base Verified Action:</Text>
                <Text style={styles.breakdownVal}>+{scanResult?.breakdown.base} GC</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Active Streak Multiplier (🔥 7 days):</Text>
                <Text style={styles.breakdownVal}>+{scanResult?.breakdown.streak} GC</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Explorer Bonus:</Text>
                <Text style={styles.breakdownVal}>+{scanResult?.breakdown.explorer} GC</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Territory Need Urgency:</Text>
                <Text style={styles.breakdownVal}>+{scanResult?.breakdown.territoryNeed} GC</Text>
              </View>
            </View>

            <View style={styles.territoryImpact}>
              <Text style={styles.impactText}>🐬 Dolphin Health: +0.2% towards Thriving state</Text>
            </View>

            <View style={styles.modalButtons}>
              <PressableScale
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setScanResult(null);
                  navigation.navigate('Home');
                }}
                haptic="light"
              >
                <Text style={styles.modalPrimaryBtnText}>Back to Home</Text>
              </PressableScale>
              <PressableScale
                style={styles.modalSecondaryBtn}
                onPress={() => setScanResult(null)}
                haptic="light"
              >
                <Text style={styles.modalSecondaryBtnText}>Scan Again</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  cameraBox: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'space-between',
    padding: 16,
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 26, 46, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  gpsText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  torchBtn: {
    backgroundColor: 'rgba(17, 26, 46, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  torchBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#FBBF24',
  },
  torchText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reticleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#10B981',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  reticleHint: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  scanControls: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  helperText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  testActions: {
    width: '100%',
    gap: 10,
  },
  simulateBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  binBtn: {
    backgroundColor: '#2563EB',
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#111A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  celebrateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultCredits: {
    color: '#34D399',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultSource: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  breakdownBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  breakdownTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  breakdownVal: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  territoryImpact: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 18,
    width: '100%',
  },
  impactText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 8,
  },
  modalPrimaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
