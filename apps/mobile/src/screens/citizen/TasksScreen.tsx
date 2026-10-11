import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { PhotoProofModal } from '../../components/PhotoProofModal';
import { CivicQuizModal } from '../../components/CivicQuizModal';
import { ChunkyButton, ChunkyCard, ChunkyProgress } from '../../components/Chunky';
import { FadeInUp } from '../../components/Motion';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

interface TaskItem {
  id: string;
  title: string;
  credits: number;
  icon: 'bin' | 'camera' | 'recycle' | 'truck' | 'shield';
  tint: 'accentLime' | 'accentCyan' | 'accentYellow' | 'accentLavender' | 'accentPink';
  type: 'qr' | 'photo' | 'drive' | 'quiz';
}

const TASKS: TaskItem[] = [
  { id: '1', title: 'Scan a waste bin', credits: 10, icon: 'bin', tint: 'accentLime', type: 'qr' },
  { id: '2', title: 'Report a dump spot', credits: 20, icon: 'camera', tint: 'accentCyan', type: 'photo' },
  { id: '3', title: 'Clean a public area', credits: 30, icon: 'recycle', tint: 'accentYellow', type: 'photo' },
  { id: '4', title: 'Upload e-waste proof', credits: 25, icon: 'shield', tint: 'accentLavender', type: 'photo' },
  { id: '5', title: 'Participate in a drive', credits: 40, icon: 'truck', tint: 'accentPink', type: 'drive' },
];

const PERIODS = ['daily', 'weekly', 'monthly'] as const;

export const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('daily');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState('');
  // placeholder progress until the API reports completed quests
  const done = ['1'];

  const handleTaskPress = (task: TaskItem) => {
    if (task.type === 'qr') {
      navigation.navigate('Scan');
      return;
    }
    setActiveTaskTitle(task.title);
    if (task.type === 'photo') setPhotoModalVisible(true);
    else setQuizModalVisible(true);
  };

  const goal = 3;
  const progress = Math.min(done.length, goal) / goal;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
              <Text style={[styles.goalEyebrow, { color: theme.inkAccent.accentYellow }]}>DAILY GOAL</Text>
              <Text style={[styles.goalTitle, { color: theme.textPrimary }]}>Finish {goal} quests</Text>
            </View>
            <Icon3D name="flame" size={56} style={styles.round} />
          </View>
          <ChunkyProgress value={progress} color={theme.accentYellow} track={theme.surface3} />
          <Text style={[styles.goalMeta, { color: theme.textSecondary }]}>
            {Math.min(done.length, goal)} / {goal} done · bonus +25 credits
          </Text>
        </ChunkyCard>

        <Text style={[styles.section, { color: theme.textPrimary }]}>Today's quests</Text>

        <View style={styles.list}>
          {TASKS.map((task, idx) => {
            const isDone = done.includes(task.id);
            const tint = theme[task.tint];
            return (
              <FadeInUp key={task.id} index={idx + 2}>
              <ChunkyCard style={styles.card} onPress={() => handleTaskPress(task)}>
                <View style={[styles.iconTile, { backgroundColor: tint + '40', borderColor: tint }]}>
                  <Icon3D name={task.icon} size={52} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <Text style={[styles.reward, { color: theme.inkAccent[task.tint] }]}>+{task.credits} credits</Text>
                </View>
                <ChunkyButton
                  small
                  variant={isDone ? 'secondary' : 'success'}
                  label={isDone ? 'Done' : 'Start'}
                  icon={isDone ? 'check' : undefined}
                  disabled={isDone}
                  onPress={() => handleTaskPress(task)}
                />
              </ChunkyCard>
              </FadeInUp>
            );
          })}
        </View>
      </ScrollView>

      <PhotoProofModal
        visible={photoModalVisible}
        taskTitle={activeTaskTitle}
        onClose={() => setPhotoModalVisible(false)}
      />
      <CivicQuizModal visible={quizModalVisible} onClose={() => setQuizModalVisible(false)} />
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
  round: { borderRadius: 18, overflow: 'hidden' },
  section: { fontFamily: typography.fontDisplayBold, fontSize: 22, marginHorizontal: 20, marginBottom: 14 },
  list: { paddingHorizontal: 20, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  iconTile: { width: 64, height: 64, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  info: { flex: 1 },
  title: { fontFamily: typography.fontBodyBold, fontSize: 15.5, lineHeight: 20 },
  reward: { fontFamily: typography.fontBodyBold, fontSize: 13, marginTop: 3 },
});
