import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChunkyButton, RAINBOW } from '../../components/Chunky';
import { typography } from '../../theme/tokens';

import { CHARACTERS } from '../../theme/characters';

const SLIDES = [
  { title: 'Do real civic actions', description: 'Segregate waste at home, drop e-waste at hubs, and hand over to municipal trucks.', character: CHARACTERS.turtle },
  { title: 'Verify instantly', description: 'Scan the QR on a bin or truck, or upload a photo of your cleanup.', character: CHARACTERS.dolphin },
  { title: 'Heal your territory', description: 'Earn Green Credits, level up your Delhi territory, and redeem real rewards.', character: CHARACTERS.buddy },
];

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [i, setI] = useState(0);
  const { switchPersona } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const last = i === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
      <View style={styles.dots}>
        {SLIDES.map((_, n) => (
          <View key={n} style={[styles.dot, { backgroundColor: n <= i ? RAINBOW[(n * 2) % RAINBOW.length] : theme.surface3 }]} />
        ))}
      </View>

      <View style={styles.center}>
        <Image source={SLIDES[i].character} style={styles.mascot} resizeMode="contain" />
        <Text style={[styles.title, { color: theme.textPrimary }]}>{SLIDES[i].title}</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>{SLIDES[i].description}</Text>
      </View>

      <View style={styles.actions}>
        <ChunkyButton label={last ? 'Get started' : 'Continue'} onPress={() => (last ? navigation.navigate('SignIn') : setI(i + 1))} />
        <ChunkyButton
          variant="secondary"
          label="Demo sign in (Aarav)"
          onPress={() => {
            switchPersona('citizen');
            navigation.replace('Main');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { flex: 1, height: 10, borderRadius: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 240, height: 240, marginBottom: 20 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, letterSpacing: -0.6, textAlign: 'center' },
  desc: { fontFamily: typography.fontBodyMedium, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  actions: { gap: 12 },
});
