import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PressableScale } from './PressableScale';

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
    backgroundColor: '#0F172A',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  btn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeBtn: {
    backgroundColor: '#10B981',
  },
  btnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  activeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
