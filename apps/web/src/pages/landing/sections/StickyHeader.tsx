import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../../content/media';
import { LangSwitch, NAV, PlayLink } from './shared';

/** White bar that slides in once the hero has scrolled away. */
export function StickyHeader({ active }: { active: string | null }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!(entry?.isIntersecting ?? true)), {
      rootMargin: '-72px 0px 0px 0px',
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

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
            <a href="#top" aria-label={t('a11y.home')} className="shrink-0 rounded-xl">
              <img src={BRAND.icon} alt="" width={44} height={44} className="size-11 rounded-xl" />
            </a>
            <nav aria-label={t('nav.label')} className="mx-auto hidden lg:block">
              <ul className="flex gap-1">
                {NAV.map((n) => {
                  const current = active === n.href.slice(1);
                  return (
                    <li key={n.key}>
                      <a
                        href={n.href}
                        aria-current={current ? 'true' : undefined}
                        className={`flex min-h-11 items-center rounded-full px-4 font-display text-[1.0625rem] font-bold no-underline transition-colors ${
                          current ? 'bg-surface text-ink' : 'text-ink/80 hover:text-ink'
                        }`}
                      >
                        {t(`nav.${n.key}`)}
                      </a>
                    </li>
                  );
                })}
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
                  <a href={n.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl px-3 font-display text-lg font-bold text-ink no-underline hover:bg-surface">
                    {t(`nav.${n.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </motion.header>
      )}
    </AnimatePresence>
  );
}
