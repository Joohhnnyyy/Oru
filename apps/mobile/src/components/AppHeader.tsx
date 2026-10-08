import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PersonaSwitcher } from './PersonaSwitcher';
import { colors, radii } from '../theme/tokens';

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
    backgroundColor: colors.surfaceBase,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    color: colors.surfaceRaised,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textSecondary,
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
    backgroundColor: colors.surfaceAccentSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
  },
  creditsText: {
    color: colors.textAccent,
    fontSize: 12,
    fontWeight: '800',
  },
});
