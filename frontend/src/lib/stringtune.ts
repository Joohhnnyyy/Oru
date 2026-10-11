import { prefersReducedMotion } from '../hooks/useReducedMotion';
import StringTune, {
  StringProgress,
  StringParallax,
  StringMagnetic,
  StringCursor,
  StringSpotlight,
  StringResponsive,
} from '@fiddle-digital/string-tune';

let stringTuneInstance: StringTune | null = null;
let isStarted = false;

/**
 * Initializes the StringTune scroll and interaction runtime on the client.
 * Registers StringProgress, StringParallax, StringMagnetic, StringCursor,
 * and StringSpotlight.
 */
export function initStringTune(): StringTune | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  if (prefersReducedMotion()) {
    stringTuneInstance?.destroy();
    stringTuneInstance = null; isStarted = false;
    return null;
  }

  if (stringTuneInstance && isStarted) {
    return stringTuneInstance;
  }

  try {
    stringTuneInstance = StringTune.getInstance();

    // Register modules
    stringTuneInstance.use(StringProgress);
    stringTuneInstance.use(StringParallax, { parallax: 0.15 });
    stringTuneInstance.use(StringMagnetic, { strength: 0.35, radius: 100 });
    stringTuneInstance.use(StringCursor, { lerp: 0.25 });
    stringTuneInstance.use(StringSpotlight, { lerp: 0.4 });
    stringTuneInstance.use(StringResponsive);

    // Global settings for smooth scroll-driven calculations
    stringTuneInstance.setupSettings({
      'offset-top': '0%',
      'offset-bottom': '0%',
    });

    stringTuneInstance.start(60);
    isStarted = true;
    return stringTuneInstance;
  } catch (err) {
    console.warn('[StringTune] Runtime init error:', err);
    return null;
  }
}

/**
 * Re-scans the DOM and recalculates geometry when dynamic content or route changes occur.
 */
export function refreshStringTune(): void {
  if (typeof window === 'undefined') return;
  // StringTune listens to resize events to recalibrate bounds and new objects
  window.dispatchEvent(new Event('resize'));
}

/**
 * Hook to trigger re-scanning of the DOM when pages or routes update.
 */
export function useStringTune() {
  if (typeof window === 'undefined') return null;
  const instance = initStringTune();
  refreshStringTune();
  return instance;
}

