import { isShopifyConfigured, shopifyConfig } from "./config";

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

// Minimal Storefront API GraphQL client. Not called anywhere yet: products and cart still
// use local data until the store is connected (see products.ts and cart/store.ts).
export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!isShopifyConfigured) {
    throw new Error(
      "Shopify is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN.",
    );
  }
  const { storeDomain, storefrontToken, apiVersion } = shopifyConfig;
  const res = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify Storefront API ${res.status} ${res.statusText}`);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new Error("Shopify Storefront API returned no data");
  return json.data;
}
