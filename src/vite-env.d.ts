/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_STORE_DOMAIN?: string;
  readonly VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN?: string;
  readonly VITE_SHOPIFY_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
