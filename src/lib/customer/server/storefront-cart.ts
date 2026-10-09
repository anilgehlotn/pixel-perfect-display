// Links a Shopify cart to the signed-in customer so checkout is prefilled and authenticated.
// Storefront API cartBuyerIdentityUpdate with the Customer Account API access token as
// buyerIdentity.customerAccessToken (shopify.dev: "Authenticate buyers in checkout").
// Call it after the customer signs in, after every token refresh, and before redirecting to
// cart.checkoutUrl (see linkCartToCustomer in ../functions.ts).
import { shopifyConfig } from "@/lib/shopify/config";

export async function cartBuyerIdentityUpdate(cartId: string, customerAccessToken: string) {
  const { storeDomain, storefrontToken } = shopifyConfig;
  if (!storeDomain || !storefrontToken) throw new Error("Storefront API is not configured");
  const res = await fetch(`https://${storeDomain}/api/2026-10/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-storefront-access-token": storefrontToken,
    },
    body: JSON.stringify({
      query: `mutation Link($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }`,
      variables: { cartId, buyerIdentity: { customerAccessToken } },
    }),
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      cartBuyerIdentityUpdate: {
        cart: { id: string; checkoutUrl: string } | null;
        userErrors: { message: string }[];
      };
    };
  };
  const result = json.data?.cartBuyerIdentityUpdate;
  if (!result || result.userErrors.length || !result.cart)
    throw new Error(result?.userErrors.map((e) => e.message).join("; ") || "Cart not updated");
  return { checkoutUrl: result.cart.checkoutUrl };
}
