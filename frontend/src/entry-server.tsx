import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import i18n from './i18n';
import { PRERENDER_PATHS, routes } from './app/routes';
import { documentTitle, type RouteHandle } from './app/title';

export { PRERENDER_PATHS };

/** Build time only: render one URL of the site to HTML (English) plus its document title. */
export async function render(path: string): Promise<{ html: string; title: string }> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`http://localhost${path}`));
  if (context instanceof Response) throw new Error(`Unexpected redirect while prerendering ${path}`);

  const router = createStaticRouter(handler.dataRoutes, context);
  const html = renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );

  const leaf = [...context.matches].reverse().find((m) => (m.route.handle as RouteHandle | undefined)?.title);
  const title = documentTitle(i18n.t, leaf?.route.handle as RouteHandle | undefined, leaf?.params ?? {}, path === '/');
  return { html, title };
}
