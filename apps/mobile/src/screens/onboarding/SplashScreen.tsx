import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/tokens';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(isAuthenticated ? 'Main' : 'Welcome');
    }, 1800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Image source={require('../../../assets/Oru_color.png')} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.title, { color: theme.textPrimary }]}>Cleaner cities.{'\n'}Brighter tomorrows.</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Take action. Earn rewards. Create real impact.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: { width: 220, height: 130, marginBottom: 28 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, textAlign: 'center' },
  subtitle: { fontFamily: typography.fontBodyMedium, fontSize: 15, textAlign: 'center', marginTop: 12 },
});
