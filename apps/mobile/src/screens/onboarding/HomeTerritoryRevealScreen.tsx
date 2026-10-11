import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { typography } from '../../theme/tokens';

const TASKS = [
  ['Morning wet & dry waste handover', '+30 credits · Scan truck QR'],
  ['Home energy conservation check', '+15 credits · Daily habit'],
  ['Drop multi-layer plastic at MCD bin', '+25 credits · Static QR'],
];

export const HomeTerritoryRevealScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: Math.max(insets.bottom, 20) + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: theme.inkAccent.accentCyan }]}>YOUR TERRITORY</Text>
      <Image source={require('../../../assets/earth_mascot.png')} style={styles.mascot} resizeMode="contain" />
      <Text style={[styles.name, { color: theme.textPrimary }]}>MCD South 34</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Lajpat Nagar · Dolphin Sanctuary</Text>

      <ChunkyCard style={styles.health} tint={theme.accentYellow}>
        <View style={styles.healthTop}>
          <Text style={[styles.healthLabel, { color: theme.inkAccent.accentYellow }]}>RECOVERING</Text>
          <Text style={[styles.healthScore, { color: theme.textPrimary }]}>72 / 100</Text>
        </View>
        <ChunkyProgress value={0.72} color={theme.accentYellow} track={theme.surface3} />
        <Text style={[styles.msg, { color: theme.textSecondary }]}>
          Push health past 75 to unlock the Thriving mood. Hand over segregated waste and report dump spots.
        </Text>
      </ChunkyCard>

      <Text style={[styles.section, { color: theme.textPrimary }]}>Your first quests</Text>
      {TASKS.map(([t, c]) => (
        <ChunkyCard key={t} style={styles.task}>
          <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>{t}</Text>
          <Text style={[styles.taskMeta, { color: theme.inkAccent.accentLime }]}>{c}</Text>
        </ChunkyCard>
      ))}

      <ChunkyButton label="Let's start" variant="success" onPress={() => navigation.replace('Main')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14, alignItems: 'stretch' },
  eyebrow: { fontFamily: typography.fontBodyBold, fontSize: 12, letterSpacing: 1.8, textAlign: 'center' },
  mascot: { width: 200, height: 200, alignSelf: 'center' },
  name: { fontFamily: typography.fontDisplayExtraBold, fontSize: 32, letterSpacing: -0.8, textAlign: 'center' },
  sub: { fontFamily: typography.fontBodyMedium, fontSize: 15, textAlign: 'center', marginTop: -8 },
  health: { gap: 12 },
  healthTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { fontFamily: typography.fontDisplayExtraBold, fontSize: 13, letterSpacing: 1.4 },
  healthScore: { fontFamily: typography.fontDisplayExtraBold, fontSize: 22, fontVariant: ['tabular-nums'] },
  msg: { fontFamily: typography.fontBodyMedium, fontSize: 14, lineHeight: 21 },
  section: { fontFamily: typography.fontDisplayBold, fontSize: 22, marginTop: 6 },
  task: { gap: 4, padding: 14 },
  taskTitle: { fontFamily: typography.fontBodyBold, fontSize: 15.5 },
  taskMeta: { fontFamily: typography.fontBodyBold, fontSize: 13 },
});
