import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/tokens';
import { Icon, IconName } from './Icon';
import { AnimatedFill } from './Motion';

/**
 * Duolingo-style building blocks: fat rounded shapes with a solid "edge" under them
 * that squashes when pressed. One edge colour per variant, derived from the theme.
 */

export type ChunkyVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'pink' | 'danger' | 'ghost';

const DEPTH = 4;

const useVariant = (v: ChunkyVariant) => {
  const { theme, isDark } = useTheme();
  const map: Record<ChunkyVariant, { bg: string; edge: string; fg: string; border?: string }> = {
    primary: { bg: theme.actionPrimary, edge: '#0093B3', fg: theme.actionText },
    success: { bg: theme.accentLime, edge: '#2BA836', fg: '#05070C' },
    warning: { bg: theme.accentYellow, edge: '#C9A800', fg: '#05070C' },
    pink: { bg: theme.accentPink, edge: '#C2539A', fg: '#05070C' },
    danger: { bg: theme.error, edge: '#B8404E', fg: '#05070C' },
    secondary: { bg: theme.card, edge: theme.border, fg: theme.textPrimary, border: theme.border },
    ghost: { bg: 'transparent', edge: 'transparent', fg: theme.textSecondary },
  };
  return map[v];
};

interface ChunkyButtonProps {
  label?: string;
  onPress?: () => void;
  variant?: ChunkyVariant;
  disabled?: boolean;
  small?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  accessibilityLabel?: string;
}

export const ChunkyButton: React.FC<ChunkyButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  small,
  icon,
  style,
  textStyle,
  children,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const c = useVariant(disabled ? 'secondary' : variant);
  const [pressed, setPressed] = useState(false);
  const flat = StyleSheet.flatten(style) || {};

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      onPressOut={() => setPressed(false)}
      style={{ flex: flat.flex, alignSelf: flat.alignSelf, width: flat.width }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={{ backgroundColor: c.edge, borderRadius: small ? 14 : 18, paddingBottom: pressed ? 0 : DEPTH, marginTop: pressed ? DEPTH : 0 }}>
        <View
          style={[
            styles.face,
            {
              backgroundColor: c.bg,
              borderRadius: small ? 14 : 18,
              paddingVertical: small ? 9 : 15,
              paddingHorizontal: small ? 12 : 20,
              borderWidth: c.border ? 2 : 0,
              borderColor: c.border,
              opacity: disabled ? 0.55 : 1,
            },
            style,
          ]}
        >
          {children ?? (
            <>
              {icon ? <Icon name={icon} size={small ? 15 : 19} color={disabled ? theme.textMuted : c.fg} strokeWidth={3} /> : null}
              <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: disabled ? theme.textMuted : c.fg, fontSize: small ? 12.5 : 15, letterSpacing: small ? 0.4 : 0.8 },
                textStyle,
              ]}
            >
              {label}
            </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
};

/** Card with a 2px outline and a thicker bottom edge. Pressable when onPress is given. */
export const ChunkyCard: React.FC<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  children: React.ReactNode;
  accessibilityLabel?: string;
}> = ({ onPress, style, tint, children, accessibilityLabel }) => {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const edge = tint ?? theme.border;
  const flat = StyleSheet.flatten(style) || {};

  const inner = (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: 22,
          borderWidth: 2,
          borderBottomWidth: pressed ? 2 : 5,
          borderColor: edge,
          marginTop: pressed ? 3 : 0,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => setPressed(false)}
      style={{ flex: flat.flex, alignSelf: flat.alignSelf, width: flat.width }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {inner}
    </Pressable>
  );
};

/** Small stat chip, the streak / XP / credits pill that sits in headers. */
export const StatChip: React.FC<{ icon: React.ReactNode; value: string | number; color: string }> = ({ icon, value, color }) => (
  <View style={styles.chip}>
    {icon}
    <Text style={[styles.chipText, { color }]}>{value}</Text>
  </View>
);

/** Thick rounded progress bar with a highlight stripe. */
export const ChunkyProgress: React.FC<{ value: number; color: string; track: string; height?: number }> = ({
  value,
  color,
  track,
  height = 16,
}) => (
  <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
    <AnimatedFill value={Math.max(0, Math.min(1, value))} color={color} radius={height / 2} />
  </View>
);

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  label: { fontFamily: typography.fontDisplayExtraBold, letterSpacing: 0.8, textTransform: 'uppercase' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipText: { fontFamily: typography.fontDisplayExtraBold, fontSize: 16, fontVariant: ['tabular-nums'] },
});

export const RAINBOW = ['#43E34F', '#FFE34D', '#FF83D0', '#00E5D4', '#00CFFF'];

/**
 * The logo's stacked colour bands under a black face: green, yellow, pink, turquoise, blue.
 * `style` styles the face (padding, radius, overflow); bands sit behind it.
 */
export const RainbowCard: React.FC<{
  style?: StyleProp<ViewStyle>;
  radius?: number;
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Height of each colour band in px (default 5). */
  step?: number;
}> = ({ style, radius = 28, children, onPress, accessibilityLabel, step = 5 }) => {
  const STEP = step;
  const [pressed, setPressed] = useState(false);
  const squash = pressed ? 3 : 0;
  const body = (
    <View style={{ marginBottom: STEP * RAINBOW.length, marginTop: squash }}>
      {[...RAINBOW].reverse().map((c, i) => {
        const k = RAINBOW.length - i; // blue is furthest down
        return (
          <View
            key={c}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: -(k * STEP - squash),
              borderRadius: radius,
              backgroundColor: c,
            }}
          />
        );
      })}
      <View style={[{ backgroundColor: '#05070C', borderRadius: radius, overflow: 'hidden' }, style]}>{children}</View>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        Haptics.selectionAsync().catch(() => {});
      }}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {body}
    </Pressable>
  );
};
