import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';
import { useTheme } from '../../context/ThemeContext';
import { Blobatar } from '../../components/Blobatar';
import { ChunkyButton, ChunkyCard, ChunkyProgress, RainbowCard } from '../../components/Chunky';
import { typography } from '../../theme/tokens';
import { Icon } from '../../components/Icon';
import { FadeInUp, CountUp } from '../../components/Motion';
import { AvatarPresetKey, AvatarAnimationKey } from '../../avatar/avatarRuntimeSource';
import { CHARACTERS, GUARDIANS, GuardianInfo } from '../../theme/characters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRESET_OPTIONS: { id: AvatarPresetKey; name: string; tag: string }[] = [
  { id: 'safari-mint', name: 'Powersheep', tag: 'Eco Guardian' },
  { id: 'strobi', name: 'Strobi', tag: 'Classic Blue' },
  { id: 'freddy', name: 'Freddy', tag: 'Warm Orange' },
  { id: 'citrus', name: 'Citrus', tag: 'Sun Spark' },
  { id: 'nova', name: 'Nova', tag: 'Teal Byte' },
  { id: 'kirby', name: 'Kirby', tag: 'Soft Bloom' },
  { id: 'sunee', name: 'Sunee', tag: 'Amber Glow' },
  { id: 'cloudee', name: 'Cloudee', tag: 'Mist Feather' },
];

interface AvatarThemePalette {
  brightGradient: [string, string];
  darkGradient: [string, string];
  buttonBgBright: string;
  buttonBgDark: string;
  buttonBorderDark: string;
  xpFillBright: string;
  xpFillDark: string;
  accentBright: string;
  accentDark: string;
}

