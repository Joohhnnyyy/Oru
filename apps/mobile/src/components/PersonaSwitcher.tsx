import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';
import { colors, radii } from '../theme/tokens';

export const PersonaSwitcher: React.FC = () => {
  const { activeRole, switchPersona } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Role</Text>
      <View style={styles.buttonsRow}>
        <PressableScale
          style={[styles.btn, activeRole === 'citizen' && styles.activeBtn]}
          onPress={() => switchPersona('citizen')}
          haptic="light"
        >
          <Text style={[styles.btnText, activeRole === 'citizen' && styles.activeBtnText]}>
            Citizen
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.btn, activeRole === 'collector' && styles.activeBtn]}
          onPress={() => switchPersona('collector')}
          haptic="light"
        >
          <Text style={[styles.btnText, activeRole === 'collector' && styles.activeBtnText]}>
            Collector
          </Text>
        </PressableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  label: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  btn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'transparent',
  },
  activeBtn: {
    backgroundColor: colors.surfaceRaised,
  },
  btnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  activeBtnText: {
    color: colors.textDark,
    fontWeight: '800',
  },
});
