import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND, CHARACTER } from '../../../content/media';

const SEEN_KEY = 'oru.intro-seen';

/**
 * Full-screen intro with the buddy bouncing. Pure CSS hides it after ~2.4 s even without JS;
 * on the client it fades as soon as the page has loaded (or instantly on repeat visits).
 * Reduced-motion visitors never see it.
 */
export function Loader() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // storage blocked: just play the intro
    }
    const finish = () => window.setTimeout(() => setDone(true), seen ? 0 : 500);
    if (seen) {
      const id = finish();
      return () => window.clearTimeout(id);
    }
    if (document.readyState === 'complete') {
      const id = finish();
      return () => window.clearTimeout(id);
    }
    window.addEventListener('load', finish, { once: true });
    return () => window.removeEventListener('load', finish);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={done}
      className={`intro-loader fixed inset-0 z-[60] grid place-items-center bg-white ${done ? 'is-done pointer-events-none' : ''}`}
    >
      <span className="sr-only">{t('loader.label')}</span>
      <div className="flex flex-col items-center gap-4" aria-hidden="true">
        <img src={CHARACTER.buddy} alt="" width={140} height={141} className="bob h-auto w-32" />
        <img src={BRAND.wordmark} alt="" width={160} height={95} className="h-auto w-36" />
      </div>
    </div>
  );
}
