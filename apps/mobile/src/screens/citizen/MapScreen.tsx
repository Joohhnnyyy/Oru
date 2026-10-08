import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { Icon3D } from '../../components/Icon3D';
import { Google3DMap } from '../../components/Google3DMap';
import { colors, radii, spacing } from '../../theme/tokens';

const GOOGLE_MAPS_KEY = 'REMOVED_CREDENTIAL';

const DELHI_TERRITORIES = [
  { id: '1', code: 'S34', name: 'MCD South 34 (Lajpat Nagar)', mascot: 'Dolphin Sanctuary', health: 72, mood: 'Recovering', cleanIndex: 7.2, trucks: 2, color: '#0D9488' },
  { id: '2', code: 'C12', name: 'MCD Central 12 (Connaught Place)', mascot: 'Blackbuck Habitat', health: 88, mood: 'Thriving', cleanIndex: 8.8, trucks: 3, color: '#059669' },
  { id: '3', code: 'E45', name: 'MCD East 45 (Mayur Vihar)', mascot: 'Peacock Zone', health: 64, mood: 'Recovering', cleanIndex: 6.4, trucks: 1, color: '#D97706' },
  { id: '4', code: 'W23', name: 'MCD West 23 (Rajouri Garden)', mascot: 'Leopard Ridge', health: 48, mood: 'Critical', cleanIndex: 4.8, trucks: 1, color: '#DC2626' },
  { id: '5', code: 'N08', name: 'MCD North 08 (Civil Lines)', mascot: 'Nilgai Grove', health: 92, mood: 'Legendary', cleanIndex: 9.2, trucks: 4, color: '#7C3AED' },
];

export const MapScreen: React.FC<{ navigation: any }> = () => {
  const [selectedTerritory, setSelectedTerritory] = useState(DELHI_TERRITORIES[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trucks' | 'drop_points'>('all');

  const handleSelectTerritory = (t: typeof DELHI_TERRITORIES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTerritory(t);
  };

  const handleSelectTerritoryById = (id: string) => {
    const found = DELHI_TERRITORIES.find((t) => t.id === id);
    if (found) {
      handleSelectTerritory(found);
    }
  };

  const handleSelectFilter = (f: 'all' | 'trucks' | 'drop_points') => {
    Haptics.selectionAsync().catch(() => {});
    setActiveFilter(f);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Delhi NCR Territory Map" />

      {/* Photorealistic Google 3D Map Viewport */}
      <View style={styles.mapCanvas}>
        <Google3DMap
          apiKey={GOOGLE_MAPS_KEY}
          selectedTerritoryId={selectedTerritory.id}
          onSelectTerritory={handleSelectTerritoryById}
          activeFilter={activeFilter}
        />

        {/* Floating Territory Node Selector */}
        <View style={styles.floatingOverlay}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nodesWrapper}>
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
                <Text style={[styles.hexCode, { color: t.color }]}>{t.code}</Text>
                <Text style={styles.hexHealth}>{t.health}%</Text>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Filter Bar in Butter Style */}
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
      </View>

      {/* Bottom Sheet Detail */}
      <View style={styles.detailSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{selectedTerritory.name}</Text>
            <Text style={styles.sheetMascot}>{selectedTerritory.mascot}</Text>
          </View>
          <View style={[styles.moodBadge, { backgroundColor: 'rgba(0, 229, 179, 0.15)' }]}>
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
            <View style={styles.itemIconBadge}>
              <Icon3D name="truck" size={30} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>MCD Sanitation Truck DL-1M-4821</Text>
              <Text style={styles.itemSub}>On Route • 120m away from your location</Text>
            </View>
            <Text style={styles.itemAction}>Live</Text>
          </View>

          <View style={styles.sheetItem}>
            <View style={styles.itemIconBadge}>
              <Icon3D name="bin" size={30} />
            </View>
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
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  floatingOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    gap: 8,
    zIndex: 10,
  },
  nodesWrapper: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  territoryHex: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedHex: {
    transform: [{ scale: 1.08 }],
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
  hexCode: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  hexHealth: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
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
    maxHeight: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
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
    backgroundColor: '#F1F5F9',
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
    maxHeight: 120,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemIconBadge: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  itemSub: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  itemAction: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '800',
  },
});
