import type { TFunction } from 'i18next';

/** Each route can name its page title; the layout and the prerenderer both read it. */
export interface RouteHandle {
  title: (t: TFunction, params: Record<string, string | undefined>) => string;
}

/** "Page | Oru", the full brand line on the home page, and no doubled "Oru". */
export function documentTitle(
  t: TFunction,
  handle: RouteHandle | undefined,
  params: Record<string, string | undefined>,
  isHome: boolean,
): string {
  if (!handle) return t('meta.title');
  const title = handle.title(t, params);
  return isHome || title.includes('Oru') ? title : `${title} | Oru`;
}
