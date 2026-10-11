import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D, Icon3DName } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard, RainbowCard } from '../../components/Chunky';
import { FadeInUp, CountUp } from '../../components/Motion';
import { typography } from '../../theme/tokens';
import { CHARACTERS } from '../../theme/characters';
import { api, ApiError, CatalogCoupon } from '../../services/api';
import { useApiData } from '../../hooks/useApiData';

const SvgComp = Svg as any;
const DefsComp = Defs as any;
const GradComp = LinearGradient as any;
const RadGradComp = RadialGradient as any;
const StopComp = Stop as any;
const RectComp = Rect as any;

type Category = 'all' | string;

const CATEGORY_LABEL: Record<string, string> = {
  all: 'All',
  food_beverage: 'Food & Drinks',
  groceries: 'Groceries',
  dairy: 'Dairy',
  fashion: 'Fashion',
  services: 'Services',
};
const CATEGORY_ICON: Record<string, Icon3DName> = {
  food_beverage: 'recycle',
  groceries: 'bin',
  dairy: 'recycle',
  fashion: 'shield',
  services: 'truck',
};
const PASTEL: Record<string, string> = {
  food_beverage: '#FFE9DF',
  groceries: '#DFF8DD',
  dairy: '#DDF6FF',
  fashion: '#FFE3F4',
  services: '#ECE5FD',
};

const prettyMerchant = (c: CatalogCoupon) =>
  c.merchantName || c.merchantId.replace(/^merchant_/, '').split('_').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

const ACTION_LABEL: Record<string, string> = {
  QR_SCAN: 'QR scan',
  COUPON_REDEMPTION: 'Coupon redeemed',
  HABIT_CHECKIN: 'Daily check-in',
  PHOTO_PROOF: 'Photo proof',
};

