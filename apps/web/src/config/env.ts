// The only place app code reads env vars. Values are zod-validated at build time
// (vite.config.ts + env.schema.ts), and the build fails if any is invalid.
export const env = {
  VITE_PLAY_URL: import.meta.env.VITE_PLAY_URL,
  VITE_SOURCE_URL: import.meta.env.VITE_SOURCE_URL,
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
} as const;
