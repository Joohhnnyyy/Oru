/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ENV_DEFAULTS, EnvSchema } from './src/config/env.schema';

export default defineConfig(({ mode }) => {
  // Apply defaults first so %VITE_*% placeholders in index.html and import.meta.env always resolve.
  for (const [key, value] of Object.entries(ENV_DEFAULTS)) process.env[key] ??= value;
  const parsed = EnvSchema.safeParse({ ...ENV_DEFAULTS, ...loadEnv(mode, process.cwd(), 'VITE_') });
  if (!parsed.success) throw new Error(`Invalid VITE_* env vars:\n${JSON.stringify(parsed.error.issues, null, 2)}`);

  return {
    plugins: [react(), tailwindcss()],
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
