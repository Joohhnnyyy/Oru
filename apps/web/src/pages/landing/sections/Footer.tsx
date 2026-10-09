import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../config/env';
import { BRAND, CHARACTER, SCENE } from '../../../content/media';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Container, InstallButton, LangSwitch, PlayLink } from './shared';

/** Full-bleed closing art with the final call to action. */
function Closing() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <img src={SCENE.plaza} alt="" width={1770} height={889} loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_70%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/85 to-white/10" />
      <Container className="grid items-center gap-8 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
        <div>
          <h2 id="closing-title" className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-extrabold">
            {t('next.finalTitle')}
          </h2>
          <p className="mt-3 max-w-[30rem] text-lg text-muted">{t('next.finalBody')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PlayLink />
            <InstallButton />
          </div>
        </div>
        <motion.img
          src={CHARACTER.buddy}
          alt={t('buddy.name')}
          width={401}
          height={403}
          loading="lazy"
          className="mx-auto w-48 drop-shadow-[0_24px_24px_rgba(29,35,48,0.25)] md:w-64"
          initial={{ opacity: 0, y: 60, rotate: -6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        />
      </Container>
    </section>
  );
}

/** Big-logo footer: slim top bar, the wordmark filling the width, and a quiet bottom row. */
function BigLogo() {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 90, damping: 16 });
  const rotateY = useSpring(ry, { stiffness: 90, damping: 16 });
  const onMove = (e: PointerEvent) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -8);
  };
  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      style={{ perspective: 1200 }}
      className="bg-surface py-6 sm:py-10"
    >
      <motion.img
        src={BRAND.wordmarkLarge}
        alt="Oru"
        width={1060}
        height={644}
        loading="lazy"
        decoding="async"
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, y: 80, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 70, damping: 14 }}
        className="mx-auto block h-auto w-full max-w-[760px] mix-blend-multiply select-none"
        draggable={false}
      />
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <Closing />
      <footer className="overflow-hidden bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-4 pt-8">
          <div className="flex items-center">
            <a href="#top" aria-label={t('a11y.home')} className="rounded-lg">
              <img src={BRAND.wordmark} alt="" width={120} height={71} loading="lazy" className="h-11 w-auto" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch className="!shadow-none ring-1 ring-line" />
            <PlayLink />
          </div>
        </Container>

        <Container>
          <BigLogo />
        </Container>

        <Container>
          <p className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-center font-semibold">
            <svg viewBox="0 0 24 24" width={20} height={20} className="shrink-0" aria-hidden="true" focusable="false">
              <path d="M12 3 3 7v5c0 5 4 8 9 9 5-1 9-4 9-9V7Z" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" />
              <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('footer.safety')}
          </p>
          <div className="mt-8 grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <h2 className="font-display text-base font-bold">{t('footer.privacyTitle')}</h2>
              <p className="mt-1 text-muted">{t('footer.privacy')}</p>
            </div>
            <div>
              <h2 className="font-display text-base font-bold">{t('footer.a11yTitle')}</h2>
              <p className="mt-1 text-muted">{t('footer.a11y')}</p>
            </div>
            <div>
              <h2 className="font-display text-base font-bold">{t('footer.sourceTitle')}</h2>
              <a href={env.VITE_SOURCE_URL} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4" rel="noopener">
                {t('footer.source')}
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 text-muted">
            <p>{t('footer.rights')}</p>
            <p>
              {t('footer.languages')} <span lang="en">English</span>, <span lang="hi">हिन्दी</span>
            </p>
          </div>
        </Container>
      </footer>
    </>
  );
}
