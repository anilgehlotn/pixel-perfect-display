import { createFileRoute } from "@tanstack/react-router";
import {
  clearCookie,
  clearSessionCookies,
  COOKIES,
  readCookie,
  redirectWithCookies,
} from "@/lib/customer/server/cookies";
import { customerAccountConfig, isConfigured, isMockMode } from "@/lib/customer/server/env";
import { logoutUrl } from "@/lib/customer/server/oauth";

const redirectTo = redirectWithCookies;

// GET /account/logout
// Clears every session cookie, then ends the Shopify session (end_session_endpoint with
// id_token_hint, as Shopify requires) and returns home, where a "signed out" notice shows.
// The local cart is untouched.
export const Route = createFileRoute("/account/logout")({
  server: {
    handlers: {
      GET: async () => {
        if (import.meta.env.DEV && isMockMode()) {
          clearCookie(COOKIES.mock);
          return redirectTo("/?signed_out=1");
        }
        const idToken = readCookie(COOKIES.idToken);
        clearSessionCookies();
        if (!isConfigured() || !idToken) return redirectTo("/?signed_out=1");
        try {
          return redirectTo(
            await logoutUrl(idToken, `${customerAccountConfig().appBaseUrl}/?signed_out=1`),
          );
        } catch {
          return redirectTo("/?signed_out=1");
        }
      },
    },
  },
});
