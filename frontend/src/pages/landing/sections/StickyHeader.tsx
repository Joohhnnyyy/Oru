import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { RollText } from '../../../components/TextFx';
import { BRAND } from '../../../content/media';
import { LangSwitch, NAV, PlayLink } from './shared';

/**
 * White bar with the menu. On the home page it slides in once the hero has scrolled away;
 * on every other page it is always there. The current page's link is highlighted.
 */
export function StickyHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = !isHome || pastHero;

  useEffect(() => {
    const hero = isHome ? document.getElementById('top') : null;
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setPastHero(!(entry?.isIntersecting ?? true)), {
      rootMargin: '-72px 0px 0px 0px',
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur"
        >
          <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center gap-4 px-4 sm:px-6">
            <Link to="/" aria-label={t('a11y.home')} className="shrink-0 rounded-xl">
              <img src={BRAND.icon} alt="" width={44} height={44} className="size-11 rounded-xl transition-transform duration-300 hover:-rotate-6" />
            </Link>
            <nav aria-label={t('nav.label')} className="mx-auto hidden lg:block">
              <ul className="flex gap-1">
                {NAV.map((n) => (
                  <li key={n.key}>
                    <NavLink
                      to={n.to}
                      className={({ isActive }) =>
                        `roll-host flex min-h-11 items-center rounded-full px-4 font-display text-[1.0625rem] font-bold no-underline transition-colors ${
                          isActive ? 'bg-surface text-ink' : 'text-ink/75 hover:text-ink'
                        }`
                      }
                    >
                      <RollText text={t(`nav.${n.key}`)} />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <LangSwitch className="!shadow-none ring-1 ring-line" />
              <PlayLink className="hidden sm:inline-flex" />
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="sticky-menu"
                aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
                onClick={() => setMenuOpen((o) => !o)}
                className="grid size-11 place-items-center rounded-full ring-1 ring-line lg:hidden"
              >
                <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
                  <path d={menuOpen ? 'm6 6 12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <ul id="sticky-menu" className="border-t border-line px-4 py-2 lg:hidden">
              {NAV.map((n) => (
                <li key={n.key}>
                  <NavLink
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-3 font-display text-lg font-bold text-ink no-underline hover:bg-surface aria-[current=page]:bg-surface"
                  >
                    {t(`nav.${n.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </motion.header>
      )}
    </AnimatePresence>
  );
}
