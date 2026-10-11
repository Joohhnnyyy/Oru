import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Platform, Image, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChunkyButton, ChunkyProgress } from '../../components/Chunky';
import { Icon } from '../../components/Icon';
import { CityMap, MapFilter, MapSelection } from '../../components/CityMap';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api, distanceMeters, MapBin, MapTerritory, LiveTruck, BinStatus } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';
import { typography } from '../../theme/tokens';
import { CHARACTERS, characterForHealth } from '../../theme/characters';

const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const ago = (iso?: string | null) => {
  if (!iso) return 'never';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};
const healthColor = (h: number) => (h >= 70 ? '#43E34F' : h >= 40 ? '#FFB800' : '#FF5A5F');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const BIN_UI: Record<BinStatus, { label: string; color: string }> = {
  OK: { label: 'Plenty of space', color: '#43E34F' },
  FILLING: { label: 'Filling up', color: '#FFB800' },
  NEEDS_PICKUP: { label: 'Needs pickup', color: '#FF4D5E' },
  DAMAGED: { label: 'Damaged', color: '#8B5CF6' },
};
const FILTERS: [MapFilter, string][] = [['all', 'All'], ['trucks', 'Trucks'], ['bins', 'Bins']];

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token, activeRole } = useAuth();
  const isCollector = activeRole === 'collector';

  const city = useApiData(() => api.getMap(), [token], !!token);
  const trucksRes = useApiData(() => api.getLiveTrucks(), [token], !!token);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [filter, setFilter] = useState<MapFilter>('all');
  const [expanded, setExpanded] = useState(false);
  const [here, setHere] = useState<{ latitude: number; longitude: number } | null>(null);
  const [trail, setTrail] = useState<{ latitude: number; longitude: number }[]>([]);
  const [busy, setBusy] = useState(false);

  const territories = city.data?.territories ?? [];
  const bins = city.data?.bins ?? [];
  const trucks = trucksRes.data?.trucks ?? [];

  // Location only if already granted elsewhere; never prompt just for browsing the map
  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) return;
        const pos = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (pos) setHere({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  // Live trucks every 15 s, the rest of the map every 2 min
  useEffect(() => {
    if (!token) return;
    const a = setInterval(() => trucksRes.reload(), 15_000);
    const b = setInterval(() => city.reload(), 120_000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [token, trucksRes.reload, city.reload]);

  // Default selection: your home territory
  useEffect(() => {
    if (selection || territories.length === 0) return;
    const home = territories.find((t) => t.territoryId === user?.territoryId) ?? territories[0];
    setSelection({ kind: 'territory', id: home.territoryId });
  }, [territories, user?.territoryId, selection]);

  // Route trail for the selected truck (Amazon Location position history)
  useEffect(() => {
    if (selection?.kind !== 'truck') { setTrail([]); return; }
    let cancelled = false;
    api.getTruckTrail(selection.id).then((r) => !cancelled && setTrail(r.points)).catch(() => !cancelled && setTrail([]));
    return () => { cancelled = true; };
  }, [selection, trucksRes.data]);

  const select = useCallback((s: MapSelection) => {
    Haptics.selectionAsync().catch(() => {});
    setSelection(s);
  }, []);

  const selTerritory = selection?.kind === 'territory' ? territories.find((t) => t.territoryId === selection.id) : undefined;
  const selBin = selection?.kind === 'bin' ? bins.find((b) => b.sourceId === selection.id) : undefined;
  const selTruck = selection?.kind === 'truck' ? trucks.find((t) => t.sourceId === selection.id) : undefined;

  // Chips: home first, then territories that need help most
  const chips = useMemo(() => {
    const home = territories.find((t) => t.territoryId === user?.territoryId);
    const rest = territories.filter((t) => t !== home).sort((a, b) => a.health - b.health);
    return home ? [home, ...rest] : rest;
  }, [territories, user?.territoryId]);

  const getHere = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) throw new Error('Location permission is needed for this.');
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    setHere(p);
    return p;
  };

  const reportBin = async (bin: MapBin, issue: 'FULL' | 'DAMAGED') => {
    if (busy) return;
    setBusy(true);
    try {
      const pos = await getHere();
      const res = await api.reportBin(bin.sourceId, { issue, ...pos });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Reported', res.message);
      await city.reload();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Could not report', err?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const markEmptied = async (bin: MapBin) => {
    if (busy) return;
    setBusy(true);
    try {
      const pos = await getHere();
      await api.markBinEmptied(bin.sourceId, { ...pos, repaired: bin.status === 'DAMAGED' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await city.reload();
    } catch (err: any) {
      Alert.alert('Could not update bin', err?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const glass = isDark ? 'rgba(11, 15, 22, 0.92)' : 'rgba(255, 255, 255, 0.95)';
  const loadingFirst = (city.loading && !city.data) || !token;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {city.data || city.error ? (
        <CityMap
          styleUrl={city.data?.mapStyle?.styleUrl ?? null}
          territories={territories}
          bins={bins}
          trucks={trucks}
          trail={trail}
          selection={selection}
          filter={filter}
          user={here}
          onSelect={select}
        />
      ) : null}

      {/* Top overlay */}
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 16) + 6 }]} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <View style={[styles.titlePill, { backgroundColor: glass, borderColor: theme.border }]}>
            <Icon name="map" size={18} color={theme.textPrimary} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>Delhi NCR</Text>
            <Text style={[styles.titleSub, { color: theme.textSecondary }]}>
              · {territories.length || '–'} territories · {trucks.filter((t) => t.status === 'active').length} trucks live
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((t) => {
            const on = selection?.kind === 'territory' && selection.id === t.territoryId;
            const home = t.territoryId === user?.territoryId;
            return (
              <Pressable
                key={t.territoryId}
                onPress={() => select({ kind: 'territory', id: t.territoryId })}
                style={[styles.chip, { backgroundColor: on ? theme.textPrimary : glass, borderColor: on ? theme.textPrimary : theme.border }]}
                accessibilityRole="button"
                accessibilityLabel={`${t.name}, ${t.health}% health${home ? ', your home territory' : ''}`}
                accessibilityState={{ selected: on }}
              >
                <Image source={characterForHealth(t.guardian.id, t.health)} style={styles.chipGuardian} resizeMode="contain" />
                <Text style={[styles.chipName, { color: on ? theme.bg : theme.textPrimary }]} numberOfLines={1}>
                  {home ? 'Home · ' : ''}{t.name}
                </Text>
                <Text style={[styles.chipHealth, { color: on ? theme.bg : healthColor(t.health) }]}>{t.health}%</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.segment, { backgroundColor: glass, borderColor: theme.border }]}>
          {FILTERS.map(([key, label]) => {
            const on = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setFilter(key); }}
                style={[styles.segBtn, on && { backgroundColor: theme.textPrimary }]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.segText, { color: on ? theme.bg : theme.textSecondary }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { backgroundColor: theme.bg, borderColor: theme.border, maxHeight: expanded ? '70%' : '46%' }]}>
        <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={12} style={styles.handleHit} accessibilityRole="button" accessibilityLabel={expanded ? 'Collapse details' : 'Expand details'}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </Pressable>

        {loadingFirst ? (
          <ActivityIndicator color={theme.accentCyan} style={{ marginVertical: 24 }} />
        ) : city.error && !city.data ? (
          <View style={styles.center}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Map unavailable</Text>
            <Text style={[styles.muted, { color: theme.textSecondary }]}>{city.error}</Text>
            <ChunkyButton small variant="secondary" label="Try again" onPress={() => city.reload()} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 14 }}>
            {selTerritory && (
              <TerritoryPanel
                t={selTerritory}
                bins={bins.filter((b) => b.territoryId === selTerritory.territoryId)}
                trucks={trucks.filter((k) => k.currentTerritoryId === selTerritory.territoryId && k.status === 'active')}
                isHome={selTerritory.territoryId === user?.territoryId}
                here={here}
                theme={theme}
                onBin={(id) => select({ kind: 'bin', id })}
                onTruck={(id) => select({ kind: 'truck', id })}
              />
            )}
            {selBin && (
              <BinPanel
                bin={selBin}
                territory={territories.find((t) => t.territoryId === selBin.territoryId)}
                here={here}
                theme={theme}
                busy={busy}
                isCollector={isCollector}
                onReport={(issue) => reportBin(selBin, issue)}
                onEmptied={() => markEmptied(selBin)}
                onBack={() => select({ kind: 'territory', id: selBin.territoryId })}
              />
            )}
            {selTruck && (
              <TruckPanel
                truck={selTruck}
                territory={territories.find((t) => t.territoryId === (selTruck.currentTerritoryId || selTruck.h3TerritoryId))}
                here={here}
                trailPoints={trail.length}
                theme={theme}
                onScan={() => navigation.navigate('Scan')}
              />
            )}
            {!selTerritory && !selBin && !selTruck && territories.length === 0 && (
              <Text style={[styles.muted, { color: theme.textSecondary, textAlign: 'center' }]}>
                No territories yet. Run the seed script to load Delhi's hexes.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// ---------- Panels ----------

const Stat: React.FC<{ value: string; label: string; theme: any; first?: boolean; color?: string }> = ({ value, label, theme, first, color }) => (
  <View style={[styles.stat, !first && { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
    <Text style={[styles.statVal, { color: color ?? theme.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

const TerritoryPanel: React.FC<{
  t: MapTerritory; bins: MapBin[]; trucks: LiveTruck[]; isHome: boolean; here: any; theme: any;
  onBin: (id: string) => void; onTruck: (id: string) => void;
}> = ({ t, bins, trucks, isHome, here, theme, onBin, onTruck }) => {
  const sorted = [...bins].filter((b) => b.kind === 'bin').sort((a, b) => (b.fillLevel ?? 0) - (a.fillLevel ?? 0));
  return (
    <>
      <View style={styles.header}>
        <View style={[styles.guardianBadge, { backgroundColor: healthColor(t.health) + '22', borderColor: healthColor(t.health) }]}>
          <Image source={characterForHealth(t.guardian.id, t.health)} style={styles.guardianImg} resizeMode="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]} numberOfLines={1}>
            {isHome ? 'Your territory · ' : ''}{t.ward || 'Delhi'}
          </Text>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]} numberOfLines={1}>{t.name}</Text>
          <Text style={[styles.muted, { color: theme.textSecondary }]} numberOfLines={1}>
            Guarded by {t.guardian.name} · {t.guardian.role}
          </Text>
        </View>
      </View>
      <View style={styles.healthRow}>
        <View style={{ flex: 1 }}>
          <ChunkyProgress value={t.health / 100} color={healthColor(t.health)} track={theme.surface3} height={10} />
        </View>
        <Text style={[styles.mood, { color: healthColor(t.health) }]}>{cap(t.mood)}</Text>
      </View>
      <View style={[styles.stats, { backgroundColor: theme.surface2 }]}>
        <Stat first value={`${t.health}%`} label="Health" theme={theme} />
        <Stat value={`${t.binsNeedingPickup}`} label="Bins to empty" theme={theme} color={t.binsNeedingPickup ? '#FF4D5E' : undefined} />
        <Stat value={`${t.openHotspots}`} label="Dump spots" theme={theme} />
        <Stat value={ago(t.lastTruckVisitAt)} label="Last truck" theme={theme} />
      </View>

      {trucks.map((k) => (
        <Pressable key={k.sourceId} onPress={() => onTruck(k.sourceId)} style={[styles.row, { borderColor: theme.border }]}>
          <Image source={CHARACTERS.truck} style={styles.rowImg} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{k.name}</Text>
            <Text style={[styles.rowSub, { color: theme.inkAccent.accentLime }]}>
              In this territory now{here ? ` · ${fmtDist(distanceMeters(here, k))} away` : ''}
            </Text>
          </View>
          <Icon name="next" size={18} color={theme.textSecondary} />
        </Pressable>
      ))}

      <Text style={[styles.group, { color: theme.textSecondary }]}>
        {sorted.length ? `Public bins (${sorted.length})` : 'No smart bins registered here yet'}
      </Text>
      {sorted.slice(0, 6).map((b) => (
        <Pressable key={b.sourceId} onPress={() => onBin(b.sourceId)} style={[styles.row, { borderColor: theme.border }]}>
          <View style={[styles.fillChip, { borderColor: BIN_UI[b.status].color }]}>
            <View style={[styles.fillInner, { height: `${b.fillLevel ?? 0}%`, backgroundColor: BIN_UI[b.status].color }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={1}>{b.name}</Text>
            <Text style={[styles.rowSub, { color: BIN_UI[b.status].color }]} numberOfLines={1}>
              {b.fillLevel ?? 0}% · {BIN_UI[b.status].label}{here ? ` · ${fmtDist(distanceMeters(here, b))}` : ''}
            </Text>
          </View>
          <Icon name="next" size={18} color={theme.textSecondary} />
        </Pressable>
      ))}
    </>
  );
};

const BinPanel: React.FC<{
  bin: MapBin; territory?: MapTerritory; here: any; theme: any; busy: boolean; isCollector: boolean;
  onReport: (issue: 'FULL' | 'DAMAGED') => void; onEmptied: () => void; onBack: () => void;
}> = ({ bin, territory, here, theme, busy, isCollector, onReport, onEmptied, onBack }) => {
  const ui = BIN_UI[bin.status];
  const ewaste = bin.kind === 'ewaste';
  return (
    <>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backRow}>
        <Icon name="back" size={16} color={theme.textSecondary} />
        <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>{territory?.name ?? 'Territory'}</Text>
      </Pressable>
      <Text style={[styles.sheetTitle, { color: theme.textPrimary }]} numberOfLines={2}>{bin.name}</Text>
      {ewaste ? (
        <Text style={[styles.muted, { color: theme.textSecondary }]}>Authorised e-waste drop-off point. Scan its QR when you drop items.</Text>
      ) : (
        <>
          <View style={styles.healthRow}>
            <View style={{ flex: 1 }}>
              <ChunkyProgress value={(bin.fillLevel ?? 0) / 100} color={ui.color} track={theme.surface3} height={12} />
            </View>
            <Text style={[styles.mood, { color: ui.color }]}>{bin.fillLevel ?? 0}%</Text>
          </View>
          <View style={[styles.stats, { backgroundColor: theme.surface2 }]}>
            <Stat first value={ui.label} label="Status" theme={theme} color={ui.color} />
            <Stat value={ago(bin.lastEmptiedAt)} label="Last emptied" theme={theme} />
            <Stat value={here ? fmtDist(distanceMeters(here, bin)) : '–'} label="Distance" theme={theme} />
          </View>
          <Text style={[styles.muted, { color: theme.textSecondary }]}>
            Fill is estimated from time since the last pickup and citizen reports. Trucks passing by reset it automatically.
          </Text>
          <View style={styles.actions}>
            {isCollector ? (
              <ChunkyButton small variant="success" icon="check" label={busy ? 'Saving…' : bin.status === 'DAMAGED' ? 'Emptied & repaired' : 'Mark emptied'} disabled={busy} onPress={onEmptied} style={{ flex: 1 }} />
            ) : (
              <>
                <ChunkyButton small variant="primary" label={busy ? 'Sending…' : 'Report full'} disabled={busy} onPress={() => onReport('FULL')} style={{ flex: 1 }} />
                <ChunkyButton small variant="secondary" label="Report damage" disabled={busy} onPress={() => onReport('DAMAGED')} style={{ flex: 1 }} />
              </>
            )}
          </View>
        </>
      )}
    </>
  );
};

const TruckPanel: React.FC<{
  truck: LiveTruck; territory?: MapTerritory; here: any; trailPoints: number; theme: any; onScan: () => void;
}> = ({ truck, territory, here, trailPoints, theme, onScan }) => {
  const live = truck.status === 'active';
  return (
    <>
      <View style={styles.header}>
        <View style={[styles.guardianBadge, { backgroundColor: theme.surface2, borderColor: live ? '#43E34F' : theme.border }]}>
          <Image source={CHARACTERS.truck} style={styles.guardianImg} resizeMode="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: live ? theme.inkAccent.accentLime : theme.textSecondary }]}>
            {live ? 'On route · live' : `Parked · last seen ${ago(truck.lastUpdated)}`}
          </Text>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]} numberOfLines={1}>{truck.name}</Text>
          <Text style={[styles.muted, { color: theme.textSecondary }]} numberOfLines={1}>
            {territory ? `In ${territory.name}` : 'Delhi NCR'}
          </Text>
        </View>
      </View>
      <View style={[styles.stats, { backgroundColor: theme.surface2 }]}>
        <Stat first value={here ? fmtDist(distanceMeters(here, truck)) : '–'} label="From you" theme={theme} />
        <Stat value={truck.speedKmh != null ? `${Math.round(truck.speedKmh)} km/h` : '–'} label="Speed" theme={theme} />
        <Stat value={ago(truck.lastUpdated)} label="Updated" theme={theme} />
      </View>
      <Text style={[styles.muted, { color: theme.textSecondary }]}>
        {trailPoints > 1 ? 'Blue line: route in the last 2 hours (Amazon Location tracker).' : 'No route recorded in the last 2 hours.'}
      </Text>
      {live ? <ChunkyButton small variant="success" icon="scan" label="Hand over waste · scan QR" onPress={onScan} /> : null}
    </>
  );
};

const shadow = (o: number, r: number, y: number, e: number) =>
  Platform.select({ ios: { shadowColor: '#0B2A33', shadowOpacity: o, shadowRadius: r, shadowOffset: { width: 0, height: y } }, android: { elevation: e } });

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, gap: 8 },
  topRow: { flexDirection: 'row', paddingHorizontal: 16 },
  titlePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, ...shadow(0.12, 10, 4, 3) },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 17 },
  titleSub: { fontFamily: typography.fontBodyMedium, fontSize: 12.5 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, maxWidth: 220, ...shadow(0.1, 8, 3, 2) },
  chipGuardian: { width: 26, height: 26 },
  chipName: { fontFamily: typography.fontBodyBold, fontSize: 13, flexShrink: 1 },
  chipHealth: { fontFamily: typography.fontDisplayExtraBold, fontSize: 13, fontVariant: ['tabular-nums'] },
  segment: { flexDirection: 'row', alignSelf: 'flex-start', marginLeft: 16, padding: 3, borderRadius: 999, borderWidth: 1 },
  segBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  segText: { fontFamily: typography.fontBodyBold, fontSize: 12.5 },

  sheet: { position: 'absolute', left: 10, right: 10, bottom: 10, borderRadius: 28, borderWidth: 1, paddingHorizontal: 18, ...shadow(0.18, 20, 8, 8) },
  handleHit: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  handle: { width: 40, height: 5, borderRadius: 3 },
  center: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guardianBadge: { width: 58, height: 58, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  guardianImg: { width: 48, height: 48 },
  eyebrow: { fontFamily: typography.fontBodyBold, fontSize: 12 },
  sheetTitle: { fontFamily: typography.fontDisplayExtraBold, fontSize: 21, letterSpacing: -0.4 },
  muted: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, lineHeight: 17 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mood: { fontFamily: typography.fontDisplayBold, fontSize: 14 },
  stats: { flexDirection: 'row', borderRadius: 18, paddingVertical: 10 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statVal: { fontFamily: typography.fontDisplayExtraBold, fontSize: 16, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: typography.fontBodyMedium, fontSize: 10.5, marginTop: 1 },
  group: { fontFamily: typography.fontBodyBold, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  rowImg: { width: 40, height: 40 },
  rowTitle: { fontFamily: typography.fontBodyBold, fontSize: 14 },
  rowSub: { fontFamily: typography.fontBodyMedium, fontSize: 12, marginTop: 2 },
  fillChip: { width: 22, height: 34, borderRadius: 6, borderWidth: 2, overflow: 'hidden', justifyContent: 'flex-end', marginHorizontal: 9 },
  fillInner: { width: '100%' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', gap: 8 },
});
