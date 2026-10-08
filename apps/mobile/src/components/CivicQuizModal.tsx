import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';
import { colors, radii, spacing } from '../theme/tokens';

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

import { Icon3D } from './Icon3D';
import { Blobatar } from './Blobatar';
import { AvatarAnimationKey } from '../avatar/avatarRuntimeSource';

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
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimationKey>('thinking');

  const currentQ = QUIZ_QUESTIONS[qIndex];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    if (idx === currentQ.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setScore((s) => s + 1);
      setAvatarAnim('proud');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setAvatarAnim('confused');
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
      setAvatarAnim('thinking');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setFinished(true);
      setAvatarAnim('celebrate');
      updateCredits(25);
    }
  };

  const handleClose = () => {
    setQIndex(0);
    setSelectedOpt(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
    setAvatarAnim('thinking');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Civic Waste Quiz</Text>
            <PressableScale onPress={handleClose} haptic="light">
              <Text style={styles.closeBtn}>✕</Text>
            </PressableScale>
          </View>

          {/* Interactive Blobatar Buddy Bar */}
          <View style={styles.quizBuddyRow}>
            <View style={styles.quizAvatarBox}>
              <Blobatar
                preset="nova"
                animation={finished ? 'celebrate' : avatarAnim}
                size={54}
                interactive={true}
                onPress={() => setAvatarAnim('laughing')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quizBuddyTitle}>Nova • Civic Quiz Companion</Text>
              <Text style={styles.quizBuddySubtitle}>
                {finished
                  ? 'Territory certified! +25 GC unlocked!'
                  : showExplanation
                  ? selectedOpt === currentQ.correct
                    ? 'Spot on! High five!'
                    : 'Oops! Check the civic tip below.'
                  : 'Pondering this civic question... Tap me to play!'}
              </Text>
            </View>
          </View>

          {!finished ? (
            <View style={styles.body}>
              <Text style={styles.counter}>
                QUESTION {qIndex + 1} OF {QUIZ_QUESTIONS.length}
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
                      <Text style={[styles.optionText, showExplanation && idx === currentQ.correct && styles.optionTextCorrect]}>
                        {opt}
                      </Text>
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
                      {qIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'Complete Quiz →'}
                    </Text>
                  </PressableScale>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.doneBody}>
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <Blobatar preset="nova" animation="celebrate" size={88} interactive={true} />
              </View>
              <Text style={styles.doneTitle}>Quiz Completed!</Text>
              <Text style={styles.doneScore}>Daily Habit Score: 100%</Text>
              <Text style={styles.doneReward}>+25 Green Credits Added</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s3,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s4,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizBuddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    marginBottom: 14,
    gap: 12,
  },
  quizAvatarBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizBuddyTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  quizBuddySubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    color: colors.textSecondary,
    fontSize: 18,
    padding: 4,
  },
  body: {
    gap: 14,
  },
  counter: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  optionBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 14,
  },
  optionCorrect: {
    backgroundColor: colors.surfaceAccentSubtle,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    borderRadius: radii.md,
    padding: 14,
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radii.md,
    padding: 14,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#0D9488',
    fontWeight: '800',
  },
  tipBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: radii.md,
    padding: spacing.s2,
    gap: 8,
    marginTop: 6,
  },
  tipLabel: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  nextBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtnText: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '800',
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
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  doneScore: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  doneReward: {
    color: '#0D9488',
    fontSize: 18,
    fontWeight: '800',
  },
  finishBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  finishBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
