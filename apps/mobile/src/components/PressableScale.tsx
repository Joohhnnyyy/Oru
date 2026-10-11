import React, { useRef } from 'react';
import {
  StyleSheet,
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number; // default 0.97
  haptic?: boolean | 'light' | 'medium' | 'success';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Emil Kowalski Design Engineering Principle:
 * 1. Physical press feedback on press-in (scale: 0.97), commit on press-out.
 * 2. High-speed spring (100-150ms perceived) running on the native UI thread.
 * 3. Haptic impact in the exact frame of the press.
 * 4. Generous hitSlop for effortless touch accuracy.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  style,
  scaleTo = 0.97,
  haptic = 'light',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    // Trigger tactile haptic on touch down
    if (haptic) {
      if (haptic === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else if (haptic === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }

    Animated.spring(scale, {
      toValue: scaleTo,
      speed: 35,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 30,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  // Layout props belong on the outer Pressable, otherwise flex/width children collapse
  const { flex, alignSelf, width } = StyleSheet.flatten(style) || {};

  return (
    <Pressable
      style={{ flex, alignSelf, width }}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
