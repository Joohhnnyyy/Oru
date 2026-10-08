import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OfflinePill: React.FC<{ isOffline?: boolean }> = ({ isOffline = false }) => {
  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>You are offline • Showing cached data</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  text: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
});
