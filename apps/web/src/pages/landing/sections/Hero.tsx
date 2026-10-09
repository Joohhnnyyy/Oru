import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND, HIGHLIGHTS, SCENE } from '../../../content/media';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { ArrowIcon, Container, InstallButton, LangSwitch, MediaSlot, NAV, PlayLink } from './shared';

const SLIDE_MS = 6000;

function Highlights() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(true);
  const count = HIGHLIGHTS.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (paused || reduced || !open) return;
    const id = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, reduced, open, go]);

  const item = HIGHLIGHTS[index] ?? HIGHLIGHTS[0];
  if (!item) return null;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-quiet pointer-events-auto shadow-lift">
        {t('news.reopen')}
      </button>
    );
  }

  return (
    <aside aria-label={t('news.label')} className="pointer-events-auto relative w-[300px] rounded-[24px] bg-white p-3 shadow-lift">
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={t('news.close')}
        className="absolute -top-3 -left-3 grid size-9 place-items-center rounded-full bg-ink/70 text-white"
      >
        <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" focusable="false">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={item.id}
          href={item.href}
          className="block rounded-[18px] text-ink no-underline"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <div className="aspect-[16/10] overflow-hidden rounded-[16px]">
            <MediaSlot media={item.media} alt={t(`news.${item.id}.title`)} width={276} height={172} />
          </div>
          <p className="mt-3 px-1 text-sm font-semibold text-primary">{t(`news.${item.id}.tag`)}</p>
          <p className="px-1 font-display text-xl leading-tight font-bold">{t(`news.${item.id}.title`)}</p>
        </motion.a>
      </AnimatePresence>
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {HIGHLIGHTS.map((h, i) => (
            <span key={h.id} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-10 bg-ink' : 'w-1.5 bg-line'}`} />
          ))}
        </div>
        <div className="flex items-center rounded-full bg-surface">
          <button type="button" onClick={() => go(-1)} aria-label={t('news.prev')} className="grid size-10 place-items-center rounded-full">
            <span className="rotate-180">
              <ArrowIcon size={18} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? t('news.play') : t('news.pause')}
            aria-pressed={paused}
            className="grid size-10 place-items-center rounded-full"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" focusable="false">
              {paused ? <path d="M8 5v14l11-7Z" fill="currentColor" /> : <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />}
            </svg>
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t('news.next')} className="grid size-10 place-items-center rounded-full">
            <ArrowIcon size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll: the plaza slowly zooms and sinks as you leave the hero.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const sink = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer: gentle parallax so the isometric scene feels three-dimensional.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const onMove = (e: PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * -24);
    py.set(((e.clientY - r.top) / r.height - 0.5) * -16);
  };
  const y = useTransform([sink, sy], ([a, b]: number[]) => (a ?? 0) + (b ?? 0));

  return (
    <section id="top" ref={ref} onPointerMove={onMove} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-band">
      <motion.img
        src={SCENE.plaza}
        srcSet={`${SCENE.plazaSmall} 960w, ${SCENE.plaza} 1770w`}
        sizes="100vw"
        alt={t('hero.scene')}
        width={1770}
        height={889}
        fetchPriority="high"
        style={{ scale, x: sx, y }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-scrim pointer-events-none absolute inset-0" />

      <motion.div style={{ opacity: fade }} className="relative z-10 flex h-full flex-col">
        <Container className="flex items-start justify-between gap-6 pt-5 sm:pt-7">
          <div>
            <a href="#top" className="inline-block rounded-[22px] bg-white/95 px-4 py-2 shadow-lift" aria-label={t('a11y.home')}>
              <img src={BRAND.wordmark} alt="Oru" width={120} height={72} className="h-12 w-auto sm:h-16" />
            </a>
            <nav aria-label={t('nav.label')} className="mt-5 hidden lg:block">
              <ul className="flex flex-wrap gap-x-7 gap-y-2">
                {NAV.map((n) => (
                  <li key={n.key}>
                    <a href={n.href} className="text-shadow-soft font-display text-xl font-bold text-white no-underline hover:underline hover:underline-offset-8">
                      {t(`nav.${n.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="hero-menu"
              aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-soft lg:hidden"
            >
              <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
                <path d={menuOpen ? 'm6 6 12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </Container>
        {menuOpen && (
          <Container className="lg:hidden">
            <ul id="hero-menu" className="mt-3 rounded-[22px] bg-white p-2 shadow-lift">
              {NAV.map((n) => (
                <li key={n.key}>
                  <a href={n.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center rounded-xl px-4 font-display text-lg font-bold text-ink no-underline hover:bg-surface">
                    {t(`nav.${n.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        )}

        <Container className="mt-auto flex items-end justify-between gap-8 pb-24 sm:pb-28">
          <div className="max-w-[40rem]">
            <motion.h1
              id="hero-title"
              className="text-shadow-soft text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-extrabold text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className="block">{t('hero.line1')}</span> <span className="block">{t('hero.line2')}</span>
            </motion.h1>
            <motion.p
              className="text-shadow-soft mt-4 max-w-[34rem] text-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              {t('hero.lead')}
            </motion.p>
            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <PlayLink className="!bg-white !text-ink" />
              <InstallButton />
            </motion.div>
          </div>
          <div className="pointer-events-none hidden lg:block">
            <Highlights />
          </div>
        </Container>
      </motion.div>

      <a
        href="#mission"
        className="absolute bottom-0 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-t-2xl bg-ink px-5 py-2.5 text-sm font-semibold text-white no-underline"
      >
        <span className="bob inline-block">
          <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" focusable="false">
            <path d="M12 4v15m0 0-5-5m5 5 5-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {t('hero.scroll')}
      </a>
    </section>
  );
}
