import { createFileRoute } from "@tanstack/react-router";
import { safeRedirect } from "@/lib/customer/validation";
import {
  clearCookie,
  COOKIES,
  readCookie,
  redirectWithCookies,
} from "@/lib/customer/server/cookies";
import { getCustomerBasics } from "@/lib/customer/server/customer-api";
import { exchangeCode, timingSafeEqual, verifyIdToken } from "@/lib/customer/server/oauth";
import { storeFirstName, storeTokens } from "@/lib/customer/server/session";

const redirectTo = redirectWithCookies;

const fail = (reason: string) => redirectTo(`/account/login?error=${reason}`);

// GET /account/callback?code=...&state=...
// Shopify sends the customer back here. Validates state against the httpOnly cookie,
// exchanges the code (with the PKCE verifier) on the server, checks the id_token nonce, stores
// the tokens in httpOnly cookies and redirects. Any failure lands on the branded login page
// with a "Try again" button, never a blank or raw error page.
export const Route = createFileRoute("/account/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = readCookie(COOKIES.oauth);
        clearCookie(COOKIES.oauth, "/account"); // one use only
        if (url.searchParams.get("error")) return fail("cancelled");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state") ?? "";
        let saved: { state: string; nonce: string; verifier: string; next: string };
        try {
          saved = JSON.parse(raw ?? "");
        } catch {
          return fail("expired");
        }
        if (!code || !timingSafeEqual(state, saved.state)) return fail("state");
        try {
          const tokens = await exchangeCode(code, saved.verifier);
          if (!tokens.id_token) throw new Error("No id_token returned");
          verifyIdToken(tokens.id_token, saved.nonce);
          storeTokens(tokens);
          try {
            storeFirstName((await getCustomerBasics(tokens.access_token)).firstName);
          } catch {
            storeFirstName(null); // the badge falls back to a generic icon
          }
          return redirectTo(safeRedirect(saved.next));
        } catch (error) {
          console.error(
            "[account] sign-in callback failed:",
            error instanceof Error ? error.message : "unknown",
          );
          return fail("callback");
        }
      },
    },
  },
});
