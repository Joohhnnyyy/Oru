import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const LanguageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { language, setLanguage } = useAuth();

  const handleSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    navigation.navigate('LocationSetup');
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>Choose Your Language</Text>
        <Text style={styles.subtext}>आप अपनी पसंदीदा भाषा चुन सकते हैं</Text>

        <TouchableOpacity
          style={[styles.langCard, language === 'en' && styles.activeCard]}
          onPress={() => handleSelect('en')}
        >
          <Text style={styles.langTitle}>English</Text>
          <Text style={styles.langSub}>Default interface in English</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langCard, language === 'hi' && styles.activeCard]}
          onPress={() => handleSelect('hi')}
        >
          <Text style={styles.langTitle}>हिंदी (Hindi)</Text>
          <Text style={styles.langSub}>साफसफारी का हिंदी इंटरफेस</Text>
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
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
  langCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  activeCard: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  langTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  langSub: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
