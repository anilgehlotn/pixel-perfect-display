// One entry point for account data: mock data on the dev server without a store, the
// Customer Account API otherwise. Every call is tied to the session cookie on the request.
import { setResponseHeader } from "@tanstack/react-start/server";
import { clearSessionCookies, COOKIES, readCookie } from "./cookies";
import { CustomerApiError, UnauthorizedError } from "./customer-api";
import { isConfigured, isMockMode } from "./env";
import { getAccessToken, loginRedirect } from "./session";

type Mock = typeof import("./mock").mock;

export class AccountsUnavailableError extends Error {}

export async function withAccount<T>(
  real: (token: string) => Promise<T>,
  fake: (mock: Mock, orderCount: number) => T,
): Promise<T> {
  // Personal data: never cache, anywhere.
  setResponseHeader("cache-control", "private, no-store");
  // `import.meta.env.DEV` is false in production builds, so this branch and the mock module
  // are removed from them entirely.
  if (import.meta.env.DEV && isMockMode()) {
    const value = readCookie(COOKIES.mock);
    if (!value || !/^\d{1,2}$/.test(value)) throw loginRedirect();
    const { mock } = await import("./mock");
    return fake(mock, Math.min(Number(value), 60));
  }
  if (!isConfigured()) throw new AccountsUnavailableError("Customer accounts are not configured");
  const token = await getAccessToken();
  if (!token) throw loginRedirect();
  try {
    return await real(token);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      clearSessionCookies();
      throw loginRedirect();
    }
    if (error instanceof CustomerApiError) console.error("[account]", error.message);
    throw error;
  }
}
