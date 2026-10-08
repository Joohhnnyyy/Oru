import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { PhotoProofModal } from '../../components/PhotoProofModal';
import { CivicQuizModal } from '../../components/CivicQuizModal';

const TASKS_DATA = {
  daily: [
    { id: '1', title: 'Morning Wet & Dry Waste Handover', tier: 'Medium', credits: 30, method: '🚛 Rotating QR', progress: 0, max: 1, expires: '14h 22m' },
    { id: '2', title: 'Home Energy Conservation Check', tier: 'Easy', credits: 15, method: '⚡ Habit Check-in', progress: 1, max: 1, expires: '14h 22m' },
    { id: '3', title: 'Drop Multi-Layer Plastic at MCD Bin', tier: 'Medium', credits: 20, method: '📦 Static QR', progress: 0, max: 1, expires: '14h 22m' },
    { id: 'quiz', title: 'Daily Waste Segregation Quiz', tier: 'Easy', credits: 25, method: '🧠 3-Question Quiz', progress: 0, max: 1, expires: '14h 22m' },
  ],
  weekly: [
    { id: '4', title: 'Complete 5 Home Waste Segregations', tier: 'Hard', credits: 100, method: '🔥 Streak Check', progress: 3, max: 5, expires: '4 days' },
    { id: '5', title: 'E-Waste Drop-off at Authorised Center', tier: 'Hard', credits: 80, method: '🔌 Static QR', progress: 0, max: 1, expires: '4 days' },
  ],
  monthly: [
    { id: '6', title: 'Ward 34 Zero Dump Spot Challenge', tier: 'Epic', credits: 250, method: '🌱 Ward Goal', progress: 1420, max: 2000, expires: '21 days' },
  ],
  bounties: [
    { id: '7', title: 'Clean Up Ring Road Flyover Hotspot', tier: 'Epic', credits: 150, method: '📸 AI Photo Before/After', progress: 0, max: 1, expires: '2 days' },
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

      {/* Period Tabs */}
      <View style={styles.tabsRow}>
        {(['daily', 'weekly', 'monthly', 'bounties'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Reset Countdown Pill */}
        <View style={styles.resetBanner}>
          <Text style={styles.resetText}>⏳ Resets at 00:00 IST • Daily Completion Bonus: 1/3 (Claim +25 GC at 3/3)</Text>
        </View>

        {/* Task Cards */}
        {tasks.map((task: any) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.cardHeader}>
              <View style={styles.tierPill}>
                <Text style={styles.tierText}>{task.tier}</Text>
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
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  task.progress >= task.max && styles.actionBtnDone,
                ]}
                onPress={() => handleStartTask(task)}
                disabled={task.progress >= task.max}
              >
                <Text style={styles.actionBtnText}>
                  {task.progress >= task.max ? 'Completed ✓' : 'Start Task →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Integrated Modals */}
      <PhotoProofModal
        visible={photoModalVisible}
        taskId="task-proof-01"
        taskTitle={activeTaskTitle}
        onClose={() => setPhotoModalVisible(false)}
      />

      <CivicQuizModal
        visible={quizModalVisible}
        onClose={() => setQuizModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#10B981',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  resetBanner: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetText: {
    color: '#CBD5E1',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  expiryText: {
    color: '#64748B',
    fontSize: 11,
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  methodBadge: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  actionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnDone: {
    backgroundColor: '#064E3B',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
