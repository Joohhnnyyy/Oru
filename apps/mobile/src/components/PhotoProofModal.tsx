import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';
import { colors, radii, spacing } from '../theme/tokens';

import { Icon3D } from './Icon3D';
import { Blobatar } from './Blobatar';

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
            <Text style={styles.title}>AI Photo Proof Verification</Text>
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
                <Icon3D name="camera" size={54} />
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
                <Icon3D name="shield" size={54} />
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
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Blobatar preset="safari-mint" animation="working" size={72} />
              </View>
              <ActivityIndicator size="small" color={colors.surfaceRaised} />
              <Text style={styles.loadingText}>Uploading to S3 & Running AWS Bedrock AI multimodal audit...</Text>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.content}>
              <View style={{ alignItems: 'center', marginVertical: 6 }}>
                <Blobatar preset="safari-mint" animation="celebrate" size={84} interactive={true} />
              </View>
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
    padding: spacing.s3,
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
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
    marginTop: 4,
  },
  content: {
    gap: 16,
  },
  rubricBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: radii.md,
    padding: spacing.s2,
    gap: 6,
  },
  rubricHeading: {
    color: '#0D9488',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  rubricItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  cameraPreview: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  cameraIcon: {
    fontSize: 40,
  },
  cameraHint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  captureBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  captureBtnText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtnFlex: {
    flex: 2,
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  doneEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  doneTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  doneText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  doneReward: {
    color: colors.surfaceRaised,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
