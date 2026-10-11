import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Pixels to stop above an anchor target, so the sticky header doesn't cover it. */
const HEADER_OFFSET = 88;

/** Jump to the top instantly (used on page changes). */
export function scrollToTopNow() {
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/** Pause or resume smooth scrolling (used while the intro loader is up). */
export function setScrollLocked(locked: boolean) {
  document.documentElement.classList.toggle('scroll-locked', locked);
}

/**
 * Native scrolling keeps wheel and touch input off an animation-frame loop.
 * In-page links are handled here so they glide, respect the sticky header, update the
 * hash (other sections listen for `hashchange`) and move focus for keyboard users.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion();
  useEffect(() => {
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
      window.scrollTo({
        top: id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
        behavior: reduced ? 'instant' : 'smooth',
      });
      focusTarget();
      if (window.location.hash !== `#${id}`) {
        history.pushState(null, '', `#${id}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, [reduced]);
}
