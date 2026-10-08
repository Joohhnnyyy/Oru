import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const PersonaSwitcher: React.FC = () => {
  const { activeRole, switchPersona } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Demo Role:</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.btn, activeRole === 'citizen' && styles.activeBtn]}
          onPress={() => switchPersona('citizen')}
        >
          <Text style={[styles.btnText, activeRole === 'citizen' && styles.activeBtnText]}>
            Citizen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, activeRole === 'collector' && styles.activeBtn]}
          onPress={() => switchPersona('collector')}
        >
          <Text style={[styles.btnText, activeRole === 'collector' && styles.activeBtnText]}>
            Collector
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  btn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  activeBtn: {
    backgroundColor: '#10B981',
  },
  btnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  activeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
