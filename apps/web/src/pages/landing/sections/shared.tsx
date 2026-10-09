import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../config/env';
import { useInstallPrompt } from '../../../hooks/useInstallPrompt';
import { useInViewOnce } from '../../../hooks/useInView';
import { CHAPTERS, type ChapterKey } from '../chapters';
import { Stamp } from '../svg/Icons';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** Fades and slides its content in the first time it scrolls into view. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function ChapterHeading({ chapter, id, lead }: { chapter: ChapterKey; id: string; lead?: string }) {
  const { t } = useTranslation();
  const n = CHAPTERS.findIndex((c) => c.key === chapter) + 1;
  return (
    <div className="mb-8 flex items-start gap-4 sm:mb-10 sm:gap-6">
      <Stamp n={n} />
      <div className="max-w-[44rem]">
        <p className="text-sm font-semibold text-muted">
          {t('chapter.word')} {n}: {t(`chapter.${chapter}.sub`)}
        </p>
        <h2 id={id} className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{t(`chapter.${chapter}.title`)}</h2>
        {lead && <p className="mt-3 text-lg text-muted">{lead}</p>}
      </div>
    </div>
  );
}

export function PlayLink({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <a href={env.VITE_PLAY_URL} className={`btn btn-play ${className}`}>
      {t('cta.play')}
    </a>
  );
}

/** Rendered only where the browser offers installation (beforeinstallprompt). */
export function InstallButton({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const { canInstall, install } = useInstallPrompt();
  return (
    <button type="button" className={`btn btn-quiet ${className}`} hidden={!canInstall} onClick={() => void install()}>
      <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
        <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t('cta.install')}
    </button>
  );
}
