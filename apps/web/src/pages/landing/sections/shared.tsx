import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../config/env';
import type { MediaSlot as MediaSlotData } from '../../../content/media';
import { useInstallPrompt } from '../../../hooks/useInstallPrompt';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { setLanguage } from '../../../i18n';

export const NAV = [
  { href: '#day-1', key: 'how' },
  { href: '#guardians', key: 'guardians' },
  { href: '#growth', key: 'grow' },
  { href: '#places', key: 'places' },
  { href: '#impact', key: 'impact' },
] as const;

export const NAV_IDS: readonly string[] = NAV.map((n) => n.href.slice(1));

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

export function ArrowIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

export function LangSwitch({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'hi' ? 'en' : 'hi';
  return (
    <button
      type="button"
      onClick={() => void setLanguage(next)}
      aria-label={t('a11y.switchLang')}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold text-ink shadow-soft ${className}`}
    >
      <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" focusable="false">
        <circle cx={12} cy={12} r={9} fill="none" stroke="currentColor" strokeWidth={1.8} />
        <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" fill="none" stroke="currentColor" strokeWidth={1.8} />
      </svg>
      <span lang={next}>{t('a11y.langName')}</span>
    </button>
  );
}

/**
 * An image-or-video slot. With `media.video` set it plays a muted loop while on screen
 * (paused for reduced motion); without it, the poster shows with a "Video coming soon" tag.
 * Paths live in src/content/media.ts.
 */
export function MediaSlot({
  media,
  alt,
  className = '',
  width,
  height,
}: {
  media: MediaSlotData;
  alt: string;
  className?: string;
  width: number;
  height: number;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void el.play().catch(() => undefined);
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  if (media.video) {
    return (
      <video
        ref={ref}
        className={`h-full w-full object-cover ${className}`}
        src={media.video}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={t('video.label', { title: alt })}
        width={width}
        height={height}
      />
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <img src={media.poster} alt={alt} loading="lazy" decoding="async" width={width} height={height} className="h-full w-full object-cover" />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink">
        <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" focusable="false">
          <path d="M8 5v14l11-7Z" fill="currentColor" />
        </svg>
        {t('video.soon')}
      </span>
    </div>
  );
}
