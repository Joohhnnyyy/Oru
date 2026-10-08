import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';

const DEMO_COUPONS = [
  { id: 'c1', merchant: 'Mother Dairy Safal', offer: '₹50 Off Organic Veggies', cost: 100, category: 'Grocery' },
  { id: 'c2', merchant: 'Delhi Metro Smart Card', offer: '₹30 Top-up Voucher', cost: 150, category: 'Transport' },
  { id: 'c3', merchant: 'TrustBasket Home Compost', offer: '25% Off Bokashi Starter Kit', cost: 180, category: 'Compost' },
];

export const ProfileScreen: React.FC<{ navigation: any }> = () => {
  const { user, updateCredits, switchPersona } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'coupons' | 'vouchers'>('profile');
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>(['SAFAL-GREEN-9281']);

  const handleRedeem = (coupon: typeof DEMO_COUPONS[0]) => {
    if (!user || user.greenCredits < coupon.cost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    updateCredits(-coupon.cost);
    const code = `${coupon.merchant.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRedeemedVouchers([code, ...redeemedVouchers]);
    setActiveTab('vouchers');
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Profile & Rewards" />

      {/* Tab Switcher */}
      <View style={styles.tabsRow}>
        <PressableScale
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]}
          onPress={() => setActiveTab('profile')}
          haptic="light"
        >
          <Text style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}>
            Overview
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.tabBtn, activeTab === 'coupons' && styles.tabBtnActive]}
          onPress={() => setActiveTab('coupons')}
          haptic="light"
        >
          <Text style={[styles.tabBtnText, activeTab === 'coupons' && styles.tabBtnTextActive]}>
            Coupons ({DEMO_COUPONS.length})
          </Text>
        </PressableScale>

        <PressableScale
          style={[styles.tabBtn, activeTab === 'vouchers' && styles.tabBtnActive]}
          onPress={() => setActiveTab('vouchers')}
          haptic="light"
        >
          <Text style={[styles.tabBtnText, activeTab === 'vouchers' && styles.tabBtnTextActive]}>
            Vouchers ({redeemedVouchers.length})
          </Text>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && (
          <>
            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <Text style={styles.userName}>{user?.displayName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.rankPill}>
                <Text style={styles.rankText}>Level {user?.level} • {user?.rankTitle}</Text>
              </View>
            </View>

            {/* Wallet Balance Card */}
            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>TOTAL GREEN CREDITS BALANCE</Text>
              <Text style={styles.walletBalance}>✨ {user?.greenCredits} GC</Text>
              <Text style={styles.xpText}>Lifetime Impact: {user?.lifetimeXp} XP (Rank: Van Rakshak)</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.gridBox}>
                <Text style={styles.gridVal}>48</Text>
                <Text style={styles.gridLabel}>Verified Actions</Text>
              </View>
              <View style={styles.gridBox}>
                <Text style={styles.gridVal}>{user?.streakDays} Days</Text>
                <Text style={styles.gridLabel}>Current Streak</Text>
              </View>
              <View style={styles.gridBox}>
                <Text style={styles.gridVal}>3</Text>
                <Text style={styles.gridLabel}>Delhi Hexes Visited</Text>
              </View>
              <View style={styles.gridBox}>
                <Text style={styles.gridVal}>14.2 kg</Text>
                <Text style={styles.gridLabel}>Waste Diverted</Text>
              </View>
            </View>

            {/* Quick Switch to Collector Mode */}
            <PressableScale
              style={styles.switchRoleCard}
              onPress={() => switchPersona('collector')}
              haptic="medium"
            >
              <View style={styles.switchIconBadge}>
                <Text style={styles.switchIcon}>🚛</Text>
              </View>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Switch to Collector Mode</Text>
                <Text style={styles.switchSub}>Display rotating 30s QR code and stream route location</Text>
              </View>
              <Text style={styles.switchArrow}>→</Text>
            </PressableScale>
          </>
        )}

        {activeTab === 'coupons' && (
          <>
            <Text style={styles.sectionHeading}>Eco-Merchant Coupon Marketplace</Text>
            {DEMO_COUPONS.map((coupon) => (
              <View key={coupon.id} style={styles.couponCard}>
                <View style={styles.couponHeader}>
                  <Text style={styles.merchantName}>{coupon.merchant}</Text>
                  <Text style={styles.couponCost}>{coupon.cost} GC</Text>
                </View>
                <Text style={styles.couponOffer}>{coupon.offer}</Text>
                <PressableScale
                  style={[
                    styles.redeemBtn,
                    (user?.greenCredits || 0) < coupon.cost && styles.redeemBtnDisabled,
                  ]}
                  onPress={() => handleRedeem(coupon)}
                  disabled={(user?.greenCredits || 0) < coupon.cost}
                  haptic={false}
                >
                  <Text style={styles.redeemBtnText}>
                    {(user?.greenCredits || 0) >= coupon.cost ? 'Redeem Voucher' : 'Insufficient Credits'}
                  </Text>
                </PressableScale>
              </View>
            ))}
          </>
        )}

        {activeTab === 'vouchers' && (
          <>
            <Text style={styles.sectionHeading}>Your Active Vouchers & QR Codes</Text>
            {redeemedVouchers.map((code, index) => (
              <View key={index} style={styles.voucherCard}>
                <Text style={styles.voucherMerchant}>Eco Partner Voucher</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.voucherCode}>{code}</Text>
                </View>
                <Text style={styles.voucherHint}>Show this code or scannable voucher at checkout</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0E1626',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#10B981',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#111A2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 34,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  rankPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  rankText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  walletCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    padding: 20,
    marginBottom: 16,
  },
  walletLabel: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  walletBalance: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  xpText: {
    color: '#A7F3D0',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gridBox: {
    width: '48.5%',
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  gridVal: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  gridLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  switchRoleCard: {
    backgroundColor: '#111A2E',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchIcon: {
    fontSize: 22,
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchSub: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
  },
  switchArrow: {
    color: '#3B82F6',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: '#111A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    marginBottom: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  merchantName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  couponCost: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '800',
  },
  couponOffer: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 14,
  },
  redeemBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  redeemBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  voucherCard: {
    backgroundColor: '#111A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  voucherMerchant: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  voucherCode: {
    color: '#34D399',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  voucherHint: {
    color: '#64748B',
    fontSize: 11,
  },
});
