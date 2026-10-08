import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PersonaSwitcher } from './PersonaSwitcher';

export const AppHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { user, activeRole } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.logo}>🌿 SaafSafari</Text>
        {title && <Text style={styles.subtitle}>{title}</Text>}
      </View>

      <View style={styles.actions}>
        {activeRole === 'citizen' && user && (
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>✨ {user.greenCredits} GC</Text>
          </View>
        )}
        <PersonaSwitcher />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0A0F1D',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    color: '#10B981',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  creditsText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
});
