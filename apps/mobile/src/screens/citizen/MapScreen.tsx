import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Icon3D } from '../../components/Icon3D';
import { Google3DMap } from '../../components/Google3DMap';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/tokens';

const GOOGLE_MAPS_KEY = 'REMOVED_CREDENTIAL';

const DELHI_TERRITORIES = [
  { id: '1', code: 'S34', name: 'MCD South 34 (Lajpat Nagar)', mascot: 'Dolphin Sanctuary', health: 72, mood: 'Recovering', cleanIndex: 7.2, trucks: 2, color: '#00CFFF' },
  { id: '2', code: 'C12', name: 'MCD Central 12 (Connaught Place)', mascot: 'Blackbuck Habitat', health: 88, mood: 'Thriving', cleanIndex: 8.8, trucks: 3, color: '#43E34F' },
  { id: '3', code: 'E45', name: 'MCD East 45 (Mayur Vihar)', mascot: 'Peacock Zone', health: 64, mood: 'Recovering', cleanIndex: 6.4, trucks: 1, color: '#FFE34D' },
  { id: '4', code: 'W23', name: 'MCD West 23 (Rajouri Garden)', mascot: 'Leopard Ridge', health: 48, mood: 'Critical', cleanIndex: 4.8, trucks: 1, color: '#FF6B7A' },
  { id: '5', code: 'N08', name: 'MCD North 08 (Civil Lines)', mascot: 'Nilgai Grove', health: 92, mood: 'Legendary', cleanIndex: 9.2, trucks: 4, color: '#B8A7FF' },
];

const FILTERS = [
  ['all', 'All', 'map'],
  ['trucks', 'Trucks', 'truck'],
  ['drop_points', 'Bins', 'recycle'],
] as const;

export const MapScreen: React.FC<{ navigation: any }> = () => {
  const { theme } = useTheme();
  const [selectedTerritory, setSelectedTerritory] = useState(DELHI_TERRITORIES[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trucks' | 'drop_points'>('all');

  const handleSelectTerritory = (t: (typeof DELHI_TERRITORIES)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTerritory(t);
  };

  const handleSelectTerritoryById = (id: string) => {
    const found = DELHI_TERRITORIES.find((t) => t.id === id);
    if (found) handleSelectTerritory(found);
  };

  const t = selectedTerritory;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader title="Map" subtitle="Delhi NCR territories" />

      <View style={styles.mapCanvas}>
        <Google3DMap
          apiKey={GOOGLE_MAPS_KEY}
          selectedTerritoryId={t.id}
          onSelectTerritory={handleSelectTerritoryById}
          activeFilter={activeFilter}
        />

        <View style={styles.floatingOverlay}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nodes}>
            {DELHI_TERRITORIES.map((d) => {
              const on = d.id === t.id;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => handleSelectTerritory(d)}
                  style={[
                    styles.node,
                    { borderColor: d.color, backgroundColor: on ? d.color : theme.card, borderBottomWidth: on ? 2 : 5 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.name}, ${d.health}% health`}
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.nodeCode, { color: on ? '#05070C' : d.color }]}>{d.code}</Text>
                  <Text style={[styles.nodeHealth, { color: on ? '#05070C' : theme.textPrimary }]}>{d.health}%</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.filters}>
            {FILTERS.map(([key, label, icon]) => (
              <ChunkyButton
                key={key}
                small
                icon={icon}
                label={label}
                variant={activeFilter === key ? 'primary' : 'secondary'}
                style={{ flex: 1 }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveFilter(key);
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.sheet, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {t.name.replace(/ \(.*\)/, '')}
            </Text>
            <Text style={[styles.sheetSub, { color: theme.textSecondary }]}>{t.mascot}</Text>
          </View>
          <View style={[styles.mood, { backgroundColor: t.color }]}>
            <Text style={styles.moodText}>{t.mood}</Text>
          </View>
        </View>

        <ChunkyProgress value={t.health / 100} color={t.color} track={theme.surface3} height={14} />

        <View style={styles.stats}>
          {[
            [`${t.health}`, 'Health'],
            [`${t.cleanIndex}`, 'Clean idx'],
            [`${t.trucks}`, 'Trucks'],
          ].map(([v, l]) => (
            <ChunkyCard key={l} style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>{v}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{l}</Text>
            </ChunkyCard>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 110 }}>
          {[
            { icon: 'truck' as const, title: 'Truck DL-1M-4821', sub: 'On route · 120 m away', action: 'Live' },
            { icon: 'bin' as const, title: 'Central Market Bin #402', sub: 'Smart bin · 350 m away', action: 'Go' },
          ].map((r) => (
            <ChunkyCard key={r.title} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: theme.surface2 }]}>
                <Icon3D name={r.icon} size={40} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{r.title}</Text>
                <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{r.sub}</Text>
              </View>
              <ChunkyButton small label={r.action} variant={r.action === 'Live' ? 'success' : 'primary'} />
            </ChunkyCard>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapCanvas: { height: 250, position: 'relative', marginHorizontal: 0 },
  floatingOverlay: { position: 'absolute', bottom: 10, left: 0, right: 0, gap: 8, zIndex: 10 },
  nodes: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  node: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nodeCode: { fontFamily: typography.fontDisplayExtraBold, fontSize: 13 },
  nodeHealth: { fontFamily: typography.fontBodyBold, fontSize: 11, fontVariant: ['tabular-nums'] },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },

  sheet: { flex: 1, marginTop: -14, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 2, borderBottomWidth: 0, paddingHorizontal: 20, paddingTop: 10, gap: 14 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 24, letterSpacing: -0.5 },
  sheetSub: { fontFamily: typography.fontBodyMedium, fontSize: 13.5, marginTop: 2 },
  mood: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  moodText: { fontFamily: typography.fontBodyBold, fontSize: 12.5, color: '#05070C' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, padding: 10, alignItems: 'center' },
  statVal: { fontFamily: typography.fontDisplayExtraBold, fontSize: 24, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: typography.fontBodyMedium, fontSize: 11.5, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  rowIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowTitle: { fontFamily: typography.fontBodyBold, fontSize: 14.5 },
  rowSub: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 2 },
});
