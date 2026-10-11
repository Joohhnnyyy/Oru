import { useCallback, useState } from 'react';
import type { Coupon } from '@saafsafari/shared';
import { AccountPage, cardClass, Feedback } from '../../components/AccountPage';
import { ResourceStatus } from '../../components/ResourceStatus';
import { useApiResource, errorMessage } from '../../hooks/useApiResource';
import { api } from '../../lib/api';

export default function Rewards({ view = 'all' }: { view?: 'all' | 'wallet' | 'catalog' }) {
  const load = useCallback(async () => { const [wallet, catalog] = await Promise.all([api.getWallet(), view === 'wallet' ? Promise.resolve({ coupons: [] }) : api.getCoupons()]); return { wallet, coupons: catalog.coupons }; }, [view]);
  const resource = useApiResource(load);
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function redeem() {
    if (!selected || busy) return;
    setBusy(true); setError(null);
    try { const result = await api.redeemCoupon(selected.couponId, selected.merchantId); setMessage(`Reward redeemed. Your code is ${result.redemption.redemptionCode}. Remaining balance: ${result.newBalanceGC} GC.`); setSelected(null); resource.reload(); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  return <AccountPage title={view === 'wallet' ? 'Every little act has a story.' : 'A little thank you, nearby.'} intro="See your Green Credits, earned rewards, and the actions that built your balance.">
    <ResourceStatus {...resource} /><Feedback error={error} message={message} />
    {resource.data && <>
      <div className="mb-10 rounded-card bg-mint/25 p-8" {...{ string: 'spotlight' }}><p className="text-muted">Available Green Credits</p><p className="font-display text-4xl font-extrabold">{resource.data.wallet.balanceGC}</p><p className="mt-3">{resource.data.wallet.tier.currentTier.titleEn} · {resource.data.wallet.lifetimeXP} XP</p></div>
      {selected && <section aria-label="Confirm reward redemption" className="mb-8 rounded-card border border-primary bg-surface p-6"><h2 className="text-xl font-bold">Redeem {selected.title}?</h2><p className="my-4">This will spend {selected.costGC} Green Credits.</p><div className="flex flex-wrap gap-3"><button disabled={busy} type="button" onClick={() => void redeem()} className="btn btn-play" {...{ string: 'magnetic' }}>{busy ? 'Redeeming…' : 'Confirm redemption'}</button><button disabled={busy} type="button" onClick={() => setSelected(null)} className="btn btn-quiet">Cancel</button></div></section>}
      {view !== 'wallet' && <><h2 className="mb-5 font-display text-2xl font-bold">Available rewards</h2>
      {resource.data.coupons.length === 0 && <p className="text-muted">No rewards are available right now.</p>}
      <div className="grid gap-5 md:grid-cols-3">{resource.data.coupons.map((coupon) => <article className={cardClass} key={coupon.couponId} {...{ string: 'spotlight' }}><h3 className="text-xl font-bold">{coupon.title}</h3><p className="my-3 text-muted">{coupon.discountText}</p><p className="mb-4">{coupon.costGC} GC · Expires {new Date(coupon.expiresAt).toLocaleDateString()}</p><button disabled={busy || coupon.costGC > (resource.data?.wallet.balanceGC ?? 0)} className="btn btn-play" type="button" onClick={() => setSelected(coupon)} {...{ string: 'magnetic' }}>Redeem {coupon.title}</button></article>)}</div>
      </>}{view !== 'catalog' && <><h2 className="mt-10 mb-5 font-display text-2xl font-bold">Your redeemed rewards</h2>
      {resource.data.wallet.activeCoupons.length === 0 && <p className="text-muted">Your redeemed rewards will appear here.</p>}
      <div className="grid gap-5 md:grid-cols-2">{resource.data.wallet.activeCoupons.map((coupon) => <article key={coupon.redemptionId} className={cardClass}><h3 className="font-bold">{coupon.title}</h3><p>{coupon.discountText}</p><p className="my-3 font-mono text-lg">{coupon.redemptionCode}</p><p className="text-sm text-muted">{coupon.status} · Expires {new Date(coupon.expiresAt).toLocaleDateString()}</p></article>)}</div>
      <h2 className="mt-10 mb-5 font-display text-2xl font-bold">Recent activity</h2>
      {resource.data.wallet.recentTransactions.length === 0 && <p className="text-muted">Your first action will start your activity history.</p>}
      <ul className="divide-y divide-line">{resource.data.wallet.recentTransactions.map((entry) => <li key={entry.id} className="flex flex-wrap justify-between gap-3 py-4"><div><p className="font-bold">{entry.actionType.replaceAll('_', ' ')}</p><p className="text-sm text-muted">{new Date(entry.timestamp).toLocaleString()}</p></div><p>{entry.creditsEarned > 0 ? '+' : ''}{entry.creditsEarned} GC · {entry.xpEarned} XP</p></li>)}</ul></>}
    </>}
  </AccountPage>;
}
