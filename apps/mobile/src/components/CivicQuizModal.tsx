import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';

const QUIZ_QUESTIONS = [
  {
    question: 'Where should empty milk pouches and clean polythene wrappers be discarded?',
    options: ['Green (Wet Waste) Bin', 'Blue (Dry Waste) Bin', 'Red (Hazardous) Bin'],
    correct: 1,
    tip: 'Clean plastic wrappers belong in the dry waste bin so kabadiwalas can recycle them.',
  },
  {
    question: 'How should expired medicines and batteries be handled?',
    options: ['Domestic Hazardous Bin (Red)', 'Compost Pit', 'Flushed down drain'],
    correct: 0,
    tip: 'Hazardous chemicals leech into groundwater if disposed with normal garbage.',
  },
  {
    question: 'What happens to your territory animal mascot when waste is properly segregated?',
    options: ['Stays the same', 'Evolves from Sick towards Legendary', 'Loses credits'],
    correct: 1,
    tip: 'Territory health gains advance the mood state and unlock community discount multipliers!',
  },
];

export const CivicQuizModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { updateCredits } = useAuth();
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[qIndex];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    if (idx === currentQ.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setScore((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    setSelectedOpt(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setShowExplanation(false);
    if (qIndex < QUIZ_QUESTIONS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setQIndex(qIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setFinished(true);
      updateCredits(25);
    }
  };

  const handleClose = () => {
    setQIndex(0);
    setSelectedOpt(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>🧠 Civic Waste Quiz</Text>
            <PressableScale onPress={handleClose} haptic="light">
              <Text style={styles.closeBtn}>✕</Text>
            </PressableScale>
          </View>

          {!finished ? (
            <View style={styles.body}>
              <Text style={styles.counter}>
                Question {qIndex + 1} of {QUIZ_QUESTIONS.length}
              </Text>
              <Text style={styles.questionText}>{currentQ.question}</Text>

              <View style={styles.optionsList}>
                {currentQ.options.map((opt, idx) => {
                  let optStyle = styles.optionBtn;
                  if (showExplanation) {
                    if (idx === currentQ.correct) {
                      optStyle = styles.optionCorrect;
                    } else if (idx === selectedOpt) {
                      optStyle = styles.optionWrong;
                    }
                  }

                  return (
                    <PressableScale
                      key={idx}
                      style={optStyle}
                      onPress={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      haptic={false}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </PressableScale>
                  );
                })}
              </View>

              {showExplanation && (
                <View style={styles.tipBox}>
                  <Text style={styles.tipLabel}>Civic Knowledge Tip:</Text>
                  <Text style={styles.tipText}>{currentQ.tip}</Text>
                  <PressableScale style={styles.nextBtn} onPress={handleNext} haptic="light">
                    <Text style={styles.nextBtnText}>
                      {qIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'Complete Quiz 🎉'}
                    </Text>
                  </PressableScale>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.doneBody}>
              <Text style={styles.doneEmoji}>🏆</Text>
              <Text style={styles.doneTitle}>Quiz Completed!</Text>
              <Text style={styles.doneScore}>Daily Habit Score: 100%</Text>
              <Text style={styles.doneReward}>+25 Green Credits Added to Wallet</Text>
              <PressableScale style={styles.finishBtn} onPress={handleClose} haptic="light">
                <Text style={styles.finishBtnText}>Collect Reward & Close</Text>
              </PressableScale>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#111A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 22,
    width: '100%',
    maxWidth: 380,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    color: '#94A3B8',
    fontSize: 18,
    padding: 4,
  },
  body: {
    gap: 14,
  },
  counter: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  optionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 14,
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    padding: 14,
  },
  optionText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 6,
  },
  tipLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  nextBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBody: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  doneEmoji: {
    fontSize: 52,
  },
  doneTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  doneScore: {
    color: '#94A3B8',
    fontSize: 13,
  },
  doneReward: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '800',
  },
  finishBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
