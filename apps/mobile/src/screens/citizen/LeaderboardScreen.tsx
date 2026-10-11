import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { FadeInUp, PopIn } from '../../components/Motion';
import { Icon } from '../../components/Icon';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

interface LeaderboardItem {
  rank: number;
  name: string;
  subtitle?: string;
  score: string;
  change: string;
  isUser?: boolean;
}

const TERRITORY_RANKS: LeaderboardItem[] = [
  { rank: 1, name: 'Green Park', subtitle: 'South Delhi', score: '78% Health', change: '+18%' },
  { rank: 2, name: 'Lake View', subtitle: 'East Delhi', score: '74% Health', change: '+15%' },
  { rank: 3, name: 'Sunrise Nagar', subtitle: 'Central Delhi', score: '71% Health', change: '+12%' },
  { rank: 4, name: 'AIIMS Area', subtitle: 'South Delhi', score: '68% Health', change: '+10%' },
  { rank: 5, name: 'Nehru Vihar', subtitle: 'North Delhi', score: '65% Health', change: '+9%' },
  { rank: 6, name: 'Lajpat Nagar', subtitle: 'South Delhi', score: '62% Health', change: '+7%' },
];

const CITIZEN_RANKS: LeaderboardItem[] = [
  { rank: 1, name: 'Priya Sharma', subtitle: 'Green Park', score: '3,450 credits', change: '+450' },
  { rank: 2, name: 'Aarav Mehta', subtitle: 'Lake View', score: '3,120 credits', change: '+380' },
  { rank: 3, name: 'Rohan Gupta', subtitle: 'Sunrise Nagar', score: '2,890 credits', change: '+320' },
  { rank: 4, name: 'Ansh Johnson', subtitle: 'Green Park', score: '1,240 credits', change: '+210', isUser: true },
  { rank: 5, name: 'Sneha Patel', subtitle: 'AIIMS Area', score: '1,180 credits', change: '+190' },
];

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const LeaderboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'territories' | 'citizens'>('territories');
  const list = activeTab === 'territories' ? TERRITORY_RANKS : CITIZEN_RANKS;
  const palette = [theme.accentYellow, theme.accentCyan, theme.accentPink, theme.accentLavender, theme.accentLime, theme.accentTurquoise];
  const medal = ['#FFE34D', '#C9D3E0', '#FF9F5A'];

  // Podium order: 2nd, 1st, 3rd
  const podium = [list[1], list[0], list[2]];
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
      }}
    >
      <Text style={{ fontFamily: typography.fontDisplayExtraBold, fontSize: size * 0.36, color: '#05070C' }}>{initials(item.name)}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Leaderboard"
          subtitle="Delhi NCR · this week"
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
          {podium.map((item, i) => (
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
          ))}
        </View>

        {/* Rest of the list */}
        <View style={styles.list}>
          {list.slice(3).map((item, idx) => (
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
                <Text style={[styles.change, { color: theme.success }]}>{item.change}</Text>
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
