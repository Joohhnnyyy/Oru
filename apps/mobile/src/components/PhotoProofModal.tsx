import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { api, SubmissionStatus } from '../services/api';
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
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<'rubric' | 'capture' | 'review' | 'uploading' | 'done'>('rubric');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<SubmissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera permission is needed for photo proof.');
      return;
    }
    // Camera only (no gallery) so the proof is taken now, on the spot
    const shot = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6, exif: false });
    if (shot.canceled || !shot.assets?.[0]) return;
    setPhotoUri(shot.assets[0].uri);
    setStep('review');
  };

  /** Upload to S3 (presigned URL) → S3 event starts Step Functions → poll for Bedrock's verdict. */
  const handleUpload = async () => {
    if (!photoUri) return;
    setStep('uploading');
    setError(null);
    try {
      const loc = await Location.requestForegroundPermissionsAsync();
      if (loc.status !== 'granted') throw new Error('Location permission is needed to tag your proof.');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      const sub = await api.createSubmission({
        actionType: 'COMMUNITY_CLEANUP_PROOF',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        description: taskTitle,
      });
      await api.uploadPhoto(sub.uploadUrl, photoUri);

      // Poll up to ~60 s for the AI decision
      let status: SubmissionStatus | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        status = await api.getSubmission(sub.submissionId);
        if (status.status !== 'PENDING_UPLOAD') break;
      }
      setVerdict(status);
      Haptics.notificationAsync(
        status?.status === 'AUTO_APPROVED' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {});
      setStep('done');
      refreshProfile();
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
      setStep('review');
    }
  };

  const handleReset = () => {
    setStep('rubric');
    setPhotoUri(null);
    setVerdict(null);
    setError(null);
    onClose();
  };

  const verdictTitle =
    verdict?.status === 'AUTO_APPROVED'
      ? 'Proof verified by AI!'
      : verdict?.status === 'FLAGGED_FOR_REVIEW'
        ? 'Sent to a ward officer'
        : verdict?.status === 'REJECTED'
          ? 'Proof not accepted'
          : 'Still checking…';

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
                <Text style={styles.rubricItem}>• Your location tags the proof to your territory</Text>
                <Text style={styles.rubricItem}>• Duplicate photos are auto-rejected by hash check</Text>
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
              {error && <Text style={styles.cameraHint}>{error}</Text>}
              <PressableScale style={styles.captureBtn} onPress={handleCapture} haptic={false}>
                <Text style={styles.captureBtnText}>Snap Proof Photo</Text>
              </PressableScale>
            </View>
          )}

          {step === 'review' && (
            <View style={styles.content}>
              <View style={styles.cameraPreview}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
                ) : (
                  <Icon3D name="shield" size={54} />
                )}
              </View>
              {error && <Text style={styles.cameraHint}>{error}</Text>}
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
              <Text style={styles.loadingText}>Uploading to Amazon S3 · Step Functions is running Rekognition + Bedrock Nova…</Text>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.content}>
              <View style={{ alignItems: 'center', marginVertical: 6 }}>
                <Blobatar preset="safari-mint" animation="celebrate" size={84} interactive={true} />
              </View>
              <Text style={styles.doneTitle}>{verdictTitle}</Text>
              {verdict?.aiEvaluation && (
                <Text style={styles.doneText}>
                  {verdict.aiEvaluation.reasoning} ({Math.round(verdict.aiEvaluation.confidenceScore * 100)}% confidence)
                </Text>
              )}
              {verdict?.status === 'AUTO_APPROVED' && (
                <Text style={styles.doneReward}>+{verdict.creditsAwarded ?? 0} Green Credits Awarded</Text>
              )}
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
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
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
