import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useMatches, useOutlet, useParams } from 'react-router-dom';
import { ScrollProgress } from '../components/ScrollFx';
import { TRUCK } from '../content/media';
import { scrollToTopNow, useSmoothScroll } from '../hooks/useSmoothScroll';
import { Footer } from '../pages/landing/sections/Footer';
import { Loader } from '../pages/landing/sections/Loader';
import { StickyHeader } from '../pages/landing/sections/StickyHeader';
import { documentTitle, type RouteHandle } from './title';
import { AccountHeader } from '../components/AccountPage';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Link } from 'react-router-dom';
import { initStringTune } from '../lib/stringtune';

/** Keeps the browser tab title in step with the page and language. */
function useDocumentTitle() {
  const { t, i18n } = useTranslation();
  const matches = useMatches();
  const params = useParams();
  const { pathname } = useLocation();
  const handle = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title)?.handle as RouteHandle | undefined;
  useEffect(() => {
    document.title = documentTitle(t, handle, params, pathname === '/');
  }, [t, i18n.language, handle, params, pathname]);
}

/**
 * Page-change curtain: a soft panel with the little truck sweeps up and off the screen,
 * revealing the new page. Not shown on the first load (the intro loader covers that).
 */
function RouteCurtain() {
  const { pathname } = useLocation();
  const [firstPath] = useState(pathname);
  if (pathname === firstPath) return null;
  return (
    <motion.div
      key={pathname}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] grid place-items-center bg-surface"
      initial={{ y: '0%' }}
      animate={{ y: '-100%' }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.img
        src={TRUCK.side}
        alt=""
        width={180}
        height={85}
        className="w-40"
        initial={{ x: '-40vw' }}
        animate={{ x: '40vw' }}
        transition={{ duration: 0.85, ease: [0.5, 0, 0.3, 1] }}
      />
    </motion.div>
  );
}

/** Shared frame for every page: loader, header, animated page swap, footer, scroll road. */
export function RootLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const world = pathname === '/home' || pathname === '/signin' || pathname === '/verify' || pathname.startsWith('/onboarding');
  const account = world || /^\/(tasks|scan|proof|wallet|coupons|rewards|leaderboard|community|profile|collector|console|map|t|account|assistant|energy|verify|error|offline|session-expired|accessibility)(\/|$)/.test(pathname);
  useSmoothScroll();
  useDocumentTitle();
  useEffect(() => { document.documentElement.classList.toggle('oru-no-motion', reduced); }, [reduced]);
  useEffect(() => {
    initStringTune();
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, reduced]);

  // New page: start at the top (in-page anchors are handled by useSmoothScroll).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) scrollToTopNow();
    lastPath.current = pathname;
  }, [pathname]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className={account ? 'account-layout' : 'public-layout'}>
      {!reduced && <div aria-hidden="true" className="string-top-bar" {...{ string: 'progress', 'string-id': 'global-top-bar' }} />}
      {!account && <Loader />}
      <a href="#main" className="sr-only-focusable fixed top-2 left-2 z-[70] rounded-full bg-ink px-5 py-3 font-bold text-white">
        {t('a11y.skip')}
      </a>
      {!world && (account ? <AccountHeader /> : <StickyHeader />)}
      <main id="main" tabIndex={-1} className="outline-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduced ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      {!account && <Footer />}
      {account && !world && <footer className="account-footer"><strong>Small acts. Shared progress.</strong><Link to="/privacy">Privacy</Link><Link to="/faq">Help</Link><Link to="/terms">Terms</Link></footer>}
      {!account && !reduced && <ScrollProgress />}
      {!account && !reduced && <RouteCurtain />}
      </div>
    </MotionConfig>
  );
}
