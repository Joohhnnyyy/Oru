import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';

export const ScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateCredits } = useAuth();
  const [torchOn, setTorchOn] = useState(false);
  const [scanResult, setScanResult] = useState<{
    credits: number;
    source: string;
    breakdown: { base: number; streak: number; explorer: number; territoryNeed: number };
  } | null>(null);

  const handleSimulateScan = (type: 'truck' | 'bin') => {
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
          <TouchableOpacity
            style={[styles.torchBtn, torchOn && styles.torchBtnActive]}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Text style={styles.torchText}>🔦 {torchOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.simulateBtn}
              onPress={() => handleSimulateScan('truck')}
            >
              <Text style={styles.simulateBtnText}>⚡ Simulate Truck Scan (+30 GC)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simulateBtn, styles.binBtn]}
              onPress={() => handleSimulateScan('bin')}
            >
              <Text style={styles.simulateBtnText}>📦 Simulate Bin Scan (+20 GC)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Result Modal Sheet (B4.2) */}
      <Modal visible={!!scanResult} transparent animationType="slide">
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
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setScanResult(null);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>Back to Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setScanResult(null)}
              >
                <Text style={styles.modalSecondaryBtnText}>Scan Again</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0F172A',
  },
  cameraBox: {
    flex: 1,
    backgroundColor: '#090D16',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  torchBtnActive: {
    backgroundColor: '#F59E0B',
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
    backgroundColor: '#3B82F6',
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  celebrateEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultCredits: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultSource: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
  },
  breakdownBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  breakdownTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  breakdownVal: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  territoryImpact: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  impactText: {
    color: '#6EE7B7',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSecondaryBtn: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 14,
  },
});
