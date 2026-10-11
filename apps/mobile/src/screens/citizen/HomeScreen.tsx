import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Animated, Easing, RefreshControl } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/tokens';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard, RainbowCard } from '../../components/Chunky';
import { FadeInUp, CountUp, Pulse } from '../../components/Motion';
import { Icon } from '../../components/Icon';

const SvgComp = Svg as any;
const PathComp = Path as any;
const DefsComp = Defs as any;
const GradComp = LinearGradient as any;
const StopComp = Stop as any;
const RectComp = Rect as any;

/** Greeting from the local hour so it is never "Good morning" at midnight. */
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const accent = isDark ? theme.accentCyan : theme.tabBarActive;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    floating.start();
    Animated.spring(progressAnim, { toValue: 0.78, speed: 10, bounciness: 3, useNativeDriver: false }).start();
    return () => floating.stop();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 1200);
  }, []);

  const mascotY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Aarav';
  const territory = user?.territoryName ? user.territoryName.replace(/ \(.*\)/, '') : 'MCD South 34';

  // Hero is always an obsidian "object" with a cyan glow, in both themes (brand doc §1)
  const heroTop = isDark ? '#0E2A36' : '#0B2A33';
  const heroBottom = '#05070C';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AppHeader
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => {
          Haptics.selectionAsync().catch(() => {});
          navigation.navigate('Leaderboard');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}
      >
        <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>{greeting()},</Text>
        <Text style={[styles.greetingName, { color: theme.textPrimary }]}>{userName}</Text>

        {/* Hero: territory health */}
        <FadeInUp index={1}>
        <RainbowCard style={styles.hero} onPress={() => navigation.navigate('Leaderboard')}>

          <Animated.Image
            source={require('../../../assets/earth_mascot.png')}
            style={[styles.heroMascot, { transform: [{ translateY: mascotY }] }]}
            resizeMode="contain"
          />

          <Text style={styles.heroEyebrow}>YOUR TERRITORY</Text>
          <Text style={styles.heroTerritory} numberOfLines={1}>{territory}</Text>

          <View style={styles.heroMetricRow}>
            <CountUp to={78} style={styles.heroMetric} />
            <Text style={styles.heroMetricUnit}>%</Text>
            <View style={styles.heroPill}>
              <View style={[styles.heroDot, { backgroundColor: theme.accentLime }]} />
              <Text style={styles.heroPillText}>Healthy</Text>
            </View>
          </View>
          <View style={styles.heroTrack}>
            <Animated.View style={[styles.heroFill, { width: progressWidth, backgroundColor: theme.accentCyan }]} />
          </View>

          <View style={styles.heroStats}>
            {[
              ['1.2k', 'Citizens'],
              ['#342', 'Your rank'],
              ['+18%', 'This week'],
            ].map(([v, l], i) => (
              <View key={l} style={[styles.heroStat, i > 0 && styles.heroStatDivider]}>
                <Text style={[styles.heroStatValue, i === 2 && { color: theme.accentLime }]}>{v}</Text>
                <Text style={styles.heroStatLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </RainbowCard>
        </FadeInUp>

        {/* Tasks */}
        <FadeInUp index={2}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today</Text>
          <PressableScale onPress={() => navigation.navigate('Tasks')} scaleTo={0.94} haptic="light">
            <Text style={[styles.viewAll, { color: accent }]}>All tasks</Text>
          </PressableScale>
        </View>
        </FadeInUp>

        <FadeInUp index={3}>
        <View style={styles.taskRow}>
          <ChunkyCard
            style={[styles.taskTile, !isDark && { backgroundColor: '#DDF6FF' }]}
            tint="#0093B3"
            onPress={() => navigation.navigate('Scan')}
          >
            <Icon3D name="bins_dual" size={64} style={styles.taskIcon} />
            <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Scan a{'\n'}waste bin</Text>
            <ChunkyButton small variant="primary" icon="scan" label="+10 credits" onPress={() => navigation.navigate('Scan')} />
          </ChunkyCard>

          <ChunkyCard
            style={[styles.taskTile, !isDark && { backgroundColor: '#FFF6C7' }]}
            tint="#C9A800"
            onPress={() => navigation.navigate('Tasks')}
          >
            <Icon3D name="dump_spot" size={64} style={styles.taskIcon} />
            <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Report a{'\n'}dump spot</Text>
            <ChunkyButton small variant="warning" icon="camera" label="+20 credits" onPress={() => navigation.navigate('Tasks')} />
          </ChunkyCard>
        </View>
        </FadeInUp>

        {/* Live truck */}
        <FadeInUp index={4}>
        <ChunkyCard
          style={[styles.truck, !isDark && { backgroundColor: '#E4F9E3' }]}
          onPress={() => navigation.navigate('Map')}
          tint="#2BA836"
        >
          <View style={[styles.truckIcon, { backgroundColor: theme.surface2 }]}>
            <Icon3D name="truck" size={44} />
          </View>
          <View style={styles.truckInfo}>
            <View style={styles.liveRow}>
              <Pulse><View style={[styles.liveDot, { backgroundColor: theme.accentLime }]} /></Pulse>
              <Text style={[styles.liveText, { color: theme.inkAccent.accentLime }]}>LIVE</Text>
            </View>
            <Text style={[styles.truckTitle, { color: theme.textPrimary }]}>Collection truck nearby</Text>
            <Text style={[styles.truckMeta, { color: theme.textSecondary }]}>120 m away · ETA 3 min</Text>
          </View>
          <ChunkyButton small variant="success" icon="nav" label="Track" onPress={() => navigation.navigate('Map')} />
        </ChunkyCard>
        </FadeInUp>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 },

  greetingSub: { fontFamily: typography.fontBodyMedium, fontSize: 15 },
  greetingName: { fontFamily: typography.fontDisplayExtraBold, fontSize: 36, letterSpacing: -1, marginBottom: 18, marginTop: 2 },

  hero: { padding: 22, marginBottom: 20 },
  heroMascot: { position: 'absolute', right: -14, top: -10, width: 150, height: 150 },
  heroEyebrow: { fontFamily: typography.fontBodyBold, fontSize: 11, letterSpacing: 1.6, color: '#7F8B9C' },
  heroTerritory: { fontFamily: typography.fontDisplayBold, fontSize: 20, color: '#F7FFFF', marginTop: 4, maxWidth: '58%' },
  heroMetricRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 26, marginBottom: 12 },
  heroMetric: { fontFamily: typography.fontDisplayExtraBold, fontSize: 68, lineHeight: 70, letterSpacing: -2, color: '#F7FFFF', fontVariant: ['tabular-nums'] },
  heroMetricUnit: { fontFamily: typography.fontDisplayBold, fontSize: 26, color: '#B5C0CF', marginBottom: 9, marginLeft: 2 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto', marginBottom: 12, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 50, backgroundColor: 'rgba(67, 227, 79, 0.14)' },
  heroDot: { width: 7, height: 7, borderRadius: 4 },
  heroPillText: { fontFamily: typography.fontBodyBold, fontSize: 12.5, color: '#43E34F' },
  heroTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(247, 255, 255, 0.10)', overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 4 },
  heroStats: { flexDirection: 'row', marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(247, 255, 255, 0.10)' },
  heroStat: { flex: 1, paddingLeft: 4 },
  heroStatDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(247, 255, 255, 0.10)', paddingLeft: 16 },
  heroStatValue: { fontFamily: typography.fontDisplayBold, fontSize: 19, color: '#F7FFFF', fontVariant: ['tabular-nums'] },
  heroStatLabel: { fontFamily: typography.fontBodyMedium, fontSize: 12, color: '#7F8B9C', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: typography.fontDisplayBold, fontSize: 22, letterSpacing: -0.4 },
  viewAll: { fontFamily: typography.fontBodyBold, fontSize: 14 },

  taskRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  taskTile: { flex: 1, gap: 12, padding: 14 },
  taskIcon: { alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden' },
  taskTitle: { fontFamily: typography.fontDisplayBold, fontSize: 19, lineHeight: 23, letterSpacing: -0.3 },

  truck: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  truckIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  truckInfo: { flex: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontFamily: typography.fontBodyBold, fontSize: 10.5, letterSpacing: 1.2 },
  truckTitle: { fontFamily: typography.fontBodyBold, fontSize: 15.5 },
  truckMeta: { fontFamily: typography.fontBodyMedium, fontSize: 13, marginTop: 2 },
});
