import { getCookie, getResponse } from "@tanstack/react-start/server";

// Every auth cookie is httpOnly (no JavaScript access), SameSite=Lax (sent on the top-level
// redirect back from Shopify, not on cross-site subrequests) and Secure outside the dev server.
export const COOKIES = {
  access: "sf_ca_at", // "<expiresAtMs>.<access token>"
  refresh: "sf_ca_rt",
  idToken: "sf_ca_idt", // needed for Shopify's logout (id_token_hint)
  name: "sf_ca_name", // first name for the header badge, not a secret
  oauth: "sf_ca_oauth", // state + nonce + PKCE verifier + redirect, 10 minutes
  // Dev mock session: the value is the number of sample orders (0-60). One cookie on purpose:
  // Vite's dev server on Node 20 keeps only one Set-Cookie per response (see CLAUDE.md).
  mock: "sf_ca_mock",
} as const;

type Name = (typeof COOKIES)[keyof typeof COOKIES];

export const readCookie = (name: Name) => getCookie(name);

// Each cookie is appended as its own Set-Cookie header. (h3's setCookie in this version can
// drop a cookie set earlier in the same response, which lost the session cookies.)
function append(name: Name, value: string, maxAge: number, path: string) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
    `Path=${path}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (!import.meta.env.DEV) parts.push("Secure");
  getResponse().headers.append("set-cookie", parts.join("; "));
}

export function writeCookie(name: Name, value: string, maxAgeSeconds: number, path = "/") {
  append(name, value, maxAgeSeconds, path);
}

export function clearCookie(name: Name, path = "/") {
  append(name, "", 0, path);
}

export function clearSessionCookies() {
  for (const name of [COOKIES.access, COOKIES.refresh, COOKIES.idToken, COOKIES.name, COOKIES.mock])
    clearCookie(name);
}

/**
 * Redirect for the /account server routes that carries every cookie set during the request.
 * TanStack Start keeps only one Set-Cookie when it merges cookies into a Response returned
 * from a server route, so they are moved onto this Response directly.
 */
export function redirectWithCookies(location: string) {
  const pending = getResponse().headers;
  const headers = new Headers({ location, "cache-control": "no-store" });
  for (const cookie of pending.getSetCookie()) headers.append("set-cookie", cookie);
  pending.delete("set-cookie");
  return new Response(null, { status: 302, headers });
}
