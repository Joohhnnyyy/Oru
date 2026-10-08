import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { PhotoProofModal } from '../../components/PhotoProofModal';
import { CivicQuizModal } from '../../components/CivicQuizModal';
import { PressableScale } from '../../components/PressableScale';
import { colors, radii, spacing } from '../../theme/tokens';

const TASKS_DATA = {
  daily: [
    { id: '1', title: 'Morning Wet & Dry Waste Handover', tier: 'Medium', credits: 30, method: 'Rotating QR', progress: 0, max: 1, expires: '14h 22m' },
    { id: '2', title: 'Home Energy Conservation Check', tier: 'Easy', credits: 15, method: 'Habit Check-in', progress: 1, max: 1, expires: '14h 22m' },
    { id: '3', title: 'Drop Multi-Layer Plastic at MCD Bin', tier: 'Medium', credits: 20, method: 'Static QR', progress: 0, max: 1, expires: '14h 22m' },
    { id: 'quiz', title: 'Daily Waste Segregation Quiz', tier: 'Easy', credits: 25, method: '3-Question Quiz', progress: 0, max: 1, expires: '14h 22m' },
  ],
  weekly: [
    { id: '4', title: 'Complete 5 Home Waste Segregations', tier: 'Hard', credits: 100, method: 'Streak Check', progress: 3, max: 5, expires: '4 days' },
    { id: '5', title: 'E-Waste Drop-off at Authorised Center', tier: 'Hard', credits: 80, method: 'Static QR', progress: 0, max: 1, expires: '4 days' },
  ],
  monthly: [
    { id: '6', title: 'Ward 34 Zero Dump Spot Challenge', tier: 'Epic', credits: 250, method: 'Ward Goal', progress: 1420, max: 2000, expires: '21 days' },
  ],
  bounties: [
    { id: '7', title: 'Clean Up Ring Road Flyover Hotspot', tier: 'Epic', credits: 150, method: 'AI Photo Proof', progress: 0, max: 1, expires: '2 days' },
  ],
};

export const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'bounties'>('daily');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState('');

  const tasks = TASKS_DATA[activeTab];

  const handleStartTask = (task: typeof TASKS_DATA.daily[0]) => {
    if (task.id === 'quiz') {
      setQuizModalVisible(true);
    } else if (task.method.includes('AI Photo')) {
      setActiveTaskTitle(task.title);
      setPhotoModalVisible(true);
    } else if (task.method.includes('QR')) {
      navigation.navigate('Scan');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Civic Task Board" />

      {/* Period Tabs in Pill Container */}
      <View style={styles.tabsRow}>
        {(['daily', 'weekly', 'monthly', 'bounties'] as const).map((tab) => (
          <PressableScale
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            haptic="light"
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </PressableScale>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reset Countdown Pill */}
        <View style={styles.resetBanner}>
          <Text style={styles.resetText}>⏳ Resets at 00:00 IST • Daily Completion Bonus: 1/3 (Claim +25 GC at 3/3)</Text>
        </View>

        {/* Task Cards */}
        {tasks.map((task: any) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.tierPill, task.tier === 'Epic' && styles.tierEpic]}>
                <Text style={[styles.tierText, task.tier === 'Epic' && styles.tierTextEpic]}>{task.tier}</Text>
              </View>
              <Text style={styles.expiryText}>Expires in {task.expires}</Text>
            </View>

            <Text style={styles.taskTitle}>{task.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.methodBadge}>{task.method}</Text>
              <Text style={styles.rewardText}>+{task.credits} GC</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.progressText}>
                Progress: {task.progress}/{task.max}
              </Text>
              <PressableScale
                style={[
                  styles.actionBtn,
                  task.progress >= task.max && styles.actionBtnDone,
                ]}
                onPress={() => handleStartTask(task)}
                disabled={task.progress >= task.max}
                haptic="light"
              >
                <Text style={[styles.actionBtnText, task.progress >= task.max && styles.actionBtnTextDone]}>
                  {task.progress >= task.max ? 'Completed ✓' : 'Start Task →'}
                </Text>
              </PressableScale>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* B7 Civic Quiz Modal */}
      <CivicQuizModal
        visible={quizModalVisible}
        onClose={() => setQuizModalVisible(false)}
      />

      {/* B6 Photo Proof Upload Modal */}
      <PhotoProofModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        taskTitle={activeTaskTitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBase,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    padding: 6,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.surfaceRaised,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: colors.textDark,
    fontWeight: '800',
  },
  scroll: {
    padding: spacing.s2,
    paddingBottom: spacing.s6,
  },
  resetBanner: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: spacing.s2,
  },
  resetText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s3,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  tierEpic: {
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  tierText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },
  tierTextEpic: {
    color: '#BE185D',
  },
  expiryText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  methodBadge: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  rewardText: {
    color: '#0D9488',
    fontSize: 16,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 12,
  },
  progressText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  actionBtnDone: {
    backgroundColor: colors.surfaceSubtle,
  },
  actionBtnText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnTextDone: {
    color: colors.textSecondary,
  },
});
