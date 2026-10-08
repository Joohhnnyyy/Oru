import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '📍',
    title: 'Do Real Civic Actions',
    description: 'Segregate waste at home, drop e-waste at collection hubs, and hand over to municipal garbage trucks.',
  },
  {
    icon: '📸',
    title: 'Verify Instantly',
    description: 'Scan dynamic rotating QR codes on trucks or upload AI-verified photos of cleanups.',
  },
  {
    icon: '🌱',
    title: 'Heal Mascot & Earn Rewards',
    description: 'Earn Green Credits, evolve your Delhi territory animal from Sick to Legendary, and redeem grocery discounts.',
  },
];

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const { switchPersona } = useAuth();

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      navigation.navigate('SignIn');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.slideCard}>
        <Text style={styles.icon}>{SLIDES[slideIndex].icon}</Text>
        <Text style={styles.title}>{SLIDES[slideIndex].title}</Text>
        <Text style={styles.description}>{SLIDES[slideIndex].description}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === slideIndex ? styles.activeDot : null]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>
            {slideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => {
            switchPersona('citizen');
            navigation.replace('Main');
          }}
        >
          <Text style={styles.demoBtnText}>⚡ 1-Tap Demo Sign In (Aarav - Citizen)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 64,
  },
  slideCard: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#10B981',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  demoBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
});
