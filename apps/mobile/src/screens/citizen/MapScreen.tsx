import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { colors, radii, spacing } from '../../theme/tokens';

const DELHI_TERRITORIES = [
  { id: '1', name: 'MCD South 34 (Lajpat Nagar)', mascot: '🐬 Dolphin', health: 72, mood: 'Recovering', cleanIndex: 7.2, trucks: 2, color: colors.surfaceRaised },
  { id: '2', name: 'MCD Central 12 (Connaught Place)', mascot: '🦌 Blackbuck', health: 88, mood: 'Thriving', cleanIndex: 8.8, trucks: 3, color: colors.surfaceRaised },
  { id: '3', name: 'MCD East 45 (Mayur Vihar)', mascot: '🦚 Peacock', health: 64, mood: 'Recovering', cleanIndex: 6.4, trucks: 1, color: '#f59e0b' },
  { id: '4', name: 'MCD West 23 (Rajouri Garden)', mascot: '🐆 Leopard', health: 48, mood: 'Sick', cleanIndex: 4.8, trucks: 1, color: '#ff4d4f' },
  { id: '5', name: 'MCD North 08 (Civil Lines)', mascot: '🦌 Nilgai', health: 92, mood: 'Legendary', cleanIndex: 9.2, trucks: 4, color: '#a855f7' },
];

export const MapScreen: React.FC<{ navigation: any }> = () => {
  const [selectedTerritory, setSelectedTerritory] = useState(DELHI_TERRITORIES[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trucks' | 'drop_points'>('all');

  const handleSelectTerritory = (t: typeof DELHI_TERRITORIES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTerritory(t);
  };

  const handleSelectFilter = (f: 'all' | 'trucks' | 'drop_points') => {
    Haptics.selectionAsync().catch(() => {});
    setActiveFilter(f);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Delhi NCR Territory Map" />

      {/* Simulated Map Canvas */}
      <View style={styles.mapCanvas}>
        <View style={styles.hexGridContainer}>
          <Text style={styles.mapCanvasBadge}>🗺️ H3 Resolution-7 Hexagonal Grid</Text>

          {/* Interactive Territory Nodes */}
          <View style={styles.nodesWrapper}>
            {DELHI_TERRITORIES.map((t) => (
              <PressableScale
                key={t.id}
                style={[
                  styles.territoryHex,
                  { borderColor: t.color },
                  selectedTerritory.id === t.id && styles.selectedHex,
                ]}
                onPress={() => handleSelectTerritory(t)}
                haptic={false}
              >
                <Text style={styles.hexEmoji}>{t.mascot.split(' ')[0]}</Text>
                <Text style={styles.hexHealth}>{t.health}%</Text>
              </PressableScale>
            ))}
          </View>

          {/* Live Vehicle Pulse Indicator */}
          <View style={styles.liveTruckIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTruckText}>🚛 2 Sanitation Trucks Broadcasting Live Telemetry</Text>
          </View>
        </View>

        {/* Filter Pills in Butter Style */}
        <View style={styles.filterBar}>
          <PressableScale
            style={[styles.filterPill, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => handleSelectFilter('all')}
            haptic={false}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All Layers
            </Text>
          </PressableScale>
          <PressableScale
            style={[styles.filterPill, activeFilter === 'trucks' && styles.activeFilter]}
            onPress={() => handleSelectFilter('trucks')}
            haptic={false}
          >
            <Text style={[styles.filterText, activeFilter === 'trucks' && styles.activeFilterText]}>
              Live Trucks
            </Text>
          </PressableScale>
          <PressableScale
            style={[styles.filterPill, activeFilter === 'drop_points' && styles.activeFilter]}
            onPress={() => handleSelectFilter('drop_points')}
            haptic={false}
          >
            <Text style={[styles.filterText, activeFilter === 'drop_points' && styles.activeFilterText]}>
              Smart Bins
            </Text>
          </PressableScale>
        </View>
      </View>

      {/* Bottom Sheet Detail */}
      <View style={styles.detailSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{selectedTerritory.name}</Text>
            <Text style={styles.sheetMascot}>{selectedTerritory.mascot}</Text>
          </View>
          <View style={[styles.moodBadge, { backgroundColor: 'rgba(0, 255, 208, 0.12)' }]}>
            <Text style={[styles.moodText, { color: selectedTerritory.color }]}>
              {selectedTerritory.mood}
            </Text>
          </View>
        </View>

        <View style={styles.sheetStats}>
          <View style={styles.sheetStatItem}>
            <Text style={styles.sheetStatVal}>{selectedTerritory.health}/100</Text>
            <Text style={styles.sheetStatLabel}>Health Index</Text>
          </View>
          <View style={styles.sheetStatItem}>
            <Text style={styles.sheetStatVal}>{selectedTerritory.cleanIndex}/10</Text>
            <Text style={styles.sheetStatLabel}>Clean Index</Text>
          </View>
          <View style={styles.sheetStatItem}>
            <Text style={styles.sheetStatVal}>{selectedTerritory.trucks} Active</Text>
            <Text style={styles.sheetStatLabel}>MCD Trucks</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetList}>
          <View style={styles.sheetItem}>
            <Text style={styles.itemEmoji}>🚛</Text>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>MCD Sanitation Truck DL-1M-4821</Text>
              <Text style={styles.itemSub}>On Route • 120m away from your location</Text>
            </View>
            <Text style={styles.itemAction}>Live</Text>
          </View>

          <View style={styles.sheetItem}>
            <Text style={styles.itemEmoji}>📦</Text>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Central Market Smart MCD Bin #402</Text>
              <Text style={styles.itemSub}>Static Decal • 350m away</Text>
            </View>
            <Text style={styles.itemAction}>Nav →</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'space-between',
    padding: spacing.s2,
  },
  hexGridContainer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  mapCanvasBadge: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  nodesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  territoryHex: {
    width: 66,
    height: 66,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceCard,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHex: {
    transform: [{ scale: 1.1 }],
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceRaised,
  },
  hexEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  hexHealth: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  liveTruckIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAccentSubtle,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    marginRight: 8,
  },
  liveTruckText: {
    color: colors.textAccent,
    fontSize: 11,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterPill: {
    backgroundColor: colors.surfaceCard,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  activeFilter: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderAccent,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.textDark,
    fontWeight: '800',
  },
  detailSheet: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    padding: spacing.s3,
    maxHeight: 280,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetMascot: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sheetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    paddingVertical: 10,
    marginBottom: 14,
  },
  sheetStatItem: {
    alignItems: 'center',
  },
  sheetStatVal: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  sheetStatLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  sheetList: {
    maxHeight: 100,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemSub: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  itemAction: {
    color: colors.surfaceRaised,
    fontSize: 11,
    fontWeight: '800',
  },
});
