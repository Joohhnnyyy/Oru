import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { Icon3D } from '../../components/Icon3D';
import { colors, radii, spacing } from '../../theme/tokens';

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
              <Text style={styles.territoryEyebrow}>TERRITORY STATUS</Text>
              <Text style={styles.territoryName}>{user?.territoryName || 'MCD South 34'}</Text>
              <Text style={styles.mascotLabel}>Gangetic Dolphin Sanctuary • Recovering</Text>
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
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Status Strip */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statIconWrapper}>
              <Icon3D name="credit" size={28} />
            </View>
            <Text style={styles.statVal}>{user?.greenCredits || 0} GC</Text>
            <Text style={styles.statLabel}>Green Credits</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconWrapper}>
              <Icon3D name="flame" size={28} />
            </View>
            <Text style={styles.statVal}>{user?.streakDays || 1} Days</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconWrapper}>
              <Icon3D name="shield" size={28} />
            </View>
            <Text style={styles.statVal}>Lvl {user?.level || 1}</Text>
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
            <Icon3D name="truck" size={40} />
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
            <Text style={[styles.checkinBtnText, streakChecked && styles.checkinBtnTextDone]}>
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
            <Icon3D name="recycle" size={36} />
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
          <View style={styles.taskIconBadge}>
            <Icon3D name="bin" size={36} />
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
          <View style={styles.taskIconBadge}>
            <Icon3D name="camera" size={36} />
          </View>
          <View style={styles.taskText}>
            <Text style={styles.taskName}>Report Garbage Vulnerable Spot</Text>
            <Text style={styles.taskDesc}>Submit photo of illegal dump spot for bounty</Text>
          </View>
          <View style={[styles.taskRewardBadge, styles.taskRewardBounty]}>
            <Text style={[styles.taskReward, { color: '#B45309' }]}>+50 GC</Text>
          </View>
        </PressableScale>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  scroll: {
    padding: spacing.s2,
    paddingBottom: spacing.s6,
  },
  heroCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s3,
    marginBottom: spacing.s2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s2,
  },
  territoryEyebrow: {
    color: colors.textAccent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  territoryName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  mascotLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  healthCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAccentSubtle,
    borderWidth: 2,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthNumber: {
    color: colors.surfaceRaised,
    fontSize: 20,
    fontWeight: '800',
  },
  healthSub: {
    color: colors.textAccent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroHint: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  heroBadge: {
    backgroundColor: colors.surfaceAccentSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
  },
  heroBadgeText: {
    color: colors.textAccent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.s2,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrapper: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  truckCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    borderRadius: radii.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s2,
    shadowColor: '#00E5B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  truckIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
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
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceRaised,
  },
  truckMeta: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  truckScanBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  truckScanBtnText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  checkinCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    marginBottom: spacing.s3,
    gap: 14,
  },
  checkinTextContainer: {
    gap: 4,
  },
  checkinTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  checkinSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  checkinBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  checkinBtnDone: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  checkinBtnText: {
    color: colors.textDark,
    fontWeight: '800',
    fontSize: 14,
  },
  checkinBtnTextDone: {
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  seeAll: {
    color: colors.textAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  taskCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskIconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAccentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskText: {
    flex: 1,
  },
  taskName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  taskDesc: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  taskRewardBadge: {
    backgroundColor: colors.surfaceAccentSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
  },
  taskRewardBounty: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  taskReward: {
    color: colors.textAccent,
    fontWeight: '800',
    fontSize: 12,
  },
});
