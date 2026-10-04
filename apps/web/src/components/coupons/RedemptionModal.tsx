import React, { useState } from 'react';
import type { UserCoupon } from '@saafsafari/shared';
import { QRCodeSVG } from 'qrcode.react';
import { X, Check, Copy, Sparkles, Store, Clock, AlertTriangle } from 'lucide-react';

interface RedemptionModalProps {
  coupon: UserCoupon | null;
  onClose: () => void;
}

export const RedemptionModal: React.FC<RedemptionModalProps> = ({ coupon, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!coupon) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.redemptionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedExpires = new Date(coupon.expiresAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close redemption modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
            Voucher Confirmed
          </span>
          <h2 className="text-xl font-bold font-display text-white mt-1">{coupon.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{coupon.discountText}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center mx-auto w-fit shadow-glow mb-6">
          <QRCodeSVG
            value={coupon.redemptionCode}
            size={180}
            level="H"
            includeMargin={false}
          />
          <span className="text-[10px] text-slate-600 font-mono mt-2 uppercase tracking-widest">
            Scan at Store Counter
          </span>
        </div>

        {/* Alphanumeric Code */}
        <div className="mb-6">
          <span className="text-xs text-slate-400 block mb-1.5 text-center font-medium">
            Redemption Voucher Code
          </span>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-xl p-2.5 px-4">
            <span className="font-mono text-base font-bold text-emerald-400 tracking-wider flex-1 text-center select-all">
              {coupon.redemptionCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
              title="Copy voucher code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">Merchant</span>
              <span className="text-slate-200 font-medium truncate block max-w-[120px]">
                {coupon.merchantId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">Expires</span>
              <span className="text-slate-200 font-medium">{formattedExpires}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 mb-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Show this digital voucher code to the cashier at checkout. Active for 1-time redemption.</span>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all"
        >
          Save to My Wallet
        </button>
      </div>
    </div>
  );
};
