import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChunkyCard } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

export const LanguageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { language, setLanguage } = useAuth();
  const { theme } = useTheme();

  const options: { id: 'en' | 'hi'; title: string; sub: string }[] = [
    { id: 'en', title: 'English', sub: 'Default interface in English' },
    { id: 'hi', title: 'हिंदी', sub: 'साफसफारी का हिंदी इंटरफेस' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader title="Language" subtitle="आप अपनी पसंदीदा भाषा चुन सकते हैं" onBack={() => navigation.goBack()} />
      <View style={styles.list}>
        {options.map((o) => (
          <ChunkyCard
            key={o.id}
            tint={language === o.id ? theme.accentCyan : undefined}
            style={language === o.id ? { backgroundColor: theme.surface2 } : undefined}
            onPress={() => {
              setLanguage(o.id);
              navigation.navigate('LocationSetup');
            }}
          >
            <Text style={[styles.title, { color: theme.textPrimary }]}>{o.title}</Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>{o.sub}</Text>
          </ChunkyCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 20, gap: 14 },
  title: { fontFamily: typography.fontDisplayBold, fontSize: 20 },
  sub: { fontFamily: typography.fontBodyMedium, fontSize: 14, marginTop: 4 },
});
