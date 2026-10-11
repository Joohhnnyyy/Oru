import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon3D } from '../../components/Icon3D';
import { ChunkyButton, ChunkyCard, RainbowCard } from '../../components/Chunky';
import { FadeInUp, CountUp } from '../../components/Motion';
import { typography } from '../../theme/tokens';

const SvgComp = Svg as any;
const DefsComp = Defs as any;
const GradComp = LinearGradient as any;
const StopComp = Stop as any;
const RectComp = Rect as any;

interface CouponItem {
  id: string;
  title: string;
  merchant: string;
  credits: number;
  category: 'food' | 'transport' | 'lifestyle';
  icon: 'recycle' | 'truck' | 'bin' | 'shield';
}

const REWARDS_DATA: CouponItem[] = [
  {
    id: '1',
    title: '₹100 off',
    merchant: 'Local Kirana Store',
    credits: 500,
    category: 'food',
    icon: 'recycle',
  },
  {
    id: '2',
    title: 'Free Metro Ride',
    merchant: 'Delhi Metro',
    credits: 800,
    category: 'transport',
    icon: 'truck',
  },
  {
    id: '3',
    title: '10% off on Bike Rental',
    merchant: 'CityRide',
    credits: 600,
    category: 'transport',
    icon: 'shield',
  },
  {
    id: '4',
    title: 'Compost Kit',
    merchant: 'GreenLife',
    credits: 700,
    category: 'lifestyle',
    icon: 'bin',
  },
  {
    id: '5',
    title: '20% off Organic Veggies',
    merchant: 'Mother Dairy Safal',
    credits: 450,
    category: 'food',
    icon: 'recycle',
  },
];

const PASTEL = { food: '#DFF8DD', transport: '#DDF6FF', lifestyle: '#FFE3F4' };

export const RewardsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateCredits } = useAuth();
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'transport' | 'lifestyle'>('all');
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);

  const balance = user?.greenCredits ?? 1240;
  const accent = isDark ? theme.accentCyan : theme.tabBarActive;

  const filteredCoupons = REWARDS_DATA.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const handleRedeem = (item: CouponItem) => {
    const currentCredits = user?.greenCredits ?? 1240;
    if (currentCredits < item.credits) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert(
        'Insufficient Credits',
        `You need ${item.credits} credits to redeem this coupon. You currently have ${currentCredits} credits.`
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    updateCredits(-item.credits);
    setRedeemedIds((prev) => [...prev, item.id]);
    Alert.alert(
      'Coupon Redeemed!',
      `Successfully redeemed "${item.title} at ${item.merchant}". Code: ORU-${Math.floor(1000 + Math.random() * 9000)}`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Rewards</Text>

        {/* Balance hero */}
        <RainbowCard style={styles.hero}>
          <View style={styles.heroCoin}>
            <Icon3D name="credit" size={92} />
          </View>
          <Text style={styles.heroEyebrow}>GREEN CREDITS</Text>
          <CountUp to={balance} format={(n) => Math.round(n).toLocaleString()} style={styles.heroValue} />
          <TouchableOpacity
            style={styles.historyBtn}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              Alert.alert('Rewards History', 'You have redeemed 2 vouchers this month. +150 credits earned this week!');
            }}
          >
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </RainbowCard>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
          {(['all', 'food', 'transport', 'lifestyle'] as const).map((cat) => {
            const isActive = selectedCategory === cat;
            const labels: Record<string, string> = { all: 'All', food: 'Food & Grocery', transport: 'Transport', lifestyle: 'Lifestyle' };
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
                <Text style={[styles.chipText, { color: isActive ? theme.bg : theme.textSecondary }]}>{labels[cat]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Coupons */}
        <View style={styles.couponList}>
          {filteredCoupons.map((item, idx) => {
            const isRedeemed = redeemedIds.includes(item.id);
            const short = item.credits - balance;
            const canRedeem = !isRedeemed && short <= 0;
            return (
              <FadeInUp key={item.id} index={idx}>
              <ChunkyCard style={styles.couponCard}>
                <View style={[styles.couponIcon, { backgroundColor: isDark ? theme.surface2 : PASTEL[item.category] }]}>
                  <Icon3D name={item.icon} size={48} />
                </View>

                <View style={styles.couponInfo}>
                  <Text style={[styles.couponTitle, { color: theme.textPrimary }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.couponMerchant, { color: theme.textSecondary }]}>{item.merchant}</Text>
                </View>

                <View style={styles.couponRight}>
                  <Text style={[styles.couponCredits, { color: theme.textPrimary }]}>{item.credits}</Text>
                  <ChunkyButton
                    small
                    variant={canRedeem ? 'primary' : 'secondary'}
                    label={isRedeemed ? 'Redeemed' : canRedeem ? 'Redeem' : `${short} short`}
                    icon={isRedeemed ? 'check' : !canRedeem ? 'lock' : 'gift'}
                    disabled={!canRedeem}
                    onPress={() => handleRedeem(item)}
                  />
                </View>
              </ChunkyCard>
              </FadeInUp>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 120 },
  title: { fontFamily: typography.fontDisplayExtraBold, fontSize: 36, letterSpacing: -1, marginBottom: 18 },

  hero: { padding: 22, minHeight: 150, marginBottom: 6 },
  heroCoin: { position: 'absolute', right: 8, top: 8 },
  heroEyebrow: { fontFamily: typography.fontBodyBold, fontSize: 11, letterSpacing: 1.6, color: '#7F8B9C' },
  heroValue: { fontFamily: typography.fontDisplayExtraBold, fontSize: 60, lineHeight: 66, letterSpacing: -2, color: '#F7FFFF', marginTop: 6, fontVariant: ['tabular-nums'] },
  historyBtn: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, backgroundColor: 'rgba(247, 255, 255, 0.10)' },
  historyBtnText: { fontFamily: typography.fontBodyBold, fontSize: 13, color: '#F7FFFF' },

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
  redeemBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50 },
  redeemBtnText: { fontFamily: typography.fontBodyBold, fontSize: 12.5 },
});