const AVATAR_PALETTES: Record<AvatarPresetKey, AvatarThemePalette> = {
  'safari-mint': {
    // Body #00e5b3 - Mint Eco Buddy
    brightGradient: ['#E6FFFA', '#26BA9B'],
    darkGradient: ['#04352D', '#021C18'],
    buttonBgBright: '#26BA9B',
    buttonBgDark: '#074B40',
    buttonBorderDark: '#00E5D4',
    xpFillBright: '#26BA9B',
    xpFillDark: '#00E5D4',
    accentBright: '#0D9488',
    accentDark: '#00E5D4',
  },
  'strobi': {
    // Body #5b7fe5 - Royal Periwinkle
    brightGradient: ['#EEF2FF', '#5B7FE5'],
    darkGradient: ['#1E1B4B', '#0D1129'],
    buttonBgBright: '#5B7FE5',
    buttonBgDark: '#1E2548',
    buttonBorderDark: '#60A5FA',
    xpFillBright: '#5B7FE5',
    xpFillDark: '#60A5FA',
    accentBright: '#4F46E5',
    accentDark: '#818CF8',
  },
  'freddy': {
    // Body #e6855c - Warm Orange
    brightGradient: ['#FFF7ED', '#E6855C'],
    darkGradient: ['#431407', '#1A0802'],
    buttonBgBright: '#E6855C',
    buttonBgDark: '#4A1B0B',
    buttonBorderDark: '#FB923C',
    xpFillBright: '#E6855C',
    xpFillDark: '#FB923C',
    accentBright: '#EA580C',
    accentDark: '#FB923C',
  },
  'citrus': {
    // Body #ffcf24 - Sun Spark Gold
    brightGradient: ['#FEFCE8', '#EAB308'],
    darkGradient: ['#422006', '#1A0E02'],
    buttonBgBright: '#EAB308',
    buttonBgDark: '#4D2C06',
    buttonBorderDark: '#FBBF24',
    xpFillBright: '#EAB308',
    xpFillDark: '#FBBF24',
    accentBright: '#D97706',
    accentDark: '#FBBF24',
  },
  'nova': {
    // Body #55b6c3 - Teal Byte Cyan
    brightGradient: ['#ECFEFF', '#0891B2'],
    darkGradient: ['#083344', '#041720'],
    buttonBgBright: '#0891B2',
    buttonBgDark: '#0A4458',
    buttonBorderDark: '#22D3EE',
    xpFillBright: '#0891B2',
    xpFillDark: '#22D3EE',
    accentBright: '#0891B2',
    accentDark: '#22D3EE',
  },
  'kirby': {
    // Body #ffc2e9 - Soft Bloom Pink
    brightGradient: ['#FDF2F8', '#DB2777'],
    darkGradient: ['#500724', '#20020E'],
    buttonBgBright: '#DB2777',
    buttonBgDark: '#5C0B2B',
    buttonBorderDark: '#F472B6',
    xpFillBright: '#DB2777',
    xpFillDark: '#F472B6',
    accentBright: '#DB2777',
    accentDark: '#F472B6',
  },
  'sunee': {
    // Body #e69a5c - Amber Glow
    brightGradient: ['#FFFBEB', '#D97706'],
    darkGradient: ['#451A03', '#1A0901'],
    buttonBgBright: '#D97706',
    buttonBgDark: '#4D2005',
    buttonBorderDark: '#F59E0B',
    xpFillBright: '#D97706',
    xpFillDark: '#F59E0B',
    accentBright: '#D97706',
    accentDark: '#F59E0B',
  },
  'cloudee': {
    // Body #c9cbcf - Mist Feather
    brightGradient: ['#F8FAFC', '#94A3B8'],
    darkGradient: ['#1E293B', '#0B0F19'],
    buttonBgBright: '#94A3B8',
    buttonBgDark: '#334155',
    buttonBorderDark: '#CBD5E1',
    xpFillBright: '#94A3B8',
    xpFillDark: '#CBD5E1',
    accentBright: '#64748B',
    accentDark: '#94A3B8',
  },
  'cubee': {
    // Body #e65c5c - Coral Flame
    brightGradient: ['#FEF2F2', '#EF4444'],
    darkGradient: ['#450A0A', '#1F0303'],
    buttonBgBright: '#DC2626',
    buttonBgDark: '#540F0F',
    buttonBorderDark: '#F87171',
    xpFillBright: '#DC2626',
    xpFillDark: '#F87171',
    accentBright: '#DC2626',
    accentDark: '#F87171',
  },
  'onee': {
    // Body #dbe2f5 - Ice Lavender
    brightGradient: ['#EEF2FF', '#818CF8'],
    darkGradient: ['#1E1B4B', '#0D0E24'],
    buttonBgBright: '#6366F1',
    buttonBgDark: '#2A2B5E',
    buttonBorderDark: '#A5B4FC',
    xpFillBright: '#6366F1',
    xpFillDark: '#A5B4FC',
    accentBright: '#6366F1',
    accentDark: '#A5B4FC',
  },
  'grok-bot': {
    // Body #000000 - Obsidian
    brightGradient: ['#F1F5F9', '#475569'],
    darkGradient: ['#1E293B', '#050811'],
    buttonBgBright: '#475569',
    buttonBgDark: '#1E293B',
    buttonBorderDark: '#00E5D4',
    xpFillBright: '#334155',
    xpFillDark: '#00E5D4',
    accentBright: '#334155',
    accentDark: '#00E5D4',
  },
};

