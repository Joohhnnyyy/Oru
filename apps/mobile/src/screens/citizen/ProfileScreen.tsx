import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { PressableScale } from '../../components/PressableScale';
import { colors, radii, spacing } from '../../theme/tokens';

const DEMO_COUPONS = [
  { id: 'c1', merchant: 'Mother Dairy Safal', offer: '₹50 Off Organic Veggies', cost: 100, category: 'Grocery' },
  { id: 'c2', merchant: 'Delhi Metro Smart Card', offer: '₹30 Top-up Voucher', cost: 150, category: 'Transport' },
  { id: 'c3', merchant: 'TrustBasket Home Compost', offer: '25% Off Bokashi Starter Kit', cost: 180, category: 'Compost' },
];

import { Icon3D } from '../../components/Icon3D';
import { Blobatar } from '../../components/Blobatar';
import { AvatarPresetKey, AvatarAnimationKey } from '../../avatar/avatarRuntimeSource';

const PRESET_OPTIONS: { id: AvatarPresetKey; name: string; tag: string }[] = [
  { id: 'safari-mint', name: 'Safari Mint', tag: 'Eco Guardian' },
  { id: 'strobi', name: 'Strobi', tag: 'Classic Blue' },
  { id: 'freddy', name: 'Freddy', tag: 'Warm Orange' },
  { id: 'citrus', name: 'Citrus', tag: 'Sun Spark' },
  { id: 'nova', name: 'Nova', tag: 'Teal Byte' },
  { id: 'kirby', name: 'Kirby', tag: 'Soft Bloom' },
  { id: 'sunee', name: 'Sunee', tag: 'Amber Glow' },
  { id: 'cloudee', name: 'Cloudee', tag: 'Mist Feather' },
  { id: 'cubee', name: 'Cubee', tag: 'Ruby Poly' },
  { id: 'grok-bot', name: 'Grok Bot', tag: 'Night Scout' },
  { id: 'onee', name: 'Onee', tag: 'Pale Frost' },
];

const PLAYFUL_CYCLE: AvatarAnimationKey[] = ['playful', 'excited', 'laughing', 'celebrate', 'proud', 'happy', 'curious'];

export const ProfileScreen: React.FC<{ navigation: any }> = () => {
  const { user, updateCredits, switchPersona } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'coupons' | 'vouchers'>('profile');
  const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>(['SAFAL-GREEN-9281']);
  const [selectedPreset, setSelectedPreset] = useState<AvatarPresetKey>('safari-mint');
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimationKey>('proud');

  const handleAvatarTap = () => {
    const nextIdx = (PLAYFUL_CYCLE.indexOf(avatarAnim) + 1) % PLAYFUL_CYCLE.length;
    setAvatarAnim(PLAYFUL_CYCLE[nextIdx]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleSelectPreset = (p: AvatarPresetKey) => {
    setSelectedPreset(p);
    setAvatarAnim('excited');
    Haptics.selectionAsync().catch(() => {});
  };

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

      {/* Tab Switcher in Pill Layout */}
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
            {/* User Info Card with Blobatar Avatar */}
            <View style={styles.userCard}>
              <View style={styles.avatarBlobWrapper}>
                <Blobatar
                  preset={selectedPreset}
                  animation={avatarAnim}
                  size={100}
                  interactive={true}
                  onPress={handleAvatarTap}
                />
              </View>
              <Text style={styles.avatarTapHint}>Tap companion to play • Current mood: {avatarAnim}</Text>
              <Text style={styles.userName}>{user?.displayName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.rankPill}>
                <Text style={styles.rankText}>Level {user?.level} • {user?.rankTitle}</Text>
              </View>

              {/* Horizontal Avatar Preset Selector */}
              <View style={styles.presetSelectorSection}>
                <Text style={styles.presetSelectorTitle}>CHOOSE CIVIC COMPANION</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
                  {PRESET_OPTIONS.map((item) => {
                    const isSelected = item.id === selectedPreset;
                    return (
                      <PressableScale
                        key={item.id}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => handleSelectPreset(item.id)}
                        haptic="light"
                      >
                        <Text style={[styles.presetChipName, isSelected && styles.presetChipNameActive]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.presetChipTag, isSelected && styles.presetChipTagActive]}>
                          {item.tag}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Wallet Balance Card */}
            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>TOTAL GREEN CREDITS BALANCE</Text>
              <View style={styles.balanceRow}>
                <Icon3D name="credit" size={32} />
                <Text style={styles.walletBalance}>{user?.greenCredits} GC</Text>
              </View>
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
                <Icon3D name="truck" size={34} />
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
                  <Text style={[styles.redeemBtnText, (user?.greenCredits || 0) < coupon.cost && styles.redeemBtnTextDisabled]}>
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
    backgroundColor: colors.surfaceBase,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  tabBtnActive: {
    backgroundColor: colors.surfaceRaised,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: colors.textDark,
    fontWeight: '800',
  },
  scroll: {
    padding: spacing.s2,
    paddingBottom: spacing.s6,
  },
  userCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s3,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarBlobWrapper: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarTapHint: {
    color: colors.textAccent,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetSelectorSection: {
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  presetSelectorTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  presetsList: {
    gap: 8,
    paddingHorizontal: 4,
  },
  presetChip: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderAccent,
  },
  presetChipName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  presetChipNameActive: {
    color: colors.textDark,
    fontWeight: '800',
  },
  presetChipTag: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '500',
  },
  presetChipTagActive: {
    color: colors.textDark,
    fontWeight: '600',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  rankPill: {
    backgroundColor: colors.surfaceAccentSubtle,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
  },
  rankText: {
    color: colors.textAccent,
    fontSize: 12,
    fontWeight: '700',
  },
  walletCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    padding: spacing.s3,
    marginBottom: 16,
    shadowColor: '#00E5B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  walletLabel: {
    color: colors.textAccent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  walletBalance: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  xpText: {
    color: colors.textSecondary,
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
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 14,
    alignItems: 'center',
  },
  gridVal: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  gridLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  switchRoleCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAccentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchIcon: {
    fontSize: 20,
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchSub: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  switchArrow: {
    color: colors.surfaceRaised,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s3,
    marginBottom: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  merchantName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  couponCost: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '800',
  },
  couponOffer: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
  },
  redeemBtn: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  redeemBtnDisabled: {
    backgroundColor: colors.surfaceSubtle,
  },
  redeemBtnText: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  redeemBtnTextDisabled: {
    color: colors.textTertiary,
  },
  voucherCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.s4,
    marginBottom: 12,
    alignItems: 'center',
  },
  voucherMerchant: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderAccentSubtle,
    marginBottom: 8,
  },
  voucherCode: {
    color: '#0D9488',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  voucherHint: {
    color: colors.textTertiary,
    fontSize: 11,
  },
});
