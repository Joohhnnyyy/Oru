import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

/** Pixels to stop above an anchor target, so the sticky header doesn't cover it. */
const HEADER_OFFSET = 88;

let instance: Lenis | null = null;

/** Pause or resume smooth scrolling (used while the intro loader is up). */
export function setScrollLocked(locked: boolean) {
  document.documentElement.classList.toggle('scroll-locked', locked);
  if (locked) instance?.stop();
  else instance?.start();
}

/**
 * Inertial smooth scrolling (Lenis) for the whole page, off for reduced motion.
 * In-page links are handled here so they glide, respect the sticky header, update the
 * hash (other sections listen for `hashchange`) and move focus for keyboard users.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const lenis = reduced ? null : new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9 });
    instance = lenis;
    if (lenis && document.documentElement.classList.contains('scroll-locked')) lenis.stop();

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();

      const focusTarget = () => {
        if (target.tabIndex < 0 && !target.matches('a, button, input, select, textarea')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      if (id === 'top') {
        if (lenis) lenis.scrollTo(0, { onComplete: focusTarget });
        else window.scrollTo({ top: 0 });
      } else if (lenis) {
        lenis.scrollTo(target, { offset: -HEADER_OFFSET, onComplete: focusTarget });
      } else {
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET });
        focusTarget();
      }
      if (window.location.hash !== `#${id}`) {
        history.pushState(null, '', `#${id}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      lenis?.destroy();
      instance = null;
    };
  }, []);
}
