import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import './i18n';
import { LandingPage } from './pages/landing/LandingPage';

/** Used at build time only, to prerender the English page into dist/index.html. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <LandingPage />
    </StrictMode>,
  );
}
