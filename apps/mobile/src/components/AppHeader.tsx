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
    backgroundColor: '#0F172A',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginRight: 6,
  },
  creditsText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
  },
});
