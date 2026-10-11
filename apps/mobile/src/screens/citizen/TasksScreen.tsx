import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api, TaskProgress } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';
import { PhotoProofModal } from '../../components/PhotoProofModal';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { FadeInUp } from '../../components/Motion';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';
import { CHARACTERS, CharacterId } from '../../theme/characters';

type Kind = 'checkin' | 'scan' | 'photo';
type Tint = 'accentLime' | 'accentCyan' | 'accentYellow' | 'accentLavender' | 'accentPink';

/** How each backend actionType looks and what tapping it does. */
const ACTION_UI: Record<string, { kind: Kind; guardian: CharacterId; guardianName: string; tint: Tint }> = {
  HABIT_SEGREGATION: { kind: 'checkin', guardian: 'turtle', guardianName: 'Turtle · Zero Waste', tint: 'accentLime' },
  STATIC_BIN_SCAN: { kind: 'scan', guardian: 'dolphin', guardianName: 'Dolphin · Riverbank', tint: 'accentCyan' },
  TRUCK_COLLECTOR_SCAN: { kind: 'scan', guardian: 'sparrow', guardianName: 'Sparrow · Urban Habitat', tint: 'accentPink' },
  E_WASTE_DROPOFF: { kind: 'scan', guardian: 'bustard', guardianName: 'Bustard · Clean Energy', tint: 'accentLavender' },
  COMMUNITY_CLEANUP_PROOF: { kind: 'photo', guardian: 'leopard', guardianName: 'Leopard · Cool Canopy', tint: 'accentYellow' },
};
const FALLBACK_UI = { kind: 'scan' as Kind, guardian: 'crane' as CharacterId, guardianName: 'Crane · Wetlands', tint: 'accentCyan' as Tint };

const PERIODS = ['daily', 'weekly', 'monthly'] as const;
const PERIOD_TITLE = { daily: "Today's quests", weekly: 'This week', monthly: 'This month' };

/** Habit "day" exactly as the backend counts it: IST with a 3 a.m. cutoff (utils/territory.ts istDayString). */
const istToday = () => new Date(Date.now() + (5.5 - 3) * 3600 * 1000).toISOString().slice(0, 10);

