import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, ViewStyle, TextStyle, Text, View, StyleSheet } from 'react-native';

/** Fade + rise on mount. Give list items an increasing `index` to stagger them. */
export const FadeInUp: React.FC<{
  index?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}> = ({ index = 0, delay = 0, distance = 18, style, children }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay: delay + Math.min(index, 8) * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/** Springs from 0.4 to 1 on mount, for badges, checks and rewards. */
export const PopIn: React.FC<{ delay?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(v, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]}>
      {children}
    </Animated.View>
  );
};

/** Counts a number up from 0 on mount. Uses JS timing (text can't be driven natively). */
export const CountUp: React.FC<{
  to: number;
  duration?: number;
  format?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}> = ({ to, duration = 900, format = (n) => String(Math.round(n)), style }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setN(value));
    Animated.timing(v, { toValue: to, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [to]);
  return <Text style={style}>{format(n)}</Text>;
};

/** Gentle looping scale + opacity, for live dots. */
export const Pulse: React.FC<{ style?: StyleProp<ViewStyle>; children?: React.ReactNode }> = ({ style, children }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={[style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }]}>
      {children}
    </Animated.View>
  );
};

/** Wobble that restarts whenever `trigger` changes (tab icons, flame). */
export const Wiggle: React.FC<{ trigger?: unknown; loop?: boolean; style?: StyleProp<ViewStyle>; children: React.ReactNode }> = ({
  trigger,
  loop,
  style,
  children,
}) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const seq = Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(v, { toValue: -1, duration: 140, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.6, duration: 120, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]);
    if (loop) {
      const l = Animated.loop(Animated.sequence([seq, Animated.delay(2600)]));
      l.start();
      return () => l.stop();
    }
    seq.start();
  }, [trigger, loop]);
  return (
    <Animated.View style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] }) }] }]}>
      {children}
    </Animated.View>
  );
};

/** Bounce that restarts when `trigger` changes (selected tab). */
export const Bounce: React.FC<{ trigger?: unknown; style?: StyleProp<ViewStyle>; children: React.ReactNode }> = ({ trigger, style, children }) => {
  const v = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    v.setValue(0.7);
    Animated.spring(v, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }).start();
  }, [trigger]);
  return <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>;
};

/** Progress fill that springs from 0 to `value` on mount and when it changes. */
export const AnimatedFill: React.FC<{ value: number; color: string; radius?: number }> = ({ value, color, radius = 8 }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: value, friction: 8, tension: 40, useNativeDriver: false }).start();
  }, [value]);
  return (
    <Animated.View
      style={{
        width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
        height: '100%',
        borderRadius: radius,
        backgroundColor: color,
      }}
    >
      <View style={{ position: 'absolute', left: 8, right: 8, top: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' }} />
    </Animated.View>
  );
};

const CONFETTI = ['#43E34F', '#FFE34D', '#FF83D0', '#00E5D4', '#00CFFF', '#B8A7FF'];

/** Burst of confetti pieces that fall once when `active` becomes true. */
export const Confetti: React.FC<{ active: boolean; count?: number }> = ({ active, count = 26 }) => {
  const pieces = useRef(
    Array.from({ length: count }, (_, i) => ({
      v: new Animated.Value(0),
      x: (Math.random() - 0.5) * 320,
      rise: 80 + Math.random() * 160,
      fall: 260 + Math.random() * 220,
      spin: (Math.random() - 0.5) * 900,
      size: 7 + Math.random() * 7,
      color: CONFETTI[i % CONFETTI.length],
      round: i % 3 === 0,
    }))
  ).current;

  useEffect(() => {
    if (!active) return;
    pieces.forEach((p, i) => {
      p.v.setValue(0);
      Animated.timing(p.v, { toValue: 1, duration: 1300 + Math.random() * 500, delay: i * 12, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    });
  }, [active]);

  if (!active) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', top: '30%', left: '50%' }}>
        {pieces.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size * (p.round ? 1 : 0.5),
              borderRadius: p.round ? p.size : 2,
              backgroundColor: p.color,
              opacity: p.v.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] }) },
                { translateY: p.v.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, -p.rise, p.fall] }) },
                { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
};
