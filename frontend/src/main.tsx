import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.css';
import { routes } from './app/routes';
import { setLanguage, storedLanguage } from './i18n';

// Scroll-reveal styles only apply once JS is running, so no-JS visitors see everything.
document.documentElement.classList.add('js');

declare global {
  interface Window {
    __staticRouterHydrationData?: Parameters<typeof createBrowserRouter>[1] extends infer O
      ? O extends { hydrationData?: infer H }
        ? H
        : never
      : never;
  }
}

const router = createBrowserRouter(routes, { hydrationData: window.__staticRouterHydrationData });

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Production HTML is prerendered per page (scripts/prerender.mjs); dev starts empty.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

const lang = storedLanguage() ?? (navigator.language.toLowerCase().startsWith('hi') ? 'hi' : null);
if (lang === 'hi') void setLanguage('hi');

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a bonus; the page works without it.
    });
  });
}
