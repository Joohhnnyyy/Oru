import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { env } from '../../../config/env';
import { BRAND, CHARACTER, SCENE } from '../../../content/media';
import { Container, InstallButton, NAV, PlayLink } from './shared';

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

export function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <Closing />
      <footer className="bg-white pt-14 pb-10">
        <Container>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <img src={BRAND.wordmark} alt="Oru" width={150} height={89} loading="lazy" className="h-20 w-auto" />
            <nav aria-label={t('footer.nav')}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {NAV.map((n) => (
                  <li key={n.key}>
                    <a href={n.href} className="inline-flex min-h-11 items-center font-display text-lg font-bold text-ink no-underline hover:underline">
                      {t(`nav.${n.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="mt-10 flex items-start gap-3 rounded-card bg-butter/60 p-5 text-lg font-semibold">
            <svg viewBox="0 0 24 24" width={24} height={24} className="mt-0.5 shrink-0" aria-hidden="true" focusable="false">
              <path d="M12 3 3 7v5c0 5 4 8 9 9 5-1 9-4 9-9V7Z" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" />
              <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('footer.safety')}
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <h2 className="font-display text-lg font-bold">{t('footer.privacyTitle')}</h2>
              <p className="mt-1 text-muted">{t('footer.privacy')}</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">{t('footer.a11yTitle')}</h2>
              <p className="mt-1 text-muted">{t('footer.a11y')}</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">{t('footer.sourceTitle')}</h2>
              <a href={env.VITE_SOURCE_URL} className="mt-1 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4" rel="noopener">
                {t('footer.source')}
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted">
            <p>
              {t('footer.languages')} <span lang="en">English</span>, <span lang="hi">हिन्दी</span>
            </p>
            <p>{t('footer.rights')}</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