const SvgComponent = Svg as any;
const DefsComponent = Defs as any;
const GradientComponent = SvgLinearGradient as any;
const StopComponent = Stop as any;
const RectComponent = Rect as any;

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, token, signOut } = useAuth();
  const rankBoard = useApiData(() => api.getLeaderboard('citywide'), [token], !!token);
  const { theme, isDark, toggleTheme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<AvatarPresetKey>('safari-mint');
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimationKey>('proud');
  const [showAvatarLab, setShowAvatarLab] = useState(false);
  const [activeGuardian, setActiveGuardian] = useState<GuardianInfo>(GUARDIANS[0]);
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          navigation.replace('Splash');
        },
      },
    ]);
  };

  const currentPresetObj = PRESET_OPTIONS.find((p) => p.id === selectedPreset) || PRESET_OPTIONS[0];
  const currentPalette = AVATAR_PALETTES[selectedPreset] || AVATAR_PALETTES['safari-mint'];
  const gradientStops = isDark ? currentPalette.darkGradient : currentPalette.brightGradient;
  const gradientId = `heroGrad-${selectedPreset}-${isDark ? 'dark' : 'bright'}`;
  const accent = isDark ? currentPalette.accentDark : currentPalette.accentBright;
  const credits = user?.greenCredits ?? 0;
  const myRank = rankBoard.data?.userRank?.rank;
  const territoryName = user?.territory?.name || user?.territoryName || 'Delhi';

  const stats: [string, string, keyof typeof theme.inkAccent][] = [
    [myRank ? `#${myRank}` : '—', 'City rank', 'accentYellow'],
    [`${user?.streakDays ?? 0}`, 'Day streak', 'accentCyan'],
    [credits.toLocaleString(), 'Credits', 'accentLime'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 20) + 10 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Profile</Text>

        {/* Character hero */}
        <RainbowCard style={styles.hero}>
          <SvgComponent width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <DefsComponent>
              <GradientComponent id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <StopComponent offset="0%" stopColor={gradientStops[0]} stopOpacity="1" />
                <StopComponent offset="100%" stopColor={gradientStops[1]} stopOpacity="1" />
              </GradientComponent>
            </DefsComponent>
            <RectComponent width="100%" height="100%" fill={`url(#${gradientId})`} />
          </SvgComponent>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const anims: AvatarAnimationKey[] = ['celebrate', 'laughing', 'playful', 'excited', 'proud'];
              setAvatarAnim(anims[(anims.indexOf(avatarAnim) + 1) % anims.length]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            style={styles.mascotWrapper}
            accessibilityRole="button"
            accessibilityLabel="Play avatar animation"
          >
            <Blobatar preset={selectedPreset} animation={avatarAnim} size={140} interactive={false} />
          </TouchableOpacity>
        </RainbowCard>

        <View style={styles.identity}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{currentPresetObj.name}</Text>
          <Text style={[styles.role, { color: theme.textSecondary }]}>
            {user?.displayName || 'Citizen'} · {territoryName}{user?.rankTitle ? ` · ${user.rankTitle}` : ''}
          </Text>
        </View>

        {/* Level */}
        <ChunkyCard style={styles.level} tint={accent}>
          <View style={styles.levelTop}>
            <Text style={[styles.levelLabel, { color: accent }]}>LEVEL 4</Text>
            <Text style={[styles.levelXp, { color: theme.textSecondary }]}>81 / 100 XP</Text>
          </View>
          <ChunkyProgress value={0.81} color={accent} track={theme.surface3} />
        </ChunkyCard>

        {/* Stats */}
        <View style={styles.stats}>
          {stats.map(([v, l, c]) => (
            <ChunkyCard key={l} style={styles.stat} tint={theme[c]}>
              <CountUp to={Number(v.replace(/,/g, ''))} format={(n) => Math.round(n).toLocaleString()} style={[styles.statVal, { color: theme.inkAccent[c] }]} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{l}</Text>
            </ChunkyCard>
          ))}
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <ChunkyButton small variant="secondary" label="Ranks" icon="trophy" style={{ flex: 1 }} onPress={() => navigation.navigate('Leaderboard')} />
          <ChunkyButton small variant="secondary" label="Quests" icon="target" style={{ flex: 1 }} onPress={() => navigation.navigate('Tasks')} />
          <ChunkyButton
            small
            variant={showAvatarLab ? 'primary' : 'secondary'}
            label="Buddy"
            icon="sparkles"
            style={{ flex: 1 }}
            onPress={() => setShowAvatarLab(!showAvatarLab)}
          />
        </View>

        {showAvatarLab && (
          <ChunkyCard style={styles.lab}>
            <Text style={[styles.labTitle, { color: theme.textPrimary }]}>Choose your buddy</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {PRESET_OPTIONS.map((item) => (
                <ChunkyButton
                  key={item.id}
                  small
                  variant={selectedPreset === item.id ? 'primary' : 'secondary'}
                  label={item.name}
                  onPress={() => {
                    setSelectedPreset(item.id);
                    setAvatarAnim('excited');
                  }}
                />
              ))}
            </ScrollView>
          </ChunkyCard>
        )}

        {/* Territory Guardian Companion */}
        <ChunkyCard style={styles.guardianCard} tint={activeGuardian.accent}>
          <View style={styles.guardianRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.guardianEyebrow, { color: activeGuardian.accent }]}>TERRITORY GUARDIAN</Text>
              <Text style={[styles.guardianTitle, { color: theme.textPrimary }]}>{activeGuardian.name}</Text>
              <Text style={[styles.guardianSpecies, { color: theme.textSecondary }]}>{activeGuardian.species}</Text>
              <Text style={[styles.guardianRoleText, { color: activeGuardian.accent }]}>{activeGuardian.role}</Text>
              <Text style={[styles.guardianMission, { color: theme.textSecondary }]}>{activeGuardian.mission}</Text>
            </View>
            <View style={[styles.guardianImageWrap, { backgroundColor: isDark ? theme.surface2 : activeGuardian.bg }]}>
              <Image source={CHARACTERS[activeGuardian.id]} style={styles.guardianImage} resizeMode="contain" />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guardianSelectorTrack}>
            {GUARDIANS.map((g) => {
              const isSelected = activeGuardian.id === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  activeOpacity={0.8}
                  style={[
                    styles.guardianPill,
                    {
                      backgroundColor: isSelected ? g.accent : (isDark ? theme.surface2 : '#FFFFFF'),
                      borderColor: isSelected ? g.accent : theme.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveGuardian(g);
                  }}
                >
                  <Image source={CHARACTERS[g.id]} style={styles.guardianPillIcon} resizeMode="contain" />
                  <Text style={[styles.guardianPillText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ChunkyCard>

        {/* Settings */}
        <ChunkyCard style={styles.settings} onPress={() => { Haptics.selectionAsync().catch(() => {}); toggleTheme(); }}>
          <View style={styles.settingLeft}>
            <Icon name={isDark ? 'moon' : 'sun'} size={20} color={theme.textPrimary} />
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Theme</Text>
          </View>
          <View style={[styles.themeBadge, { borderColor: theme.accentCyan }]}>
            <Text style={[styles.themeBadgeText, { color: isDark ? theme.accentCyan : theme.tabBarActive }]}>
              {isDark ? 'Obsidian Neon' : 'Bright Light'}
            </Text>
          </View>
        </ChunkyCard>

        <ChunkyCard style={styles.settings} onPress={() => Alert.alert('Ward notifications', `Civic alert notifications are active for ${territoryName}.`)}>
          <View style={styles.settingLeft}>
            <Icon name="bell" size={20} color={theme.textPrimary} />
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Notifications</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>On</Text>
        </ChunkyCard>

        <ChunkyButton label="Log out" icon="logout" variant="danger" onPress={handleSignOut} style={{ marginTop: 10 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 130, gap: 14 },
  screenTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 34, letterSpacing: -0.8 },
  hero: { height: 190, alignItems: 'center', justifyContent: 'center' },
  mascotWrapper: { alignItems: 'center', justifyContent: 'center' },
  identity: { alignItems: 'center' },
  name: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, letterSpacing: -0.6 },
  role: { fontFamily: typography.fontBodyMedium, fontSize: 14.5, marginTop: 3 },
  level: { gap: 10 },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between' },
  levelLabel: { fontFamily: typography.fontDisplayExtraBold, fontSize: 13, letterSpacing: 1.4 },
  levelXp: { fontFamily: typography.fontBodyBold, fontSize: 13, fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, padding: 12, alignItems: 'center' },
  statVal: { fontFamily: typography.fontDisplayExtraBold, fontSize: 26, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: typography.fontBodyMedium, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  lab: { gap: 12 },
  labTitle: { fontFamily: typography.fontBodyBold, fontSize: 15 },

  guardianCard: { gap: 12, padding: 16 },
  guardianRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  guardianEyebrow: { fontFamily: typography.fontBodyBold, fontSize: 10.5, letterSpacing: 1.4 },
  guardianTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 22, letterSpacing: -0.3 },
  guardianSpecies: { fontFamily: typography.fontBodyMedium, fontSize: 12 },
  guardianRoleText: { fontFamily: typography.fontBodyBold, fontSize: 13, marginTop: 2 },
  guardianMission: { fontFamily: typography.fontBodyMedium, fontSize: 12, lineHeight: 16 },
  guardianImageWrap: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  guardianImage: { width: 84, height: 84 },
  guardianSelectorTrack: { gap: 8, paddingTop: 4 },
  guardianPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 30, borderWidth: 2 },
  guardianPillIcon: { width: 24, height: 24 },
  guardianPillText: { fontFamily: typography.fontBodyBold, fontSize: 12 },

  settings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontFamily: typography.fontBodyBold, fontSize: 16 },
  settingValue: { fontFamily: typography.fontBodyBold, fontSize: 14 },
  themeBadge: { borderWidth: 2, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5 },
  themeBadgeText: { fontFamily: typography.fontBodyBold, fontSize: 12.5 },
});
