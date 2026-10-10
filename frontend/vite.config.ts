/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ENV_DEFAULTS, EnvSchema } from './src/config/env.schema';

/**
 * `vite preview` only: serve prerendered pages at clean URLs (/grow -> /grow/index.html), the way
 * Amplify / a CloudFront index rewrite does in production, instead of the SPA fallback.
 */
function prerenderedRoutes(): Plugin {
  return {
    name: 'oru-prerendered-routes',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname = '/', query = ''] = (req.url ?? '/').split('?');
        if (pathname !== '/' && !path.extname(pathname) && !pathname.endsWith('/')) {
          if (existsSync(path.join(server.config.build.outDir, pathname, 'index.html'))) {
            req.url = `${pathname}/${query ? `?${query}` : ''}`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Apply defaults first so %VITE_*% placeholders in index.html and import.meta.env always resolve.
  for (const [key, value] of Object.entries(ENV_DEFAULTS)) process.env[key] ??= value;
  const parsed = EnvSchema.safeParse({ ...ENV_DEFAULTS, ...loadEnv(mode, process.cwd(), 'VITE_') });
  if (!parsed.success) throw new Error(`Invalid VITE_* env vars:\n${JSON.stringify(parsed.error.issues, null, 2)}`);

  return {
    plugins: [react(), tailwindcss(), prerenderedRoutes()],
    build: {
      target: 'es2020',
      cssCodeSplit: false,
      modulePreload: { polyfill: false },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});
