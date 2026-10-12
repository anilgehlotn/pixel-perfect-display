import { redirect } from "@tanstack/react-router";
import { getRequestHeader } from "@tanstack/react-start/server";
import { safeRedirect } from "../validation";
import type { AccountSession } from "../types";
import { clearSessionCookies, COOKIES, readCookie, writeCookie } from "./cookies";
import { isMockMode } from "./env";
import { refreshTokens, type TokenSet } from "./oauth";

const REFRESH_COOKIE_DAYS = 30;
const EARLY_REFRESH_MS = 60_000; // refresh a minute before expiry

export function storeTokens(tokens: TokenSet) {
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  writeCookie(COOKIES.access, `${expiresAt}.${tokens.access_token}`, tokens.expires_in);
  if (tokens.refresh_token)
    writeCookie(COOKIES.refresh, tokens.refresh_token, REFRESH_COOKIE_DAYS * 86400);
  if (tokens.id_token) writeCookie(COOKIES.idToken, tokens.id_token, REFRESH_COOKIE_DAYS * 86400);
}

export function storeFirstName(firstName: string | null) {
  writeCookie(COOKIES.name, (firstName ?? "").slice(0, 60), REFRESH_COOKIE_DAYS * 86400);
}

function readAccess() {
  const raw = readCookie(COOKIES.access);
  if (!raw) return null;
  const dot = raw.indexOf(".");
  const expiresAt = Number(raw.slice(0, dot));
  const token = raw.slice(dot + 1);
  return token && Number.isFinite(expiresAt) ? { token, expiresAt } : null;
}

// Concurrent requests share one refresh per refresh token (per server instance), so a burst
// of server functions can't race each other with a rotated refresh token.
const inflight = new Map<string, Promise<TokenSet>>();

/**
 * A valid access token for the signed-in customer, refreshed on the server when it is about
 * to expire. Returns null (and clears the session) when there is no session or the refresh
 * fails.
 */
export async function getAccessToken(): Promise<string | null> {
  const access = readAccess();
  if (access && access.expiresAt - EARLY_REFRESH_MS > Date.now()) return access.token;
  const refreshToken = readCookie(COOKIES.refresh);
  if (!refreshToken) {
    if (access) clearSessionCookies();
    return null;
  }
  try {
    let pending = inflight.get(refreshToken);
    if (!pending) {
      pending = refreshTokens(refreshToken).finally(() => inflight.delete(refreshToken));
      inflight.set(refreshToken, pending);
    }
    const tokens = await pending;
    storeTokens(tokens);
    return tokens.access_token;
  } catch (error) {
    console.error(
      "[account] token refresh failed:",
      error instanceof Error ? error.message : "unknown",
    );
    clearSessionCookies();
    return null;
  }
}

/** Login URL that returns the customer to the page they were on. */
export function loginRedirect() {
  let from = "/account";
  const referer = getRequestHeader("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      from = safeRedirect(url.pathname + url.search);
    } catch {
      // keep the default
    }
  }
  return redirect({ to: "/account/login", search: { redirect: from } });
}

/** Cheap check from cookies only (no API call), used by the header and route guards. */
export async function readSession(): Promise<AccountSession> {
  if (import.meta.env.DEV && isMockMode()) {
    const signedIn = /^\d{1,2}$/.test(readCookie(COOKIES.mock) ?? "");
    const { mock } = await import("./mock");
    return { signedIn, firstName: signedIn ? mock.customer().firstName : null, mock: true };
  }
  const firstName = readCookie(COOKIES.name) || null;
  const signedIn = Boolean(readAccess() || readCookie(COOKIES.refresh));
  return { signedIn, firstName, mock: false };
}
