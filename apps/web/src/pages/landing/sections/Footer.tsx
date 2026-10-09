import { useTranslation } from 'react-i18next';
import { env } from '../../../config/env';
import { Container } from './shared';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t-2 border-line/15 bg-bg py-12">
      <Container>
        <p className="flex items-start gap-3 rounded-card border-2 border-line bg-energy p-4 text-lg font-bold text-on-accent">
          <svg viewBox="0 0 24 24" width={24} height={24} className="mt-0.5 shrink-0" aria-hidden="true" focusable="false">
            <path d="M12 3 3 7v5c0 5 4 8 9 9 5-1 9-4 9-9V7Z" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
            <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('footer.safety')}
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="font-extrabold">{t('footer.privacyTitle')}</h2>
            <p className="mt-1 text-muted">{t('footer.privacy')}</p>
          </div>
          <div>
            <h2 className="font-extrabold">{t('footer.a11yTitle')}</h2>
            <p className="mt-1 text-muted">{t('footer.a11y')}</p>
          </div>
          <div>
            <h2 className="font-extrabold">{t('footer.sourceTitle')}</h2>
            <a href={env.VITE_SOURCE_URL} className="mt-1 inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4" rel="noopener">
              {t('footer.source')}
            </a>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line/15 pt-6 text-sm text-muted">
          <p>
            {t('footer.languages')} <span lang="en">English</span>, <span lang="hi">हिन्दी</span>
          </p>
          <p>{t('footer.made')}</p>
        </div>
      </Container>
    </footer>
  );
}
