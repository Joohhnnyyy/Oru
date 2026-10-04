import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RedemptionModal } from './RedemptionModal';
import type { Coupon, UserCoupon } from '@saafsafari/shared';
import { ShoppingBag, Coins, Sparkles, Filter, Store, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Rewards' },
  { id: 'food_beverage', label: 'Food & Beverage' },
  { id: 'groceries', label: 'Organic Groceries' },
  { id: 'fashion', label: 'Eco Fashion' },
  { id: 'dairy', label: 'Local Dairy' },
];

export const CouponMarketplace: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<UserCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCoupons();
      setCoupons(res.coupons || []);
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
      setError('Failed to load merchant rewards. Using local ecosystem catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleRedeem = async (coupon: Coupon) => {
    try {
      setRedeemingId(coupon.couponId);
      setError(null);
      const res = await api.redeemCoupon(coupon.couponId, coupon.merchantId);
      if (res.success && res.redemption) {
        setActiveVoucher(res.redemption);
        // Refresh auth user so header balance updates
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Redemption failed. Check your Green Credits balance.');
    } finally {
      setRedeemingId(null);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (activeCategory === 'all') return true;
    return (c as any).category === activeCategory || c.merchantId.toLowerCase().includes(activeCategory);
  });

  const userGC = user?.balanceGC ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Eco-Merchant Rewards
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              Exchange your earned Green Credits for exclusive vouchers from 15+ verified sustainable merchants across Delhi NCR.
            </p>
          </div>

          {/* User Credits Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-emerald-500/30 px-5 py-3.5 rounded-2xl shadow-glow">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Available Balance</span>
              <span className="text-2xl font-black font-display text-emerald-400">
                {userGC.toLocaleString()} <span className="text-xs font-normal text-slate-400">GC</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Category Pills & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchCoupons}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Refresh offers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Coupons Grid */}
      {loading && coupons.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-56 animate-pulse bg-slate-800/30" />
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
          <Store className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No vouchers available in this category</h4>
          <p className="text-xs text-slate-400 mt-1">Select another filter or check back tomorrow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const canAfford = userGC >= coupon.costGC;
            const isRedeeming = redeemingId === coupon.couponId;
            const isOutOfStock = coupon.stock <= 0;

            return (
              <div
                key={coupon.couponId}
                className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all hover:-translate-y-1 shadow-xl relative overflow-hidden group"
              >
                {/* Decorative border highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Bar: Merchant + Stock */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      {coupon.merchantId.replace(/-/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOutOfStock
                          ? 'bg-red-500/20 border-red-500/30 text-red-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : `${coupon.stock} Left`}
                    </span>
                  </div>

                  {/* Title & Discount */}
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {coupon.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{coupon.discountText}</p>
                </div>

                {/* Bottom Bar: Cost & Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm">
                    <Coins className="w-4 h-4" />
                    <span>{coupon.costGC} GC</span>
                  </div>

                  <button
                    onClick={() => handleRedeem(coupon)}
                    disabled={!canAfford || isOutOfStock || isRedeeming}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      !canAfford
                        ? 'bg-slate-800 text-slate-400 border border-white/5 cursor-not-allowed'
                        : isOutOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow active:scale-95'
                    }`}
                  >
                    {isRedeeming ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Redeeming...</span>
                      </>
                    ) : !canAfford ? (
                      <span>Need {coupon.costGC - userGC} GC More</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Redeem Voucher</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for QR voucher display */}
      <RedemptionModal coupon={activeVoucher} onClose={() => setActiveVoucher(null)} />
    </div>
  );
};
