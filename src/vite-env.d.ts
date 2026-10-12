/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_SHOPIFY_STORE_DOMAIN?: string;
  readonly VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN?: string;
  readonly VITE_SHOPIFY_API_VERSION?: string;
}

/** True only in Vercel preview builds (vite.config.ts): adds noindex to every page. */
declare const __NOINDEX__: boolean;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
