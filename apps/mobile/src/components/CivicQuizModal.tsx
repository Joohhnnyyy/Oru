import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

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
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[qIndex];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOpt(idx);
    setShowExplanation(true);
    if (idx === currentQ.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setShowExplanation(false);
    if (qIndex < QUIZ_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>🧠 Civic Waste Quiz</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
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
                    <TouchableOpacity
                      key={idx}
                      style={optStyle}
                      onPress={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showExplanation && (
                <View style={styles.tipBox}>
                  <Text style={styles.tipTitle}>
                    {selectedOpt === currentQ.correct ? '✅ Correct Answer!' : '❌ Incorrect'}
                  </Text>
                  <Text style={styles.tipText}>{currentQ.tip}</Text>
                  <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Next Question →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.finishedBox}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.finishTitle}>Quiz Complete!</Text>
              <Text style={styles.finishScore}>
                You scored {score}/{QUIZ_QUESTIONS.length}
              </Text>
              <Text style={styles.rewardText}>+25 Green Credits Earned</Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleClose}>
                <Text style={styles.nextBtnText}>Done</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    color: '#94A3B8',
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    gap: 12,
  },
  counter: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    borderRadius: 14,
  },
  optionCorrect: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 14,
    borderRadius: 14,
  },
  optionWrong: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 14,
    borderRadius: 14,
  },
  optionText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    gap: 6,
  },
  tipTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  tipText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  nextBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  finishedBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  trophy: {
    fontSize: 54,
  },
  finishTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  finishScore: {
    color: '#94A3B8',
    fontSize: 14,
  },
  rewardText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
});
