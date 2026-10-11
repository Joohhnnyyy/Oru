import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Animated, Easing, RefreshControl } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/tokens';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard, RainbowCard } from '../../components/Chunky';
import { FadeInUp, CountUp, Pulse } from '../../components/Motion';
import { Icon } from '../../components/Icon';
import { CHARACTERS, GUARDIANS, characterForHealth } from '../../theme/characters';
import { api, distanceMeters } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';

/** Greeting from the local hour so it is never "Good morning" at midnight. */
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** Territory health → label + colour, so the pill always matches the number. */
const healthStatus = (pct: number) =>
  pct >= 70 ? { label: 'Healthy', color: '#43E34F' }
  : pct >= 40 ? { label: 'Recovering', color: '#FFD64A' }
  : { label: 'Needs help', color: '#FF8A65' };

const SvgComp = Svg as any;
const DefsComp = Defs as any;
const LinGradComp = LinearGradient as any;
const RadGradComp = RadialGradient as any;
const StopComp = Stop as any;
const RectComp = Rect as any;

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, token, refreshProfile } = useAuth();
  const { theme, isDark } = useTheme();
  const accent = isDark ? theme.accentCyan : theme.tabBarActive;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // ---- Live data ----
  const health = user?.territory?.health ?? null;
  const status = healthStatus(health ?? 100);
  const signedIn = !!token;
  const board = useApiData(() => api.getLeaderboard('territory'), [token], signedIn);
  const trucks = useApiData(() => api.getLiveTrucks(), [token], signedIn);
  const [here, setHere] = useState<{ latitude: number; longitude: number } | null>(null);

  // Use location only if the user already granted it (Scan asks); never prompt from Home.
  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) return;
        const pos = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (pos) setHere({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  const activeTrucks = (trucks.data?.trucks ?? []).filter((t) => t.status === 'active');
  const nearest = useMemo(() => {
    if (!here || activeTrucks.length === 0) return null;
    return activeTrucks
      .map((t) => ({ truck: t, meters: distanceMeters(here, t) }))
      .sort((a, b) => a.meters - b.meters)[0];
  }, [here, trucks.data]);
  const truckMeta = trucks.error
    ? 'Live tracking unavailable'
    : nearest
      ? `${nearest.meters < 1000 ? `${Math.round(nearest.meters / 10) * 10} m` : `${(nearest.meters / 1000).toFixed(1)} km`} away · ETA ${Math.max(1, Math.round(nearest.meters / 250))} min`
      : trucks.loading
        ? 'Finding trucks…'
        : `${activeTrucks.length} truck${activeTrucks.length === 1 ? '' : 's'} active now`;

  const myRank = board.data?.userRank;
  const mood = user?.territory?.mood;
  const stats: [string, string][] = [
    [myRank ? `#${myRank.rank}` : '—', 'Ward rank'],
    [myRank ? myRank.score.toLocaleString() : '0', 'Points this week'],
    [mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : '—', 'Mood'],
  ];
  const streak = user?.streakDays ?? 0;

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, { toValue: (health ?? 0) / 100, speed: 10, bounciness: 3, useNativeDriver: false }).start();
  }, [health]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await Promise.all([refreshProfile(), board.reload(), trucks.reload()]);
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [refreshProfile, board.reload, trucks.reload]);

  /** Last 7 days ending today; a day is "lit" when it falls inside the current streak. */
  const week = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return { key: i, letter: DAY_LETTERS[d.getDay()], lit: 6 - i < streak, isToday: i === 6 };
    });
  }, [streak]);

  const mascotY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  // Ground shadow shrinks and fades as the guardian floats up
  const shadowScale = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] });
  const shadowOpacity = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.3] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'Aarav';
  const territory = user?.territoryName ? user.territoryName.replace(/ \(.*\)/, '') : 'MCD South 34';

  const cardBg = (light: string) => (isDark ? theme.surface2 : light);

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
        {/* Greeting */}
        <FadeInUp index={0}>
          <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>{greeting()},</Text>
          <Text style={[styles.greetingName, { color: theme.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
            {userName}
          </Text>
        </FadeInUp>

        {/* Hero: territory health */}
        <FadeInUp index={1} style={styles.heroWrap}>
          <RainbowCard
            step={3}
            style={styles.hero}
            onPress={() => navigation.navigate('Leaderboard')}
            accessibilityLabel={health == null ? `Your territory ${territory}, loading` : `Your territory ${territory}, health ${health} percent, ${status.label}`}
          >
            {/* Tinted night background + soft radial spotlight behind the guardian (no hard edges) */}
            <SvgComp style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
              <DefsComp>
                <LinGradComp id="homeHeroBg" x1="0" y1="0" x2="0.55" y2="1">
                  <StopComp offset="0" stopColor="#0E2A36" />
                  <StopComp offset="1" stopColor="#05070C" />
                </LinGradComp>
                <RadGradComp id="homeHeroGlow" cx="80%" cy="24%" rx="42%" ry="34%" fx="80%" fy="24%">
                  <StopComp offset="0" stopColor="#FFD64A" stopOpacity="0.26" />
                  <StopComp offset="0.55" stopColor="#FFD64A" stopOpacity="0.07" />
                  <StopComp offset="1" stopColor="#FFD64A" stopOpacity="0" />
                </RadGradComp>
              </DefsComp>
              <RectComp width="100%" height="100%" fill="url(#homeHeroBg)" />
              <RectComp width="100%" height="100%" fill="url(#homeHeroGlow)" />
            </SvgComp>

            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroEyebrow}>Your territory</Text>
                <Text style={styles.heroTerritory} numberOfLines={1} adjustsFontSizeToFit>{territory}</Text>
                {health != null && (
                  <View style={[styles.heroPill, { backgroundColor: status.color + '1F', borderColor: status.color + '40' }]}>
                    <View style={[styles.heroDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.heroPillText, { color: status.color }]}>{status.label}</Text>
                  </View>
                )}
              </View>
              <View style={styles.mascotWrap}>
                <Animated.View style={[styles.mascotShadow, { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]} />
                <Animated.Image
                  source={characterForHealth('buddy', health)}
                  style={[styles.heroMascot, { transform: [{ translateY: mascotY }] }]}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              </View>
            </View>

            <View style={styles.heroMetricRow}>
              {health == null ? <Text style={styles.heroMetric}>--</Text> : <CountUp to={health} style={styles.heroMetric} />}
              <Text style={styles.heroMetricUnit}>%</Text>
              <Text style={styles.heroMetricCaption}>territory health</Text>
            </View>
            <View style={styles.heroTrack}>
              <Animated.View style={[styles.heroFill, { width: progressWidth }]}>
                <SvgComp width="100%" height="100%" preserveAspectRatio="none">
                  <DefsComp>
                    <LinGradComp id="homeHeroFill" x1="0" y1="0" x2="1" y2="0">
                      <StopComp offset="0" stopColor="#6EDDB0" />
                      <StopComp offset="1" stopColor="#00CFFF" />
                    </LinGradComp>
                  </DefsComp>
                  <RectComp width="100%" height="100%" fill="url(#homeHeroFill)" />
                </SvgComp>
              </Animated.View>
            </View>

            {/* Stats sit in their own inset tray (nested surface) instead of hairline rules */}
            <View style={styles.heroStats}>
              {stats.map(([v, l], i) => (
                <View key={l} style={[styles.heroStat, i > 0 && styles.heroStatDivider]}>
                  <Text style={[styles.heroStatValue, i === 2 && { color: status.color }]} numberOfLines={1} adjustsFontSizeToFit>{v}</Text>
                  <Text style={styles.heroStatLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </RainbowCard>
        </FadeInUp>

        {/* Streak strip */}
        <FadeInUp index={2}>
          <PressableScale
            scaleTo={0.97}
            onPress={() => navigation.navigate('Tasks')}
            style={[styles.streak, { backgroundColor: cardBg('#FFF4E0'), borderColor: isDark ? theme.border : '#FFE2B8' }]}
          >
            <View style={styles.streakTop}>
              <View style={styles.streakIcon}>
                <Icon name="flame" size={22} color="#FF9F1C" filled strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.streakTitle, { color: theme.textPrimary }]}>
                  {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
                </Text>
                <Text style={[styles.streakSub, { color: theme.textSecondary }]}>
                  One task today keeps it going
                </Text>
              </View>
              <Icon name="next" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.weekRow}>
              {week.map((d) => (
                <View key={d.key} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: d.lit ? '#FF9F1C' : isDark ? theme.border : '#FBE3C2' },
                      d.isToday && styles.dayToday,
                      d.isToday && { borderColor: theme.textPrimary },
                    ]}
                  >
                    {d.lit && <Icon name="check" size={13} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.dayLetter, { color: d.isToday ? theme.textPrimary : theme.textSecondary }]}>
                    {d.letter}
                  </Text>
                </View>
              ))}
            </View>
          </PressableScale>
        </FadeInUp>

        {/* Today */}
        <FadeInUp index={3}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today</Text>
            <PressableScale onPress={() => navigation.navigate('Tasks')} scaleTo={0.94} haptic="light">
              <Text style={[styles.viewAll, { color: accent }]}>All tasks</Text>
            </PressableScale>
          </View>
          <View style={styles.taskRow}>
            <ChunkyCard
              style={[styles.taskTile, !isDark && { backgroundColor: '#DDF6FF' }]}
              tint="#0093B3"
              onPress={() => navigation.navigate('Scan')}
              accessibilityLabel="Scan a waste bin, earn 10 credits"
            >
              <Icon3D name="bins_dual" size={56} style={styles.taskIcon} />
              <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Scan a{'\n'}waste bin</Text>
              <ChunkyButton small variant="primary" icon="scan" label="+10 GC" onPress={() => navigation.navigate('Scan')} />
            </ChunkyCard>

            <ChunkyCard
              style={[styles.taskTile, !isDark && { backgroundColor: '#FFF6C7' }]}
              tint="#C9A800"
              onPress={() => navigation.navigate('Tasks')}
              accessibilityLabel="Report a dump spot, earn 20 credits"
            >
              <Icon3D name="dump_spot" size={56} style={styles.taskIcon} />
              <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Report a{'\n'}dump spot</Text>
              <ChunkyButton small variant="warning" icon="camera" label="+20 GC" onPress={() => navigation.navigate('Tasks')} />
            </ChunkyCard>
          </View>
        </FadeInUp>

        {/* Live truck */}
        <FadeInUp index={4}>
          <ChunkyCard
            style={[styles.truck, !isDark && { backgroundColor: '#E4F9E3' }]}
            onPress={() => navigation.navigate('Map')}
            tint="#2BA836"
            accessibilityLabel={`Collection trucks. ${truckMeta}. Track on map`}
          >
            <View style={[styles.truckIcon, { backgroundColor: isDark ? theme.surface2 : '#FFFFFF' }]}>
              <Image source={CHARACTERS.truck} style={{ width: 44, height: 44 }} resizeMode="contain" />
            </View>
            <View style={styles.truckInfo}>
              <View style={styles.liveRow}>
                {activeTrucks.length > 0 && <Pulse><View style={[styles.liveDot, { backgroundColor: theme.accentLime }]} /></Pulse>}
                <Text style={[styles.liveText, { color: activeTrucks.length > 0 ? theme.inkAccent.accentLime : theme.textSecondary }]}>
                  {activeTrucks.length > 0 ? 'LIVE' : 'TRUCKS'}
                </Text>
              </View>
              <Text style={[styles.truckTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {nearest ? nearest.truck.name : 'Collection trucks'}
              </Text>
              <Text style={[styles.truckMeta, { color: theme.textSecondary }]}>{truckMeta}</Text>
            </View>
            <ChunkyButton small variant="success" icon="nav" label="Track" onPress={() => navigation.navigate('Map')} />
          </ChunkyCard>
        </FadeInUp>

        {/* Territory Guardians */}
        <FadeInUp index={5}>
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Territory Guardians</Text>
            <Text style={[styles.viewAll, { color: accent }]}>{GUARDIANS.length} active</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guardiansTrack}
            style={styles.guardiansBleed}
          >
            {GUARDIANS.map((g) => (
              <PressableScale
                key={g.id}
                scaleTo={0.94}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  navigation.navigate('Leaderboard');
                }}
                style={[styles.guardianCard, { backgroundColor: cardBg(g.bg) }]}
              >
                <Image source={CHARACTERS[g.id]} style={styles.guardianAvatar} resizeMode="contain" />
                <Text style={[styles.guardianName, { color: theme.textPrimary }]} numberOfLines={1}>{g.name}</Text>
                <Text style={[styles.guardianRole, { color: g.accent }]} numberOfLines={2}>{g.role}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        </FadeInUp>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 140 },

  greetingSub: { fontFamily: typography.fontBodyMedium, fontSize: 15 },
  greetingName: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, letterSpacing: -0.8, marginBottom: 16, marginTop: 0 },

  heroWrap: { marginBottom: 18 },
  hero: { padding: 20, paddingBottom: 16, borderWidth: 1, borderColor: 'rgba(247, 255, 255, 0.07)' },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroText: { flex: 1, paddingRight: 8 },
  heroEyebrow: { fontFamily: typography.fontBodyMedium, fontSize: 13, color: '#8FA3B5' },
  heroTerritory: { fontFamily: typography.fontDisplayExtraBold, fontSize: 26, letterSpacing: -0.5, color: '#F7FFFF', marginTop: 2 },
  heroPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  heroDot: { width: 7, height: 7, borderRadius: 4 },
  heroPillText: { fontFamily: typography.fontBodyBold, fontSize: 12.5 },
  mascotWrap: { width: 112, height: 112, alignItems: 'center', justifyContent: 'flex-end' },
  mascotShadow: { position: 'absolute', bottom: 2, width: 62, height: 10, borderRadius: 31, backgroundColor: '#000000' },
  heroMascot: { width: 108, height: 108 },
  heroMetricRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6, marginBottom: 10 },
  heroMetric: { fontFamily: typography.fontDisplayExtraBold, fontSize: 56, lineHeight: 60, letterSpacing: -2, color: '#F7FFFF', fontVariant: ['tabular-nums'] },
  heroMetricUnit: { fontFamily: typography.fontDisplayBold, fontSize: 22, color: '#B5C0CF', marginBottom: 9, marginLeft: 2 },
  heroMetricCaption: { fontFamily: typography.fontBodyMedium, fontSize: 13, color: '#8FA3B5', marginBottom: 12, marginLeft: 8 },
  heroTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(247, 255, 255, 0.09)', overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 5, overflow: 'hidden' },
  heroStats: { flexDirection: 'row', marginTop: 16, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 18, backgroundColor: 'rgba(247, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(247, 255, 255, 0.06)' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(247, 255, 255, 0.08)' },
  heroStatValue: { fontFamily: typography.fontDisplayBold, fontSize: 18, color: '#F7FFFF', fontVariant: ['tabular-nums'] },
  heroStatLabel: { fontFamily: typography.fontBodyMedium, fontSize: 11.5, color: '#8FA3B5', marginTop: 1 },

  streak: { borderRadius: 22, borderWidth: 1.5, padding: 14, marginBottom: 22, gap: 12 },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 159, 28, 0.16)', alignItems: 'center', justifyContent: 'center' },
  streakTitle: { fontFamily: typography.fontDisplayBold, fontSize: 17 },
  streakSub: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayToday: { borderWidth: 2 },
  dayLetter: { fontFamily: typography.fontBodyBold, fontSize: 11 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: typography.fontDisplayBold, fontSize: 21, letterSpacing: -0.4 },
  viewAll: { fontFamily: typography.fontBodyBold, fontSize: 14 },

  taskRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  taskTile: { flex: 1, gap: 10, padding: 14 },
  taskIcon: { alignSelf: 'flex-start', borderRadius: 18, overflow: 'hidden' },
  taskTitle: { fontFamily: typography.fontDisplayBold, fontSize: 17, lineHeight: 21, letterSpacing: -0.3 },

  truck: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  truckIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  truckInfo: { flex: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontFamily: typography.fontBodyBold, fontSize: 10.5, letterSpacing: 1.2 },
  truckTitle: { fontFamily: typography.fontBodyBold, fontSize: 15.5 },
  truckMeta: { fontFamily: typography.fontBodyMedium, fontSize: 13, marginTop: 2 },

  guardiansBleed: { marginHorizontal: -20 },
  guardiansTrack: { gap: 12, paddingHorizontal: 20, paddingBottom: 6 },
  guardianCard: { width: 150, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 22, alignItems: 'center', gap: 4 },
  guardianAvatar: { width: 76, height: 76, marginBottom: 4 },
  guardianName: { fontFamily: typography.fontDisplayBold, fontSize: 16, textAlign: 'center' },
  guardianRole: { fontFamily: typography.fontBodyMedium, fontSize: 11.5, lineHeight: 15, textAlign: 'center', minHeight: 30 },
});
