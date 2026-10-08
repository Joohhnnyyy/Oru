import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateCredits } = useAuth();
  const [streakChecked, setStreakChecked] = useState(false);

  const handleQuickCheckin = () => {
    if (streakChecked) return;
    setStreakChecked(true);
    updateCredits(15);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Territory Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.territoryName}>{user?.territoryName || 'MCD South 34'}</Text>
              <Text style={styles.mascotLabel}>🐬 Gangetic Dolphin • Recovering</Text>
            </View>
            <View style={styles.healthCircle}>
              <Text style={styles.healthNumber}>72</Text>
              <Text style={styles.healthSub}>HEALTH</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '72%' }]} />
          </View>
          <Text style={styles.heroHint}>+3.4% health gain this week in your hex</Text>
        </View>

        {/* Status Strip */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>✨ {user?.greenCredits || 0}</Text>
            <Text style={styles.statLabel}>Green Credits</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>🔥 {user?.streakDays || 1} Days</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>🛡️ Lvl {user?.level || 1}</Text>
            <Text style={styles.statLabel}>{user?.rankTitle || 'Beej'}</Text>
          </View>
        </View>

        {/* Live Incoming Truck Card (B2 Section 4) */}
        <View style={styles.truckCard}>
          <View style={styles.truckIconBadge}>
            <Text style={styles.truckIcon}>🚛</Text>
          </View>
          <View style={styles.truckInfo}>
            <Text style={styles.truckTitle}>MCD Sanitation Truck Approaching</Text>
            <Text style={styles.truckMeta}>Vehicle DL-1M-4821 • 120m away (ETA ~3 min)</Text>
          </View>
          <TouchableOpacity
            style={styles.truckScanBtn}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.truckScanBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Habit Segregation Check-In */}
        <View style={styles.checkinCard}>
          <View>
            <Text style={styles.checkinTitle}>Daily Segregation Check-In</Text>
            <Text style={styles.checkinSubtitle}>I separated wet, dry and hazardous waste today</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkinBtn, streakChecked && styles.checkinBtnDone]}
            onPress={handleQuickCheckin}
            disabled={streakChecked}
          >
            <Text style={styles.checkinBtnText}>
              {streakChecked ? '✓ Completed (+15 GC)' : 'Claim +15 GC'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Verified Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.taskIcon}>♻️</Text>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Morning Wet & Dry Waste Handover</Text>
            <Text style={styles.taskDesc}>Handover to MCD truck driver or kabadiwala</Text>
          </View>
          <Text style={styles.taskReward}>+30 GC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.taskIcon}>🧴</Text>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Drop Plastic at Smart MCD Bin</Text>
            <Text style={styles.taskDesc}>Scan decal at Central Market dustbin</Text>
          </View>
          <Text style={styles.taskReward}>+20 GC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Text style={styles.taskIcon}>📸</Text>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Report Garbage Vulnerable Spot</Text>
            <Text style={styles.taskDesc}>Submit photo of illegal dump spot for bounty</Text>
          </View>
          <Text style={styles.taskReward}>+50 GC</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  territoryName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  mascotLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  healthCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthNumber: {
    color: '#6EE7B7',
    fontSize: 18,
    fontWeight: '800',
  },
  healthSub: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  heroHint: {
    color: '#64748B',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  truckCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  truckIconBadge: {
    backgroundColor: '#1E3A8A',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  truckIcon: {
    fontSize: 20,
  },
  truckInfo: {
    flex: 1,
  },
  truckTitle: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  truckMeta: {
    color: '#64748B',
    fontSize: 11,
  },
  truckScanBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  truckScanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkinCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  checkinTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  checkinSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  checkinBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkinBtnDone: {
    backgroundColor: '#064E3B',
  },
  checkinBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  taskText: {
    flex: 1,
  },
  taskName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskDesc: {
    color: '#94A3B8',
    fontSize: 12,
  },
  taskReward: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
});
