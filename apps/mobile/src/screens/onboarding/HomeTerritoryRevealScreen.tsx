import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export const HomeTerritoryRevealScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hexCard}>
        <Text style={styles.badge}>ASSIGNED TERRITORY</Text>
        <Text style={styles.mascot}>🐬</Text>
        <Text style={styles.territoryName}>MCD South 34 (Lajpat Nagar)</Text>
        <Text style={styles.animalType}>Gangetic River Dolphin Mascot</Text>

        <View style={styles.healthContainer}>
          <Text style={styles.healthLabel}>Current Ward Health:</Text>
          <Text style={styles.healthScore}>72 / 100</Text>
        </View>

        <View style={styles.moodPill}>
          <Text style={styles.moodText}>Mood: 🟡 Recovering</Text>
        </View>

        <Text style={styles.message}>
          Your Dolphin is recovering! Complete segregated waste handovers and report illegal dump spots to push health past 75 and unlock Thriving mood.
        </Text>
      </View>

      <View style={styles.tasksPreview}>
        <Text style={styles.tasksHeader}>First 3 Tasks Ready:</Text>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>♻️ Morning Wet & Dry Waste Handover</Text>
          <Text style={styles.taskCredits}>+30 Green Credits • Scan Truck QR</Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>⚡ Home Energy Conservation Check</Text>
          <Text style={styles.taskCredits}>+15 Green Credits • Daily Habit</Text>
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>📦 Drop Multi-Layer Plastic at MCD Bin</Text>
          <Text style={styles.taskCredits}>+25 Green Credits • Static QR</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.primaryBtnText}>Let's Start Cleaning! 🚀</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    padding: 24,
    paddingTop: 54,
    paddingBottom: 40,
  },
  hexCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  badge: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  mascot: {
    fontSize: 72,
    marginBottom: 12,
  },
  territoryName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 4,
  },
  animalType: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  healthLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  healthScore: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '800',
  },
  moodPill: {
    backgroundColor: '#78350F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  moodText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  tasksPreview: {
    marginBottom: 24,
  },
  tasksHeader: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskCredits: {
    color: '#10B981',
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
