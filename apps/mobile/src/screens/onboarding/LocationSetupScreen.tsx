import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard } from '../../components/Chunky';
import { ScreenHeader } from '../../components/ScreenHeader';
import { typography } from '../../theme/tokens';

const AREAS = [
  { name: 'Green Park', city: 'South Delhi', citizens: '1.2k', health: 78, recommended: true },
  { name: 'Lajpat Nagar', city: 'South Delhi', citizens: '980', health: 72 },
  { name: 'Connaught Place', city: 'Central Delhi', citizens: '1.5k', health: 88 },
  { name: 'Mayur Vihar', city: 'East Delhi', citizens: '860', health: 64 },
  { name: 'Rajouri Garden', city: 'West Delhi', citizens: '740', health: 48 },
  { name: 'Civil Lines', city: 'North Delhi', citizens: '620', health: 92 },
];

export const LocationSetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('Green Park');
  const { switchPersona } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const q = search.trim().toLowerCase();
  const list = AREAS.filter((a) => !q || a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Your territory" subtitle="Pick your starting area. You can change it later." onBack={() => navigation.goBack()} />

        <View style={styles.body}>
          <TextInput
            style={[styles.search, { backgroundColor: theme.surface2, borderColor: search ? theme.accentCyan : theme.border, color: theme.textPrimary }]}
            placeholder="Search locality, area or pincode"
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {list.map((a) => {
            const on = a.name === selected;
            return (
              <ChunkyCard
                key={a.name}
                style={[styles.card, on && { backgroundColor: theme.surface2 }]}
                tint={on ? theme.accentCyan : undefined}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelected(a.name);
                }}
              >
                <View style={[styles.icon, { backgroundColor: theme.surface3 }]}>
                  <Icon3D name="map" size={40} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: on ? theme.accentCyan : theme.textPrimary }]}>{a.name}</Text>
                    {a.recommended ? (
                      <View style={[styles.tag, { backgroundColor: theme.accentLime }]}>
                        <Text style={styles.tagText}>Recommended</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    {a.city} · {a.citizens} citizens · {a.health}% healthy
                  </Text>
                </View>
              </ChunkyCard>
            );
          })}
          {list.length === 0 ? <Text style={[styles.empty, { color: theme.textSecondary }]}>No areas match “{search}”.</Text> : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
        <ChunkyButton
          label="Continue"
          onPress={() => {
            switchPersona('citizen');
            navigation.replace('Main');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 24 },
  body: { paddingHorizontal: 20, gap: 14 },
  search: { borderWidth: 2, borderBottomWidth: 5, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, fontFamily: typography.fontBodyMedium, fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: typography.fontDisplayBold, fontSize: 17 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50 },
  tagText: { fontFamily: typography.fontBodyBold, fontSize: 10.5, color: '#05070C' },
  meta: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 3 },
  empty: { textAlign: 'center', fontFamily: typography.fontBodyMedium, fontSize: 14, marginTop: 12 },
  footer: { padding: 20, borderTopWidth: 2 },
});
