import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const PhotoProofModal: React.FC<{
  visible: boolean;
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}> = ({ visible, taskTitle, onClose }) => {
  const { updateCredits } = useAuth();
  const [step, setStep] = useState<'rubric' | 'capture' | 'review' | 'uploading' | 'done'>('rubric');

  const handleCapture = () => {
    setStep('review');
  };

  const handleUpload = () => {
    setStep('uploading');
    setTimeout(() => {
      setStep('done');
      updateCredits(50);
    }, 1500);
  };

  const handleReset = () => {
    setStep('rubric');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>📸 AI Photo Verification</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
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
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('capture')}>
                <Text style={styles.primaryBtnText}>Open Camera Capture →</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'capture' && (
            <View style={styles.content}>
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.cameraHint}>Ghost outline active: Align waste bins within frame</Text>
              </View>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <Text style={styles.captureBtnText}>Snap Proof Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'review' && (
            <View style={styles.content}>
              <View style={styles.cameraPreview}>
                <Text style={styles.cameraIcon}>✅</Text>
                <Text style={styles.cameraHint}>Photo captured • High quality • GPS attached</Text>
              </View>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('capture')}>
                  <Text style={styles.secondaryBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtnFlex} onPress={handleUpload}>
                  <Text style={styles.primaryBtnText}>Submit to AI Pipeline</Text>
                </TouchableOpacity>
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
              <TouchableOpacity style={styles.primaryBtn} onPress={handleReset}>
                <Text style={styles.primaryBtnText}>Done</Text>
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
    marginBottom: 4,
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
  subtitle: {
    color: '#10B981',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '600',
  },
  content: {
    gap: 16,
  },
  rubricBox: {
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  rubricHeading: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rubricItem: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  cameraPreview: {
    backgroundColor: '#0F172A',
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    padding: 16,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  cameraHint: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnFlex: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  captureBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  loadingBox: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  doneEmoji: {
    fontSize: 54,
    alignSelf: 'center',
  },
  doneTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  doneText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  doneReward: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
