import * as z from 'zod/mini';

/** Build-time contract for VITE_* variables. Validated in vite.config.ts so zod never ships to the browser. */
export const EnvSchema = z.object({
  VITE_PLAY_URL: z.string().check(z.minLength(1)),
  VITE_SOURCE_URL: z.url(),
  VITE_SITE_URL: z.url(),
});

export const ENV_DEFAULTS: z.infer<typeof EnvSchema> = {
  VITE_PLAY_URL: '/play',
  VITE_SOURCE_URL: 'https://github.com/Joohhnnyyy/Oru',
  VITE_SITE_URL: 'https://oru.example.org',
};
