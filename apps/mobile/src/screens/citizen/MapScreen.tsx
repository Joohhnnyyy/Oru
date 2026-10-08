import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '../../components/AppHeader';

const DELHI_TERRITORIES = [
  { id: '1', name: 'MCD South 34 (Lajpat Nagar)', mascot: '🐬 Dolphin', health: 72, mood: 'Recovering', cleanIndex: 7.2, trucks: 2, color: '#F59E0B' },
  { id: '2', name: 'MCD Central 12 (Connaught Place)', mascot: '🦌 Blackbuck', health: 88, mood: 'Thriving', cleanIndex: 8.8, trucks: 3, color: '#10B981' },
  { id: '3', name: 'MCD East 45 (Mayur Vihar)', mascot: '🦚 Peacock', health: 64, mood: 'Recovering', cleanIndex: 6.4, trucks: 1, color: '#F59E0B' },
  { id: '4', name: 'MCD West 23 (Rajouri Garden)', mascot: '🐆 Leopard', health: 48, mood: 'Sick', cleanIndex: 4.8, trucks: 1, color: '#EF4444' },
  { id: '5', name: 'MCD North 08 (Civil Lines)', mascot: '🦌 Nilgai', health: 92, mood: 'Legendary', cleanIndex: 9.2, trucks: 4, color: '#8B5CF6' },
];

export const MapScreen: React.FC<{ navigation: any }> = () => {
  const [selectedTerritory, setSelectedTerritory] = useState(DELHI_TERRITORIES[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'trucks' | 'drop_points'>('all');

  return (
    <View style={styles.container}>
      <AppHeader title="Delhi NCR Territory Map" />

      {/* Simulated Map Canvas */}
      <View style={styles.mapCanvas}>
        <View style={styles.hexGridContainer}>
          <Text style={styles.mapCanvasBadge}>🗺️ H3 Resolution-7 Hexagonal Grid Overlay</Text>

          {/* Interactive Territory Nodes */}
          <View style={styles.nodesWrapper}>
            {DELHI_TERRITORIES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.territoryHex,
                  { borderColor: t.color },
                  selectedTerritory.id === t.id && styles.selectedHex,
                ]}
                onPress={() => setSelectedTerritory(t)}
              >
                <Text style={styles.hexEmoji}>{t.mascot.split(' ')[0]}</Text>
                <Text style={styles.hexHealth}>{t.health}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Live Vehicle Pulse Indicator */}
          <View style={styles.liveTruckIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTruckText}>🚛 2 Sanitation Trucks Broadcasting Live Telemetry</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All Layers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'trucks' && styles.activeFilter]}
            onPress={() => setActiveFilter('trucks')}
          >
            <Text style={[styles.filterText, activeFilter === 'trucks' && styles.activeFilterText]}>
              Live Trucks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'drop_points' && styles.activeFilter]}
            onPress={() => setActiveFilter('drop_points')}
          >
            <Text style={[styles.filterText, activeFilter === 'drop_points' && styles.activeFilterText]}>
              Smart Bins
            </Text>
          </TouchableOpacity>
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
          <View style={[styles.moodBadge, { backgroundColor: selectedTerritory.color + '22' }]}>
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
            <Text style={styles.sheetStatVal}>{selectedTerritory.cleanIndex} ★</Text>
            <Text style={styles.sheetStatLabel}>Clean Rating</Text>
          </View>
          <View style={styles.sheetStatItem}>
            <Text style={styles.sheetStatVal}>{selectedTerritory.trucks} Trucks</Text>
            <Text style={styles.sheetStatLabel}>Active Today</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
    padding: 16,
  },
  hexGridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCanvasBadge: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  nodesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  territoryHex: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHex: {
    backgroundColor: '#334155',
    transform: [{ scale: 1.1 }],
  },
  hexEmoji: {
    fontSize: 28,
  },
  hexHealth: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  liveTruckIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  liveTruckText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
  },
  filterPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilter: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailSheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  sheetMascot: {
    color: '#94A3B8',
    fontSize: 13,
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontWeight: '700',
    fontSize: 12,
  },
  sheetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 14,
  },
  sheetStatItem: {
    alignItems: 'center',
  },
  sheetStatVal: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  sheetStatLabel: {
    color: '#64748B',
    fontSize: 11,
  },
});
