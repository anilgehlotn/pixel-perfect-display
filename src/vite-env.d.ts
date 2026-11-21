/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

/** True only in Vercel preview builds (vite.config.ts): adds noindex to every page. */
declare const __NOINDEX__: boolean;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
