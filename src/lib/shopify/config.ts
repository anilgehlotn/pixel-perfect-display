// Storefront API settings from environment variables (see .env.example).
// Only the Storefront PUBLIC access token belongs here: VITE_ variables are bundled into
// the browser code. Never put an Admin API token in a VITE_ variable or anywhere in this app.
export const shopifyConfig = {
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN ?? "",
  // VITE_SHOPIFY_STOREFRONT_TOKEN is accepted as an alias (the name first used on Vercel).
  storefrontToken:
    import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
    import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
    "",
  apiVersion: import.meta.env.VITE_SHOPIFY_API_VERSION || "2026-07",
};

export const isShopifyConfigured = Boolean(
  shopifyConfig.storeDomain && shopifyConfig.storefrontToken,
);