export const RewardsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, token, applyServerBalance } = useAuth();
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const catalog = useApiData(() => api.getCoupons(), [token], !!token);
  const wallet = useApiData(() => api.getWallet(), [token], !!token);

  const balance = wallet.data?.balanceGC ?? user?.greenCredits ?? 0;
  const accent = isDark ? theme.accentCyan : theme.tabBarActive;
  const coupons = catalog.data?.coupons ?? [];
  const redeemedIds = new Set((wallet.data?.activeCoupons ?? []).map((c) => c.couponId));
  const categories = ['all', ...Array.from(new Set(coupons.map((c) => c.category).filter(Boolean) as string[]))];

  const nextGoal = [...coupons]
    .filter((r) => r.costGC > balance && !redeemedIds.has(r.couponId))
    .sort((x, y) => x.costGC - y.costGC)[0];

  const filteredCoupons = coupons.filter((item) => (selectedCategory === 'all' ? true : item.category === selectedCategory));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([catalog.reload(), wallet.reload()]);
    setRefreshing(false);
  }, [catalog.reload, wallet.reload]);

  const handleRedeem = async (item: CatalogCoupon) => {
    if (redeemingId) return;
    setRedeemingId(item.couponId);
    try {
      const res = await api.redeemCoupon(item.couponId, item.merchantId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      applyServerBalance(res.newBalanceGC);
      await Promise.all([wallet.reload(), catalog.reload()]);
      Alert.alert('Coupon redeemed', `${item.title}\n\nShow code ${res.redemption.redemptionCode} at ${prettyMerchant(item)}.`);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert(err instanceof ApiError && err.code === 'INSUFFICIENT_BALANCE' ? 'Not enough credits' : 'Could not redeem', err?.message || 'Please try again.');
    } finally {
      setRedeemingId(null);
    }
  };

  const showHistory = () => {
    Haptics.selectionAsync().catch(() => {});
    const tx = wallet.data?.recentTransactions ?? [];
    if (tx.length === 0) {
      Alert.alert('Rewards history', wallet.error ? wallet.error : 'No activity yet. Scan a collector QR to earn your first credits.');
      return;
    }
    const lines = tx.slice(0, 8).map((t) => {
      const sign = t.creditsEarned >= 0 ? '+' : '';
      const day = new Date(t.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      return `${day}  ${ACTION_LABEL[t.actionType] || t.actionType.replace(/_/g, ' ').toLowerCase()}  ${sign}${t.creditsEarned} GC`;
    });
    Alert.alert('Rewards history', lines.join('\n'));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>Rewards</Text>

        {/* Balance hero */}
        <FadeInUp index={0} style={styles.heroWrap}>
          <RainbowCard step={3} style={styles.hero}>
            {/* Tinted night background + soft spotlight behind Buddy (no hard edges) */}
            <SvgComp style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
              <DefsComp>
                <GradComp id="rewardsHeroBg" x1="0" y1="0" x2="0.55" y2="1">
                  <StopComp offset="0" stopColor="#0E2A36" />
                  <StopComp offset="1" stopColor="#05070C" />
                </GradComp>
                <RadGradComp id="rewardsHeroGlow" cx="80%" cy="30%" rx="42%" ry="40%" fx="80%" fy="30%">
                  <StopComp offset="0" stopColor="#FFD64A" stopOpacity="0.26" />
                  <StopComp offset="0.55" stopColor="#FFD64A" stopOpacity="0.07" />
                  <StopComp offset="1" stopColor="#FFD64A" stopOpacity="0" />
                </RadGradComp>
              </DefsComp>
              <RectComp width="100%" height="100%" fill="url(#rewardsHeroBg)" />
              <RectComp width="100%" height="100%" fill="url(#rewardsHeroGlow)" />
            </SvgComp>

            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroEyebrow}>Green Credits balance</Text>
                <View style={styles.heroValueRow}>
                  <CountUp to={balance} format={(n) => Math.round(n).toLocaleString()} style={styles.heroValue} />
                  <Text style={styles.heroUnit}>GC</Text>
                </View>
                <TouchableOpacity
                  style={styles.historyBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  onPress={showHistory}
                >
                  <Text style={styles.historyBtnText}>History</Text>
                </TouchableOpacity>
              </View>
              <Image source={CHARACTERS.buddy} style={styles.heroBuddy} resizeMode="contain" />
            </View>

            {/* Progress to the cheapest reward you can't afford yet */}
            <View style={styles.nextTray}>
              {nextGoal ? (
                <>
                  <View style={styles.nextRow}>
                    <Text style={styles.nextLabel} numberOfLines={1}>
                      Next: <Text style={styles.nextStrong}>{nextGoal.title}</Text>
                    </Text>
                    <Text style={styles.nextToGo}>{(nextGoal.costGC - balance).toLocaleString()} GC to go</Text>
                  </View>
                  <View style={styles.nextTrack}>
                    <View style={[styles.nextFill, { width: `${Math.round((balance / nextGoal.costGC) * 100)}%` }]}>
                      <SvgComp width="100%" height="100%" preserveAspectRatio="none">
                        <DefsComp>
                          <GradComp id="rewardsNextFill" x1="0" y1="0" x2="1" y2="0">
                            <StopComp offset="0" stopColor="#6EDDB0" />
                            <StopComp offset="1" stopColor="#00CFFF" />
                          </GradComp>
                        </DefsComp>
                        <RectComp width="100%" height="100%" fill="url(#rewardsNextFill)" />
                      </SvgComp>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.nextLabel}>{coupons.length ? 'You can afford every reward here.' : 'Loading rewards…'}</Text>
              )}
            </View>
          </RainbowCard>
        </FadeInUp>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const labels = CATEGORY_LABEL;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  { backgroundColor: isActive ? theme.textPrimary : 'transparent', borderColor: isActive ? theme.textPrimary : theme.border },
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: isActive ? theme.bg : theme.textSecondary }]}>{labels[cat] || cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Your active codes */}
        {(wallet.data?.activeCoupons?.length ?? 0) > 0 && (
          <View style={styles.codes}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your codes</Text>
            {wallet.data!.activeCoupons.slice(0, 3).map((c) => (
              <View key={c.redemptionId} style={[styles.codeRow, { backgroundColor: isDark ? theme.surface2 : '#F1F4F9' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.codeTitle, { color: theme.textPrimary }]} numberOfLines={1}>{c.title}</Text>
                  <Text style={[styles.couponMerchant, { color: theme.textSecondary }]}>
                    Valid till {new Date(c.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text selectable style={[styles.codeValue, { color: theme.textPrimary }]}>{c.redemptionCode}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Coupons */}
        {catalog.loading && coupons.length === 0 ? (
          <ActivityIndicator color={accent} style={{ marginTop: 32 }} />
        ) : catalog.error && coupons.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Couldn't load rewards</Text>
            <Text style={[styles.couponMerchant, { color: theme.textSecondary, textAlign: 'center' }]}>{catalog.error}</Text>
            <ChunkyButton small variant="secondary" label="Try again" onPress={() => catalog.reload()} />
          </View>
        ) : filteredCoupons.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No rewards here yet</Text>
            <Text style={[styles.couponMerchant, { color: theme.textSecondary }]}>New partner offers appear every week.</Text>
          </View>
        ) : (
        <View style={styles.couponList}>
          {filteredCoupons.map((item, idx) => {
            const isRedeemed = redeemedIds.has(item.couponId);
            const short = item.costGC - balance;
            const busy = redeemingId === item.couponId;
            const canRedeem = !isRedeemed && short <= 0 && !busy;
            const cat = item.category || 'services';
            return (
              <FadeInUp key={item.couponId} index={idx}>
              <ChunkyCard style={styles.couponCard}>
                <View style={[styles.couponIcon, { backgroundColor: isDark ? theme.surface2 : PASTEL[cat] || '#F1F4F9' }]}>
                  <Icon3D name={CATEGORY_ICON[cat] || 'recycle'} size={48} />
                </View>

                <View style={styles.couponInfo}>
                  <Text style={[styles.couponTitle, { color: theme.textPrimary }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.couponMerchant, { color: theme.textSecondary }]} numberOfLines={1}>{prettyMerchant(item)}</Text>
                  {item.stock <= 5 && <Text style={styles.lowStock}>Only {item.stock} left</Text>}
                </View>

                <View style={styles.couponRight}>
                  <Text style={[styles.couponCredits, { color: theme.textPrimary }]}>
                    {item.costGC.toLocaleString()} <Text style={[styles.couponUnit, { color: theme.textSecondary }]}>GC</Text>
                  </Text>
                  <ChunkyButton
                    small
                    variant={canRedeem ? 'primary' : 'secondary'}
                    label={busy ? 'Redeeming…' : isRedeemed ? 'Redeemed' : short <= 0 ? 'Redeem' : `Need ${short.toLocaleString()}`}
                    icon={isRedeemed ? 'check' : short > 0 ? 'lock' : 'gift'}
                    disabled={!canRedeem}
                    onPress={() => handleRedeem(item)}
                  />
                </View>
              </ChunkyCard>
              </FadeInUp>
            );
          })}
        </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 120 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 36, letterSpacing: -1, marginBottom: 18 },

  heroWrap: { marginBottom: 18 },
  hero: { padding: 20, paddingBottom: 16, borderWidth: 1, borderColor: 'rgba(247, 255, 255, 0.07)' },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroText: { flex: 1, paddingRight: 8 },
  heroBuddy: { width: 104, height: 104 },
  heroEyebrow: { fontFamily: typography.fontBodyMedium, fontSize: 13, color: '#8FA3B5' },
  heroValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 },
  heroValue: { fontFamily: typography.fontDisplayExtraBold, fontSize: 52, lineHeight: 58, letterSpacing: -2, color: '#F7FFFF', fontVariant: ['tabular-nums'] },
  heroUnit: { fontFamily: typography.fontDisplayBold, fontSize: 18, color: '#B5C0CF', marginLeft: 6, marginBottom: 10 },
  historyBtn: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, backgroundColor: 'rgba(247, 255, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(247, 255, 255, 0.10)' },
  historyBtnText: { fontFamily: typography.fontBodyBold, fontSize: 13, color: '#F7FFFF' },
  nextTray: { marginTop: 16, padding: 12, borderRadius: 18, backgroundColor: 'rgba(247, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(247, 255, 255, 0.06)', gap: 8 },
  nextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nextLabel: { flex: 1, fontFamily: typography.fontBodyMedium, fontSize: 12.5, color: '#8FA3B5' },
  nextStrong: { fontFamily: typography.fontBodyBold, color: '#F7FFFF' },
  nextToGo: { fontFamily: typography.fontBodyBold, fontSize: 12.5, color: '#6EDDB0', fontVariant: ['tabular-nums'] },
  nextTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(247, 255, 255, 0.09)', overflow: 'hidden' },
  nextFill: { height: '100%', borderRadius: 4, overflow: 'hidden' },

  chipScroll: { marginHorizontal: -20, marginBottom: 18, flexGrow: 0 },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50, borderWidth: 2 },
  chipText: { fontFamily: typography.fontBodySemiBold, fontSize: 13.5 },

  couponList: { gap: 14 },
  couponCard: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  couponIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  couponInfo: { flex: 1 },
  couponTitle: { fontFamily: typography.fontBodyBold, fontSize: 15.5, lineHeight: 20 },
  couponMerchant: { fontFamily: typography.fontBodyMedium, fontSize: 12.5, marginTop: 3 },
  couponRight: { alignItems: 'flex-end', gap: 8 },
  couponCredits: { fontFamily: typography.fontDisplayBold, fontSize: 17, fontVariant: ['tabular-nums'] },
  couponUnit: { fontFamily: typography.fontBodyBold, fontSize: 12 },
  lowStock: { fontFamily: typography.fontBodyBold, fontSize: 11.5, color: '#E8590C', marginTop: 3 },
  sectionTitle: { fontFamily: typography.fontDisplayBold, fontSize: 19, marginBottom: 2 },
  codes: { gap: 8, marginBottom: 18 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16 },
  codeTitle: { fontFamily: typography.fontBodyBold, fontSize: 14 },
  codeValue: { fontFamily: typography.fontDisplayBold, fontSize: 15, letterSpacing: 0.5 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyTitle: { fontFamily: typography.fontDisplayBold, fontSize: 18 },
  redeemBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50 },
  redeemBtnText: { fontFamily: typography.fontBodyBold, fontSize: 12.5 },
});
