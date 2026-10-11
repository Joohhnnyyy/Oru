import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChunkyButton } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

export const VerifyCodeScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const email = route.params?.email || 'user@saafsafari.in';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { switchPersona } = useAuth();
  const { theme } = useTheme();

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switchPersona('citizen');
      navigation.navigate('Language');
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader title="Verify" subtitle={`We sent a 6-digit code to ${email}`} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface2, borderColor: code ? theme.accentCyan : theme.border, color: theme.textPrimary }]}
          placeholder="••••••"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <ChunkyButton label={loading ? 'Verifying…' : 'Verify & continue'} disabled={loading || code.length < 6} onPress={handleVerify} />
        <Text style={[styles.resend, { color: theme.textMuted }]}>Resend code in 45s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { paddingHorizontal: 20, gap: 18 },
  input: { borderWidth: 2, borderBottomWidth: 5, borderRadius: 20, paddingVertical: 18, textAlign: 'center', fontFamily: typography.fontDisplayExtraBold, fontSize: 32, letterSpacing: 10 },
  resend: { textAlign: 'center', fontFamily: typography.fontBodyBold, fontSize: 14 },
});
