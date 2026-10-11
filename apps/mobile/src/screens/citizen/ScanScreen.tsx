import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Icon } from '../../components/Icon';
import { Confetti, PopIn, CountUp } from '../../components/Motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { typography } from '../../theme/tokens';

/** Four L-shaped corners instead of a full box, so it reads as a viewfinder. */
const Corners: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const arm = 44;
  const base = { position: 'absolute' as const, width: arm, height: arm, borderColor: color, borderWidth: 6 };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[base, { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 28 }]} />
      <View style={[base, { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 28 }]} />
      <View style={[base, { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 28 }]} />
      <View style={[base, { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 28 }]} />
    </View>
  );
};

export const ScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateCredits } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [flashOn, setFlashOn] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [verifiedCredits, setVerifiedCredits] = useState(10);
  const [taskName, setTaskName] = useState('Scan a waste bin');

  const handleSimulateScan = (task: string = 'Scan a waste bin', credits: number = 10) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTaskName(task);
    setVerifiedCredits(credits);
    updateCredits(credits);
    setSuccessVisible(true);
  };

  return (
    <View style={styles.container}>
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
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Scan the bin</Text>
        <Text style={styles.subtitle}>Point at the QR sticker on the bin</Text>
      </View>

      <Pressable style={styles.finder} onPress={() => handleSimulateScan('Scan a waste bin', 10)}>
        <Corners color={theme.accentTurquoise} size={260} />
        <View style={styles.finderHint}>
          <Text style={styles.finderHintText}>Tap to simulate a scan</Text>
        </View>
      </Pressable>

      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 20) + 96 }]}>
        <ChunkyButton
          variant={flashOn ? 'warning' : 'secondary'}
          style={styles.ctrl}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Icon name="bolt" color={flashOn ? '#05070C' : theme.textPrimary} size={18} filled={flashOn} strokeWidth={3} />
          <Text style={[styles.ctrlText, { color: flashOn ? '#05070C' : theme.textPrimary }]}>Flash</Text>
        </ChunkyButton>
        <ChunkyButton
          variant="secondary"
          style={styles.ctrl}
          onPress={() => handleSimulateScan('Drop Plastic at Smart MCD Bin', 20)}
        >
          <Icon name="image" color={theme.textPrimary} size={18} strokeWidth={3} />
          <Text style={[styles.ctrlText, { color: theme.textPrimary }]}>Gallery</Text>
        </ChunkyButton>
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
                <Text style={[styles.rewardValue, { color: theme.textPrimary, fontSize: 20 }]}>Verified</Text>
              </ChunkyCard>
            </View>

            <ChunkyCard style={styles.summary}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.surface2 }]}>
                <Icon3D name="bin" size={44} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryName, { color: theme.textPrimary }]}>{taskName}</Text>
                <Text style={[styles.summaryTime, { color: theme.textMuted }]}>Today</Text>
              </View>
            </ChunkyCard>

            <View style={styles.actions}>
              <ChunkyButton
                label="Continue"
                icon="check"
                variant="success"
                onPress={() => {
                  setSuccessVisible(false);
                  navigation.navigate('Home');
                }}
              />
              <ChunkyButton
                label="Do another quest"
                variant="secondary"
                onPress={() => {
                  setSuccessVisible(false);
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
  container: { flex: 1, backgroundColor: '#05070C', justifyContent: 'space-between' },
  topBar: { paddingHorizontal: 20, flexDirection: 'row' },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  titleBlock: { alignItems: 'center', paddingHorizontal: 20 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, color: '#F7FFFF', letterSpacing: -0.6 },
  subtitle: { fontFamily: typography.fontBodyMedium, fontSize: 15, color: '#8E9AA8', marginTop: 6 },
  finder: { alignItems: 'center', justifyContent: 'center' },
  finderHint: { position: 'absolute', bottom: -44, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.10)' },
  finderHintText: { fontFamily: typography.fontBodySemiBold, fontSize: 12.5, color: '#B5C0CF' },
  controls: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  ctrl: { flex: 1, flexDirection: 'row', gap: 8 },
  ctrlText: { fontFamily: typography.fontDisplayExtraBold, fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' },

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
