// Server-only settings for Shopify customer accounts (never VITE_ prefixed, never bundled
// for the browser: files under */server/* are blocked from client imports in vite.config.ts).
const read = (name: string) => (process.env[name] ?? "").trim();

export function customerAccountConfig() {
  const storeDomain = (read("SHOPIFY_STORE_DOMAIN") || read("VITE_SHOPIFY_STORE_DOMAIN"))
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  return {
    /** Storefront domain used for discovery, e.g. skinfusion.myshopify.com or skinfusion.in */
    storeDomain,
    /** Numeric shop ID (Settings > Customer accounts). Used for the fallback endpoints. */
    shopId: read("SHOPIFY_SHOP_ID"),
    clientId: read("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID"),
    /** Only for confidential clients. Public (PKCE) clients have no secret. */
    clientSecret: read("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET"),
    /** Public site origin, e.g. https://skinfusion.in. Callback = {appBaseUrl}/account/callback */
    appBaseUrl: read("APP_BASE_URL").replace(/\/+$/, ""),
    apiVersion: "2026-10",
  };
}

export const isConfigured = () => {
  const c = customerAccountConfig();
  return Boolean((c.storeDomain || c.shopId) && c.clientId && c.appBaseUrl);
};

/**
 * Mock mode: sample customer, orders and addresses so the pages can be built without a
 * store. Only on the Vite dev server (import.meta.env.DEV is replaced with `false` in every
 * production build, so the mock code is removed from it) and only when Shopify isn't set up.
 */
export const isMockMode = () => import.meta.env.DEV && !isConfigured();
