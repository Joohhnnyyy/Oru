import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RedemptionModal } from '../coupons/RedemptionModal';
import type { WalletResponse, UserCoupon, LedgerItem } from '@saafsafari/shared';
import {
  Wallet,
  Coins,
  Award,
  Sparkles,
  TrendingUp,
  History,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';

const TIER_ICONS: Record<string, string> = {
  beej: '🌱',
  ankur: '🌿',
  paudha: '🪴',
  vriksh: '🌳',
  van_rakshak: '🛡️',
};

export const WalletView: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<UserCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWallet();
      setWallet(res);
    } catch (err: any) {
      console.error('Failed to fetch wallet:', err);
      setError('Could not fetch wallet details from live API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const balanceGC = wallet?.balanceGC ?? user?.balanceGC ?? 0;
  const lifetimeXP = wallet?.lifetimeXP ?? user?.lifetimeXP ?? 0;
  const currentTier = wallet?.tier?.currentTier;
  const progressPercent = wallet?.tier?.progressPercent ?? 65;
  const transactions: LedgerItem[] = wallet?.recentTransactions || [];
  const activeCoupons: UserCoupon[] = wallet?.activeCoupons || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Section */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Green Credit Wallet</h1>
            <p className="text-xs text-slate-400">Track your eco-credits, tier progression, and active vouchers.</p>
          </div>
        </div>

        <button
          onClick={fetchWallet}
          className="text-slate-400 hover:text-white p-2.5 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 transition-all"
          title="Refresh wallet"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main Balance Card */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/40 to-slate-950/40 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  Available Green Credits
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  Live Ledger Verified
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
                  {balanceGC.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-emerald-400 font-display">GC</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Equivalent to ~₹{(balanceGC * 0.5).toFixed(0)} in sustainable merchant discounts.
              </p>
            </div>

            {/* Tier evolution progress */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>{TIER_ICONS[currentTier?.key || 'beej'] || '🌱'}</span>
                  <span className="text-white font-bold">{currentTier?.titleEn || 'Beej (Seed)'}</span>
                  <span className="text-slate-500 font-hindi">({currentTier?.titleHi || 'बीज'})</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">{progressPercent}% to next rank</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700 shadow-glow"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime XP & Badges Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <Award className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider font-bold">Lifetime Experience</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black font-display text-white">
                {lifetimeXP.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-indigo-400">XP</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Earned from source scans, community audits, and daily habits.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-3">
              Civic Evolution Tiers
            </span>
            <div className="flex items-center justify-between text-xs">
              <span title="Beej">🌱</span>
              <span className="text-slate-600">→</span>
              <span title="Ankur">🌿</span>
              <span className="text-slate-600">→</span>
              <span title="Paudha">🪴</span>
              <span className="text-slate-600">→</span>
              <span title="Vriksh">🌳</span>
              <span className="text-slate-600">→</span>
              <span title="Van Rakshak">🛡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Vouchers Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Active Vouchers</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              {activeCoupons.length}
            </span>
          </div>
        </div>

        {activeCoupons.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center">
            <Tag className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No active redeemed vouchers</p>
            <p className="text-xs text-slate-500 mt-1">
              Visit the Rewards store to redeem your Green Credits for merchant discounts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeCoupons.map((coupon) => (
              <div
                key={coupon.redemptionId}
                className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-emerald-400">{coupon.merchantId}</span>
                    <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                      {coupon.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{coupon.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{coupon.discountText}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {coupon.redemptionCode.slice(0, 10)}...
                  </span>
                  <button
                    onClick={() => setSelectedVoucher(coupon)}
                    className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Ledger Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-white">Credit Ledger History</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Immutable Double-Entry Audited</span>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No recorded transactions yet. Complete habits or scan waste bins to begin!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => {
                const isEarn = tx.creditsEarned > 0;
                const date = new Date(tx.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isEarn
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isEarn ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white capitalize">
                          {tx.actionType.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{date}</span>
                          {tx.territoryId && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">{tx.territoryId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {tx.xpEarned > 0 && (
                        <span className="text-xs font-mono text-indigo-400 hidden sm:inline">
                          +{tx.xpEarned} XP
                        </span>
                      )}
                      <span
                        className={`font-mono font-bold text-sm ${
                          isEarn ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {isEarn ? `+${tx.creditsEarned}` : tx.creditsEarned} GC
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR Voucher Modal */}
      <RedemptionModal coupon={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
    </div>
  );
};
