import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export const LocationSetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [locating, setLocating] = useState(false);

  const handleUseLocation = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      navigation.navigate('HomeTerritoryReveal');
    }, 700);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.header}>Set Your Home Territory</Text>
        <Text style={styles.subtext}>
          SaafSafari groups Indian cities into resolution-7 hexagonal territories. Your real-world location links you to your local wildlife mascot and daily neighbourhood cleanups.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleUseLocation} disabled={locating}>
          {locating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Use My Current GPS Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('HomeTerritoryReveal')}
        >
          <Text style={styles.secondaryBtnText}>Select Delhi NCR Territory Manually</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.privacyNote}>
        🔒 Privacy Note: Location is only checked during QR verification and dumping hotspot reporting.
      </Text>
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
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  privacyNote: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
});
