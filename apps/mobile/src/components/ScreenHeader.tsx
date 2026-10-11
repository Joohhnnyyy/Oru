import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/tokens';

/** Big bold title with an optional back button and a right-hand slot (stat chips). */
export const ScreenHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}> = ({ title, subtitle, onBack, right }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onBack();
            }}
            hitSlop={10}
            style={[styles.back, { backgroundColor: theme.card, borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="back" size={22} color={theme.textPrimary} strokeWidth={3.2} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }} />
        {right}
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 40, marginBottom: 6 },
  back: { width: 40, height: 40, borderRadius: 14, borderWidth: 2, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 34, letterSpacing: -0.8 },
  subtitle: { fontFamily: typography.fontBodyMedium, fontSize: 15, marginTop: 4 },
});
