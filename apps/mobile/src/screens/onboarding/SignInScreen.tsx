import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { switchPersona } = useAuth();

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.sendOtp(email);
      navigation.navigate('VerifyCode', { email });
    } catch (err: any) {
      // In demo mode, smoothly advance to OTP verify
      navigation.navigate('VerifyCode', { email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>Sign In to SaafSafari</Text>
        <Text style={styles.subtext}>Enter your email to receive a passwordless sign-in code.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. aarav@saafsafari.in"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSendCode} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Send Verification Code</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.personaSection}>
        <Text style={styles.dividerText}>— OR QUICK TEST WITH DEMO PERSONAS —</Text>
        
        <TouchableOpacity
          style={styles.personaBtn}
          onPress={() => {
            switchPersona('citizen');
            navigation.replace('Main');
          }}
        >
          <Text style={styles.personaTitle}>👤 Aarav Sharma (Citizen Persona)</Text>
          <Text style={styles.personaSub}>Ward South 34 • 420 GC • Van Rakshak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaBtn}
          onPress={() => {
            switchPersona('collector');
            navigation.replace('Main');
          }}
        >
          <Text style={styles.personaTitle}>🚛 Rajesh Kumar (Collector Persona)</Text>
          <Text style={styles.personaSub}>MCD Truck DL-1M-4821 • Safai Senani</Text>
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
    justifyContent: 'space-between',
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
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  personaSection: {
    gap: 10,
    marginBottom: 20,
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  personaBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    borderRadius: 14,
  },
  personaTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  personaSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
