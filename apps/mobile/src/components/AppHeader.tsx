import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PersonaSwitcher } from './PersonaSwitcher';
import { colors, radii } from '../theme/tokens';

import { Icon3D } from './Icon3D';

export const AppHeader: React.FC<{ title?: string }> = ({ title }) => {
  const { user, activeRole } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>
            Saaf<Text style={styles.logoBold}>Safari</Text>
          </Text>
          <View style={styles.brandDot} />
        </View>
        {title && <Text style={styles.subtitle}>{title}</Text>}
      </View>

      <View style={styles.actions}>
        {activeRole === 'citizen' && user && (
          <View style={styles.creditsBadge}>
            <Icon3D name="credit" size={18} />
            <Text style={styles.creditsText}>{user.greenCredits} GC</Text>
          </View>
        )}
        <PersonaSwitcher />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  logoBold: {
    color: '#059669',
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceRaised,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  creditsText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '800',
  },
});
