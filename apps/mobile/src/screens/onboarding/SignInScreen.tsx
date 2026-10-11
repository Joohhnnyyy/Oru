import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

type RoleId = 'citizen' | 'collector' | 'admin' | 'merchant';

const ROLES: { id: RoleId; title: string; description: string; icon: 'profile' | 'truck' | 'shield' | 'credit'; tint: 'accentLime' | 'accentYellow' | 'accentCyan' | 'accentPink' }[] = [
  { id: 'citizen', title: 'Citizen', description: 'Complete quests, earn rewards, improve your area', icon: 'profile', tint: 'accentLime' },
  { id: 'collector', title: 'Collector', description: 'Garbage collector, driver or kabadiwala', icon: 'truck', tint: 'accentYellow' },
  { id: 'admin', title: 'Ward admin', description: 'Manage your ward and review submissions', icon: 'shield', tint: 'accentCyan' },
  { id: 'merchant', title: 'Merchant', description: 'Offer rewards and coupons', icon: 'credit', tint: 'accentPink' },
];

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selected, setSelected] = useState<RoleId>('citizen');
  const { switchPersona } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="I am a…" subtitle="Pick how you want to help your city." onBack={() => navigation.goBack()} />
        <View style={styles.list}>
          {ROLES.map((r) => {
            const on = r.id === selected;
            const tint = theme[r.tint];
            return (
              <ChunkyCard
                key={r.id}
                style={[styles.card, on && { backgroundColor: theme.surface2 }]}
                tint={on ? tint : undefined}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelected(r.id);
                }}
              >
                <View style={[styles.icon, { backgroundColor: theme.surface3 }]}>
                  <Icon3D name={r.icon} size={44} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: on ? tint : theme.textPrimary }]}>{r.title}</Text>
                  <Text style={[styles.desc, { color: theme.textSecondary }]}>{r.description}</Text>
                </View>
              </ChunkyCard>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 8, borderTopColor: theme.border }]}>
        <ChunkyButton
          label="Continue"
          onPress={() => {
            switchPersona(selected === 'collector' ? 'collector' : 'citizen');
            navigation.navigate('LocationSetup');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 24 },
  list: { paddingHorizontal: 20, gap: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  icon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  title: { fontFamily: typography.fontDisplayBold, fontSize: 18 },
  desc: { fontFamily: typography.fontBodyMedium, fontSize: 13, lineHeight: 18, marginTop: 3 },
  footer: { padding: 20, borderTopWidth: 2 },
});
