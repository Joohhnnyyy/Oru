import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';

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
    if (!user || user.greenCredits < coupon.cost) return;
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
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'coupons' && styles.tabBtnActive]}
          onPress={() => setActiveTab('coupons')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'coupons' && styles.tabBtnTextActive]}>
            Coupons ({DEMO_COUPONS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'vouchers' && styles.tabBtnActive]}
          onPress={() => setActiveTab('vouchers')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'vouchers' && styles.tabBtnTextActive]}>
            My Vouchers ({redeemedVouchers.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
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
            <TouchableOpacity
              style={styles.switchRoleCard}
              onPress={() => switchPersona('collector')}
            >
              <Text style={styles.switchIcon}>🚛</Text>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Switch to Collector Mode</Text>
                <Text style={styles.switchSub}>Display rotating 30s QR code and stream route location</Text>
              </View>
              <Text style={styles.switchArrow}>→</Text>
            </TouchableOpacity>
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
                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    (user?.greenCredits || 0) < coupon.cost && styles.redeemBtnDisabled,
                  ]}
                  onPress={() => handleRedeem(coupon)}
                  disabled={(user?.greenCredits || 0) < coupon.cost}
                >
                  <Text style={styles.redeemBtnText}>
                    {(user?.greenCredits || 0) >= coupon.cost ? 'Redeem Voucher' : 'Insufficient Credits'}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
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
    paddingBottom: 32,
  },
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 32,
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
    marginBottom: 10,
  },
  rankPill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  rankText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
  },
  walletCard: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 20,
    marginBottom: 16,
  },
  walletLabel: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  walletBalance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
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
    width: '48%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
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
  },
  switchRoleCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    fontSize: 28,
    marginRight: 12,
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
  },
  switchArrow: {
    color: '#93C5FD',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  couponCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  merchantName: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  couponCost: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  couponOffer: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  redeemBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  redeemBtnDisabled: {
    backgroundColor: '#334155',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  voucherCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  voucherMerchant: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  codeContainer: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  voucherCode: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  voucherHint: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});
