import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const VerifyCodeScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const email = route.params?.email || 'user@saafsafari.in';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { switchPersona } = useAuth();

  const handleVerify = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switchPersona('citizen');
      navigation.navigate('Language');
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>Verify Code</Text>
        <Text style={styles.subtext}>We sent a 6-digit code to {email}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>6-Digit OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#64748B"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>Resend code in 45s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    paddingTop: 64,
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '700',
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
  resendBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#64748B',
    fontSize: 13,
  },
});