export const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { token, language, applyServerBalance } = useAuth();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('daily');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const board = useApiData(() => api.getTasks(), [token], !!token);
  const tasks: TaskProgress[] = board.data?.[period] ?? [];
  const checkedInToday = board.data?.lastHabitCheckInDate?.slice(0, 10) === istToday();

  const daily = board.data?.daily ?? [];
  const goal = Math.max(daily.length, 1);
  const doneCount = daily.filter((t) => t.completed).length;
  const progress = Math.min(doneCount, goal) / goal;

  const title = (t: TaskProgress) => (language === 'hi' ? t.titleHi : t.titleEn);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await board.reload();
    setRefreshing(false);
  }, [board.reload]);

  const checkIn = async () => {
    if (checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await api.submitCheckin();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      applyServerBalance(res.newBalanceGC, { streakDays: res.streakDays, lifetimeXp: res.newLifetimeXP });
      Alert.alert('Checked in', res.message || `+${res.creditsEarned} GC · ${res.streakDays}-day streak`);
      await board.reload();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Check-in failed', err?.message || 'Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleTaskPress = (task: TaskProgress) => {
    const ui = ACTION_UI[task.actionType] ?? FALLBACK_UI;
    if (ui.kind === 'checkin') return void checkIn();
    if (ui.kind === 'scan') return void navigation.navigate('Scan');
    setActiveTaskTitle(title(task));
    setPhotoModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScreenHeader
          title="Quests"
          subtitle="Small actions, big city."
          onBack={navigation.canGoBack?.() ? () => navigation.goBack() : undefined}
        />

        {/* Period segmented control */}
        <View style={[styles.segment, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          {PERIODS.map((p) => {
            const active = p === period;
            return (
              <ChunkyButton
                key={p}
                small
                variant={active ? 'primary' : 'ghost'}
                label={p}
                style={{ flex: 1 }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setPeriod(p);
                }}
              />
            );
          })}
        </View>

        {/* Daily goal */}
        <ChunkyCard style={[styles.goal, !theme.isDark && { backgroundColor: '#FFF6C7' }]} tint={theme.accentYellow}>
          <View style={styles.goalTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalEyebrow, { color: theme.inkAccent.accentYellow }]}>Daily goal</Text>
              <Text style={[styles.goalTitle, { color: theme.textPrimary }]}>
                {daily.length ? `Finish ${goal} quests` : 'Loading quests…'}
              </Text>
            </View>
            <Image source={CHARACTERS.buddy} style={styles.goalBuddy} resizeMode="contain" />
          </View>
          <ChunkyProgress value={progress} color={theme.accentYellow} track={theme.surface3} />
          <Text style={[styles.goalMeta, { color: theme.textSecondary }]}>
            {doneCount} / {daily.length || '–'} done · {board.data?.streakDays ?? 0}-day streak
          </Text>
        </ChunkyCard>

        <Text style={[styles.section, { color: theme.textPrimary }]}>{PERIOD_TITLE[period]}</Text>

        {board.loading && !board.data ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={theme.accentCyan} />
        ) : board.error && !board.data ? (
          <View style={styles.empty}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Couldn't load quests</Text>
            <Text style={[styles.goalMeta, { color: theme.textSecondary, textAlign: 'center' }]}>{board.error}</Text>
            <ChunkyButton small variant="secondary" label="Try again" onPress={() => board.reload()} />
          </View>
        ) : (
        <View style={styles.list}>
          {tasks.map((task, idx) => {
            const ui = ACTION_UI[task.actionType] ?? FALLBACK_UI;
            const isCheckin = ui.kind === 'checkin';
            const isDone = task.completed || (isCheckin && period === 'daily' && checkedInToday);
            const tint = theme[ui.tint];
            const label = isDone ? 'Done' : isCheckin ? (checkingIn ? '…' : 'Check in') : ui.kind === 'scan' ? 'Scan' : 'Start';
            return (
              <FadeInUp key={task.id} index={idx + 2}>
              <ChunkyCard style={styles.card} onPress={isDone ? undefined : () => handleTaskPress(task)}>
                <View style={[styles.iconTile, { backgroundColor: tint + '30', borderColor: tint }]}>
                  <Image source={CHARACTERS[ui.guardian]} style={styles.guardianCutout} resizeMode="contain" />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.guardianTag, { color: theme.inkAccent[ui.tint] }]}>{ui.guardianName}</Text>
                  <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
                    {title(task)}
                  </Text>
                  <Text style={[styles.reward, { color: theme.inkAccent[ui.tint] }]}>
                    +{task.rewardGC} GC{task.targetCount > 1 ? ` · ${Math.min(task.currentCount, task.targetCount)}/${task.targetCount}` : ''}
                  </Text>
                </View>
                <ChunkyButton
                  small
                  variant={isDone ? 'secondary' : 'success'}
                  label={label}
                  icon={isDone ? 'check' : undefined}
                  disabled={isDone || (isCheckin && checkingIn)}
                  onPress={() => handleTaskPress(task)}
                />
              </ChunkyCard>
              </FadeInUp>
            );
          })}
        </View>
        )}
      </ScrollView>

      <PhotoProofModal
        visible={photoModalVisible}
        taskTitle={activeTaskTitle}
        onClose={() => {
          setPhotoModalVisible(false);
          board.reload();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  segment: { flexDirection: 'row', gap: 4, marginHorizontal: 20, padding: 4, borderRadius: 20, borderWidth: 2, marginBottom: 18 },
  goal: { marginHorizontal: 20, marginBottom: 26, gap: 14 },
  goalTop: { flexDirection: 'row', alignItems: 'center' },
  goalEyebrow: { fontFamily: typography.fontBodyBold, fontSize: 11, letterSpacing: 1.6 },
  goalTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 22, marginTop: 2 },
  goalMeta: { fontFamily: typography.fontBodyMedium, fontSize: 13 },
  goalBuddy: { width: 62, height: 62 },
  section: { fontFamily: typography.fontDisplayBold, fontSize: 22, marginHorizontal: 20, marginBottom: 14 },
  list: { paddingHorizontal: 20, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  iconTile: { width: 66, height: 66, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  guardianCutout: { width: 56, height: 56 },
  info: { flex: 1 },
  guardianTag: { fontFamily: typography.fontBodyBold, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  title: { fontFamily: typography.fontBodyBold, fontSize: 15.5, lineHeight: 20 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 20 },
  reward: { fontFamily: typography.fontBodyBold, fontSize: 13, marginTop: 3 },
});
