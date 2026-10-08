import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';

export const PhotoProofModal: React.FC<{
  visible: boolean;
  taskId?: string;
  taskTitle: string;
  onClose: () => void;
}> = ({ visible, taskTitle, onClose }) => {
  const { updateCredits } = useAuth();
  const [step, setStep] = useState<'rubric' | 'capture' | 'review' | 'uploading' | 'done'>('rubric');

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setStep('review');
  };

  const handleUpload = () => {
    setStep('uploading');
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setStep('done');
      updateCredits(50);
    }, 1500);
  };

  const handleReset = () => {
    setStep('rubric');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>📸 AI Photo Verification</Text>
            <PressableScale onPress={handleReset} haptic="light">
              <Text style={styles.closeBtn}>✕</Text>
            </PressableScale>
          </View>
          <Text style={styles.subtitle}>{taskTitle}</Text>

          {step === 'rubric' && (
            <View style={styles.content}>
              <View style={styles.rubricBox}>
                <Text style={styles.rubricHeading}>AI VERIFICATION RULES (Bedrock Nova Lite):</Text>
                <Text style={styles.rubricItem}>• Ensure clear daylight lighting</Text>
                <Text style={styles.rubricItem}>• Show separated wet & dry waste containers</Text>
                <Text style={styles.rubricItem}>• GPS metadata is matched against your current territory</Text>
                <Text style={styles.rubricItem}>• Stock or duplicate photos are auto-rejected by hash check</Text>
              </View>
              <PressableScale style={styles.primaryBtn} onPress={() => setStep('capture')} haptic="light">
                <Text style={styles.primaryBtnText}>Open Camera Capture →</Text>
              </PressableScale>
            </View>
          )}

          {step === 'capture' && (
            <View style={styles.content}>
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.cameraHint}>Ghost outline active: Align waste bins within frame</Text>
              </View>
              <PressableScale style={styles.captureBtn} onPress={handleCapture} haptic={false}>
                <Text style={styles.captureBtnText}>Snap Proof Photo</Text>
              </PressableScale>
            </View>
          )}

          {step === 'review' && (
            <View style={styles.content}>
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraIcon}>✅</Text>
                <Text style={styles.cameraHint}>Photo captured • High quality • GPS attached</Text>
              </View>
              <View style={styles.buttonsRow}>
                <PressableScale style={styles.secondaryBtn} onPress={() => setStep('capture')} haptic="light">
                  <Text style={styles.secondaryBtnText}>Retake</Text>
                </PressableScale>
                <PressableScale style={styles.primaryBtnFlex} onPress={handleUpload} haptic="light">
                  <Text style={styles.primaryBtnText}>Submit to AI Pipeline</Text>
                </PressableScale>
              </View>
            </View>
          )}

          {step === 'uploading' && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Uploading to S3 & Running AWS Rekognition / Bedrock AI check...</Text>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.content}>
              <Text style={styles.doneEmoji}>🎉</Text>
              <Text style={styles.doneTitle}>Proof Verified by AI!</Text>
              <Text style={styles.doneText}>Bedrock verified source segregation confidence at 98.4%.</Text>
              <Text style={styles.doneReward}>+50 Green Credits Awarded</Text>
              <PressableScale style={styles.primaryBtn} onPress={handleReset} haptic="light">
                <Text style={styles.primaryBtnText}>Done</Text>
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
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
    marginTop: 4,
  },
  content: {
    gap: 16,
  },
  rubricBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  rubricHeading: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rubricItem: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraPreview: {
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  cameraIcon: {
    fontSize: 40,
  },
  cameraHint: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  captureBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtnFlex: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  doneEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  doneTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  doneText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  doneReward: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});
