/// <reference types="vite/client" />

// Always defined: vite.config.ts applies defaults and validates these before building.
interface ImportMetaEnv {
  readonly VITE_PLAY_URL: string;
  readonly VITE_SOURCE_URL: string;
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
