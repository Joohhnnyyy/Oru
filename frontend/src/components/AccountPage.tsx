import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND, characterForHealth, type CharacterId } from '../content/media';
import { MotionToggle } from './WorldScene';

export const ACCOUNT_LINKS = [
  ['/home', 'My world'], ['/map', 'Explore'], ['/tasks', 'Actions'], ['/scan', 'Scan'], ['/wallet', 'Wallet'], ['/coupons', 'Rewards'],
  ['/leaderboard', 'Leaderboard'], ['/community', 'Community'], ['/proof', 'Photo proof'], ['/profile', 'Profile'],
] as const;

export function AccountNavigation() {
  const { groups } = useAuth();
  const { pathname } = useLocation();
  const links: (readonly [string, string])[] = pathname.startsWith('/console') ? [
    ['/console', 'Overview'], ['/console/territories', 'Territories'], ['/console/review', 'Review queue'], ['/console/qr-sources', 'QR sources'], ['/console/hotspots', 'Hotspots'], ['/console/reports', 'Ward reports'], ['/console/merchants', 'Merchants'],
  ] : [...ACCOUNT_LINKS];
  if (groups.includes('collector')) links.push(['/collector', 'Collector']);
  if (groups.includes('ward_admin') && !pathname.startsWith('/console')) links.push(['/console', 'Console']);
  return <nav aria-label="Your account" className="account-navigation">{links.map(([to, label]) => (
    <NavLink key={to} to={to} end>{label}</NavLink>
  ))}</nav>;
}

export function AccountHeader() {
  return <header className="account-header"><Link to="/" aria-label="Oru website"><img src={BRAND.wordmarkLarge} alt="Oru" width={80} height={48} /></Link><nav aria-label="Main account navigation"><NavLink to="/home">My world</NavLink><NavLink to="/community">Community</NavLink><NavLink to="/coupons">Rewards</NavLink></nav><MotionToggle /><Link className="btn btn-play" to="/profile" {...{ string: 'magnetic' }}>My account</Link></header>;
}

export function AccountPage({ title, intro, children, character, health }: { title: string; intro: string; children: ReactNode; character?: CharacterId; health?: number }) {
  const { pathname } = useLocation();
  const art = character ?? (pathname.includes('reward') || pathname.includes('coupon') || pathname.includes('wallet') ? 'turtle' : pathname.includes('proof') || pathname.includes('task') ? 'buddy' : pathname.includes('profile') ? 'sparrow' : 'dolphin');
  return <section className="account-page" {...{ string: 'progress' }}><div className="account-page-grid"><AccountNavigation /><div className="account-content">
    <header className="account-heading"><div><p className="mb-3 text-sm font-bold text-primary">{pathname.startsWith('/console') ? 'ORU · YOUR WARD' : 'YOUR LITTLE WORLD'}</p><h1>{title}</h1><p>{intro}</p></div><img src={characterForHealth(art, health)} alt="" width={220} height={220} {...{ string: 'parallax', 'string-parallax': '0.06' }} /></header>
    {children}
  </div></div></section>;
}

export function Feedback({ error, message }: { error?: string | null; message?: string | null }) {
  return <>{error && <p role="alert" className="my-4 rounded-chip border border-coral bg-coral/10 p-4 text-ink">{error}</p>}
    {message && <p role="status" className="my-4 rounded-chip bg-mint/20 p-4 text-ink">{message}</p>}</>;
}

export const inputClass = 'mt-2 block min-h-11 w-full rounded-chip border border-line bg-bg px-4 py-3 focus-visible:outline-primary';
export const cardClass = 'oru-card';
