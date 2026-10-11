import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { Wiggle, Bounce } from './Motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/tokens';

/**
 * Top bar: logo on the left, streak + credits chips and avatar on the right.
 * With `title` it becomes a plain titled bar.
 */
export const AppHeader: React.FC<{
  title?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}> = ({ title, onNotificationPress, onProfilePress }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const credits = user?.greenCredits ?? 420;

  return (
    <View style={[styles.header, { backgroundColor: theme.bg, paddingTop: Math.max(insets.top, 12) + 4 }]}>
      <View style={{ flex: 1 }}>
        {title ? (
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        ) : (
          <Image
            source={require('../../assets/Oru_color.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <Pressable
        style={styles.chip}
        onPress={onNotificationPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Daily streak, 7 days. View notifications`}
      >
        <Wiggle loop>
          <Icon name="flame" size={22} color="#FF9F1C" filled strokeWidth={2} />
        </Wiggle>
        <Text style={[styles.chipText, { color: '#FF9F1C' }]}>7</Text>
      </Pressable>

      <View style={styles.chip}>
        <Bounce trigger={credits}>
          <Icon name="gem" size={20} color={theme.accentCyan} filled strokeWidth={2} />
        </Bounce>
        <Text style={[styles.chipText, { color: theme.inkAccent.accentCyan }]}>{credits.toLocaleString()}</Text>
      </View>

      <Pressable
        onPress={onProfilePress}
        style={[styles.avatar, { backgroundColor: theme.accentTurquoise, borderColor: isDark ? '#00A99C' : '#0D9488' }]}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Text style={styles.avatarText}>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 10 },
  logo: { width: 72, height: 42 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 24 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { fontFamily: typography.fontDisplayExtraBold, fontSize: 16, fontVariant: ['tabular-nums'] },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4 },
  avatarText: { fontFamily: typography.fontDisplayExtraBold, fontSize: 16, color: '#05070C' },
});
