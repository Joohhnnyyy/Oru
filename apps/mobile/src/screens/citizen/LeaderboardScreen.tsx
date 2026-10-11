import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, RefreshControl, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api, LeaderboardResponse } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { FadeInUp, PopIn } from '../../components/Motion';
import { Icon } from '../../components/Icon';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';
import { CHARACTERS, CharacterId } from '../../theme/characters';

interface LeaderboardItem {
  rank: number;
  name: string;
  subtitle?: string;
  score: string;
  change: string;
  isUser?: boolean;
  character?: CharacterId;
}

const CHARACTER_IDS: CharacterId[] = ['dolphin', 'turtle', 'leopard', 'sparrow', 'bustard', 'crane'];
const asCharacter = (mascot: string | undefined, rank: number): CharacterId =>
  mascot && (CHARACTER_IDS as string[]).includes(mascot) ? (mascot as CharacterId) : CHARACTER_IDS[(rank - 1) % CHARACTER_IDS.length];
const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

function toItems(res: LeaderboardResponse | null, kind: 'territories' | 'citizens', myId?: string): LeaderboardItem[] {
  if (!res) return [];
  return res.entries.map((e) =>
    kind === 'territories'
      ? {
          rank: e.rank,
          name: e.name,
          subtitle: [cap(e.mood), e.mascot ? cap(e.mascot) : ''].filter(Boolean).join(' · '),
          score: `${e.score}%`,
          change: cap(e.mood),
          character: asCharacter(e.mascot, e.rank),
        }
      : {
          rank: e.rank,
          name: e.name,
          subtitle: e.tier,
          score: `${e.score.toLocaleString()} XP`,
          change: '',
          isUser: e.id === myId,
          character: e.id === myId ? 'buddy' : undefined,
        },
  );
}

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const LeaderboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'territories' | 'citizens'>('territories');
  const [refreshing, setRefreshing] = useState(false);
  const board = useApiData(
    () => api.getLeaderboard(activeTab === 'territories' ? 'territories' : 'citywide'),
    [token, activeTab],
    !!token,
  );
  const list = toItems(board.data, activeTab, user?.userId);
  const me = board.data?.userRank;
  // Show the signed-in citizen at the bottom if they aren't in the top list
  const extraMe =
    activeTab === 'citizens' && me && !list.some((i) => i.isUser)
      ? [{ ...toItems({ ...board.data!, entries: [me] }, 'citizens', user?.userId)[0], isUser: true, character: 'buddy' as CharacterId }]
      : [];
  const onRefresh = async () => {
    setRefreshing(true);
    await board.reload();
    setRefreshing(false);
  };
  const palette = [theme.accentYellow, theme.accentCyan, theme.accentPink, theme.accentLavender, theme.accentLime, theme.accentTurquoise];
  const medal = ['#FFE34D', '#C9D3E0', '#FF9F5A'];

  // Podium order: 2nd, 1st, 3rd
  const podium = [list[1], list[0], list[2]].filter(Boolean) as LeaderboardItem[];
  const heights = [96, 128, 78];

  const Avatar = ({ item, size, ring }: { item: LeaderboardItem; size: number; ring?: string }) => (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette[(item.rank - 1) % palette.length],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: ring,
        overflow: 'hidden',
      }}
    >
      {item.character ? (
        <Image
          source={CHARACTERS[item.character]}
          style={{ width: size * 0.86, height: size * 0.86 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontFamily: typography.fontDisplayExtraBold, fontSize: size * 0.36, color: '#05070C' }}>{initials(item.name)}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScreenHeader
          title="Leaderboard"
          subtitle={board.data ? `Delhi NCR · week ${board.data.periodKey.split('-W')[1] ?? ''}` : 'Delhi NCR · this week'}
          onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined}
        />

        <View style={[styles.segment, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          {(['territories', 'citizens'] as const).map((t) => (
            <ChunkyButton
              key={t}
              small
              variant={activeTab === t ? 'primary' : 'ghost'}
              label={t}
              style={{ flex: 1 }}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab(t);
              }}
            />
          ))}
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {podium.map((item) => {
            const i = item.rank === 1 ? 1 : item.rank === 2 ? 0 : 2;
            return (
            <View key={item.rank} style={styles.podiumCol}>
              {item.rank === 1 ? (
                <PopIn delay={500}>
                  <Icon name="crown" size={28} color="#FFB800" filled strokeWidth={2} />
                </PopIn>
              ) : null}
              <Avatar item={item} size={i === 1 ? 68 : 56} ring={medal[item.rank - 1]} />
              <Text style={[styles.podName, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.name.split(' ')[0]}
              </Text>
              <Text style={[styles.podScore, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.score.replace(' Health', '')}
              </Text>
              <View style={[styles.block, { height: heights[i], backgroundColor: medal[item.rank - 1] }]}>
                <Text style={styles.blockNum}>{item.rank}</Text>
              </View>
            </View>
            );
          })}
        </View>

        {/* Rest of the list */}
        <View style={styles.list}>
          {board.loading && !board.data ? <ActivityIndicator color={theme.accentCyan} style={{ marginTop: 16 }} /> : null}
          {board.error && !board.data ? (
            <Text style={[styles.sub, { color: theme.textSecondary, textAlign: 'center' }]}>{board.error}</Text>
          ) : null}
          {[...list.slice(3), ...extraMe].map((item, idx) => (
            <FadeInUp key={`${item.rank}-${item.name}`} index={idx + 3}>
            <ChunkyCard
              style={styles.row}
              tint={item.isUser ? theme.accentCyan : undefined}
            >
              <Text style={[styles.rank, { color: theme.textMuted }]}>{item.rank}</Text>
              <Avatar item={item} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.name}
                  {item.isUser ? ' (You)' : ''}
                </Text>
                {item.subtitle ? <Text style={[styles.sub, { color: theme.textSecondary }]}>{item.subtitle}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.score, { color: theme.textPrimary }]}>{item.score.replace(' Health', '')}</Text>
                {item.change ? <Text style={[styles.change, { color: theme.success }]}>{item.change}</Text> : null}
              </View>
            </ChunkyCard>
            </FadeInUp>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  segment: { flexDirection: 'row', gap: 4, marginHorizontal: 20, padding: 4, borderRadius: 20, borderWidth: 2, marginBottom: 26 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, gap: 10, marginBottom: 26 },
  podiumCol: { flex: 1, alignItems: 'center' },
  podName: { fontFamily: typography.fontBodyBold, fontSize: 14, marginTop: 8 },
  podScore: { fontFamily: typography.fontBodyMedium, fontSize: 12, marginBottom: 8 },
  block: { width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center', paddingTop: 10 },
  blockNum: { fontFamily: typography.fontDisplayExtraBold, fontSize: 30, color: '#05070C' },
  list: { paddingHorizontal: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rank: { fontFamily: typography.fontDisplayExtraBold, fontSize: 18, width: 22, textAlign: 'center' },
  name: { fontFamily: typography.fontBodyBold, fontSize: 15.5 },
  sub: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 2 },
  score: { fontFamily: typography.fontDisplayBold, fontSize: 15, fontVariant: ['tabular-nums'] },
  change: { fontFamily: typography.fontBodyBold, fontSize: 12.5, marginTop: 2 },
});
