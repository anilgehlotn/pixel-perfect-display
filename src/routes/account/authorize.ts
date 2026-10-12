import { createFileRoute } from "@tanstack/react-router";
import { safeRedirect } from "@/lib/customer/validation";
import { COOKIES, redirectWithCookies, writeCookie } from "@/lib/customer/server/cookies";
import { isConfigured, isMockMode } from "@/lib/customer/server/env";
import { authorizeUrl, randomToken } from "@/lib/customer/server/oauth";

const redirectTo = redirectWithCookies;

// GET /account/authorize?redirect=/account/orders
// Starts Shopify's sign-in: creates state, nonce and PKCE verifier, keeps them in a 10-minute
// httpOnly cookie (scoped to /account) and sends the customer to Shopify's hosted page.
export const Route = createFileRoute("/account/authorize")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const next = safeRedirect(url.searchParams.get("redirect"));
        if (import.meta.env.DEV && isMockMode()) {
          // Dev mock: sign straight in. ?orders=0|3|25 picks the sample order history.
          const orders = url.searchParams.get("orders");
          writeCookie(COOKIES.mock, orders && /^\d{1,2}$/.test(orders) ? orders : "3", 86400);
          return redirectTo(next);
        }
        if (!isConfigured()) return redirectTo("/account/login?error=unavailable");
        try {
          const state = randomToken();
          const nonce = randomToken();
          const verifier = randomToken(48);
          const location = await authorizeUrl({ state, nonce, verifier });
          writeCookie(
            COOKIES.oauth,
            JSON.stringify({ state, nonce, verifier, next }),
            600,
            "/account",
          );
          return redirectTo(location);
        } catch (error) {
          console.error(
            "[account] could not start sign-in:",
            error instanceof Error ? error.message : "unknown",
          );
          return redirectTo("/account/login?error=start");
        }
      },
    },
  },
});
