import { useSyncExternalStore } from 'react';

let manualPreference: boolean | undefined;
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  window.addEventListener('oru-motion', onChange);
  return () => { mql.removeEventListener('change', onChange); window.removeEventListener('oru-motion', onChange); };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  let manual = manualPreference ?? false;
  try { manual = manualPreference ?? localStorage.getItem('oru.reduceMotion') === 'true'; } catch { /* Browser storage is optional. */ }
  return window.matchMedia(QUERY).matches || manual;
}

export function setReducedMotion(reduced: boolean) {
  manualPreference = reduced;
  try { localStorage.setItem('oru.reduceMotion', String(reduced)); } catch { /* Preference still applies for this visit. */ }
  document.documentElement.classList.toggle('oru-no-motion', reduced || window.matchMedia(QUERY).matches);
  window.dispatchEvent(new Event('oru-motion'));
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
