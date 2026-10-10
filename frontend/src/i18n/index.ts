import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

export type Lang = 'en' | 'hi';

const STORAGE_KEY = 'oru.lang';

// English ships in the main bundle; Hindi is fetched on demand as its own chunk.
void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'hi'],
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  initAsync: false,
  returnNull: false,
});

function applyDocumentLang(lang: Lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.title = i18n.t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description'));
}

export async function setLanguage(lang: Lang): Promise<void> {
  if (lang === 'hi' && !i18n.hasResourceBundle('hi', 'translation')) {
    const hi = await import('./hi.json');
    i18n.addResourceBundle('hi', 'translation', hi.default, true, true);
  }
  await i18n.changeLanguage(lang);
  applyDocumentLang(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be blocked (private mode); the switch still works for this visit.
  }
}

export function storedLanguage(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'hi' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

export default i18n;
