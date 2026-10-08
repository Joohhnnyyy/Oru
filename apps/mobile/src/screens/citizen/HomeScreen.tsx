import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateCredits } = useAuth();
  const [streakChecked, setStreakChecked] = useState(false);

  const handleQuickCheckin = () => {
    if (streakChecked) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStreakChecked(true);
    updateCredits(15);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Territory Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.territoryEyebrow}>YOUR HABITAT HEX</Text>
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
          <View style={styles.heroFooter}>
            <Text style={styles.heroHint}>+3.4% health gain this week in your hex</Text>
            <Text style={styles.heroBadge}>Live</Text>
          </View>
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

        {/* Live Incoming Truck Card */}
        <PressableScale
          style={styles.truckCard}
          onPress={() => navigation.navigate('Scan')}
          haptic="medium"
        >
          <View style={styles.truckIconBadge}>
            <Text style={styles.truckIcon}>🚛</Text>
          </View>
          <View style={styles.truckInfo}>
            <View style={styles.truckTitleRow}>
              <Text style={styles.truckTitle}>MCD Sanitation Truck Approaching</Text>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.truckMeta}>DL-1M-4821 • 120m away (ETA ~3 min)</Text>
          </View>
          <View style={styles.truckScanBtn}>
            <Text style={styles.truckScanBtnText}>Scan</Text>
          </View>
        </PressableScale>

        {/* Daily Habit Segregation Check-In */}
        <View style={styles.checkinCard}>
          <View style={styles.checkinTextContainer}>
            <Text style={styles.checkinTitle}>Daily Segregation Check-In</Text>
            <Text style={styles.checkinSubtitle}>
              I separated wet, dry and hazardous waste at home today
            </Text>
          </View>
          <PressableScale
            style={[styles.checkinBtn, streakChecked && styles.checkinBtnDone]}
            onPress={handleQuickCheckin}
            disabled={streakChecked}
            haptic={streakChecked ? undefined : 'success'}
          >
            <Text style={styles.checkinBtnText}>
              {streakChecked ? '✓ Completed (+15 GC)' : 'Claim +15 GC'}
            </Text>
          </PressableScale>
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Verified Tasks</Text>
          <PressableScale onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAll}>See All →</Text>
          </PressableScale>
        </View>

        <PressableScale
          style={styles.taskCard}
          onPress={() => navigation.navigate('Scan')}
          haptic="light"
        >
          <View style={styles.taskIconBadge}>
            <Text style={styles.taskIcon}>♻️</Text>
          </View>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Morning Wet & Dry Waste Handover</Text>
            <Text style={styles.taskDesc}>Handover to MCD truck driver or kabadiwala</Text>
          </View>
          <View style={styles.taskRewardBadge}>
            <Text style={styles.taskReward}>+30 GC</Text>
          </View>
        </PressableScale>

        <PressableScale
          style={styles.taskCard}
          onPress={() => navigation.navigate('Scan')}
          haptic="light"
        >
          <View style={[styles.taskIconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Text style={styles.taskIcon}>🧴</Text>
          </View>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Drop Plastic at Smart MCD Bin</Text>
            <Text style={styles.taskDesc}>Scan decal at Central Market dustbin</Text>
          </View>
          <View style={styles.taskRewardBadge}>
            <Text style={styles.taskReward}>+20 GC</Text>
          </View>
        </PressableScale>

        <PressableScale
          style={styles.taskCard}
          onPress={() => navigation.navigate('Tasks')}
          haptic="light"
        >
          <View style={[styles.taskIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Text style={styles.taskIcon}>📸</Text>
          </View>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Report Garbage Vulnerable Spot</Text>
            <Text style={styles.taskDesc}>Submit photo of illegal dump spot for bounty</Text>
          </View>
          <View style={[styles.taskRewardBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }]}>
            <Text style={[styles.taskReward, { color: '#FBBF24' }]}>+50 GC</Text>
          </View>
        </PressableScale>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#111A2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  territoryEyebrow: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  territoryName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  mascotLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  healthCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthNumber: {
    color: '#34D399',
    fontSize: 19,
    fontWeight: '800',
  },
  healthSub: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroHint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  heroBadge: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  truckCard: {
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  truckIconBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  truckIcon: {
    fontSize: 22,
  },
  truckInfo: {
    flex: 1,
  },
  truckTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  truckTitle: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '700',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
  truckMeta: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  truckScanBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  truckScanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkinCard: {
    backgroundColor: '#111A2E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  checkinTextContainer: {
    gap: 2,
  },
  checkinTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  checkinSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  checkinBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkinBtnDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
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
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: '#111A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 22,
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
  taskRewardBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  taskReward: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 12,
  },
});
