import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND, TRUCK } from '../../../content/media';
import { prefersReducedMotion } from '../../../hooks/useReducedMotion';
import { setScrollLocked } from '../../../hooks/useSmoothScroll';

/** Matches the CSS timeline in index.css (truck in, road fills, truck out). */
const LOADER_MS = 2600;

/**
 * Intro: the recycling truck drives across a filling rainbow road, then the page fades in.
 * The animation is pure CSS (it also clears itself without JS); JS only locks scrolling
 * meanwhile. Reduced-motion visitors skip it entirely.
 */
export function Loader() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const id = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(id);
    }
    setScrollLocked(true);
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => {
      setDone(true);
      setScrollLocked(false);
    }, LOADER_MS);
    return () => {
      window.clearTimeout(id);
      setScrollLocked(false);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={done}
      className={`intro-loader fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-white ${done ? 'is-done pointer-events-none' : ''}`}
    >
      <span className="sr-only">{t('loader.label')}</span>
      <div className="flex w-full flex-col items-center gap-8" aria-hidden="true">
        <img src={BRAND.wordmark} alt="" width={150} height={89} className="h-auto w-32 sm:w-40" />
        <div className="relative w-[min(560px,86vw)]">
          <div className="loader-truck relative mx-auto w-[min(240px,52vw)]">
            <span className="loader-puff absolute bottom-6 -left-2 size-4 rounded-full bg-line" />
            <span className="loader-puff absolute bottom-8 -left-1 size-3 rounded-full bg-line [animation-delay:0.35s]" />
            <img src={TRUCK.side} alt="" width={523} height={247} className="loader-bump relative h-auto w-full" />
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="loader-road-fill rainbow h-full w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
