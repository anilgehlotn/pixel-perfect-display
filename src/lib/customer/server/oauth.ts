// OAuth 2.0 + PKCE with Shopify's Customer Account API (public or confidential client).
// Docs: https://shopify.dev/docs/api/customer/2026-10 (Authentication section).
import { customerAccountConfig } from "./env";

type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  issuer: string;
};
type ApiConfig = { graphql_api: string };

export type TokenSet = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
};

const DISCOVERY_TTL = 60 * 60 * 1000;
let cache: { at: number; openid: OpenIdConfig; api: ApiConfig } | null = null;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": userAgent() },
  });
  if (!res.ok) throw new Error(`Discovery failed: ${res.status} ${url}`);
  return (await res.json()) as T;
}

const userAgent = () => "SkinFusion Storefront (+customer-accounts)";

/** Endpoints from the shop's discovery documents, cached for an hour per server instance. */
export async function discover() {
  if (cache && Date.now() - cache.at < DISCOVERY_TTL) return cache;
  const { storeDomain, shopId, apiVersion } = customerAccountConfig();
  let openid: OpenIdConfig;
  let api: ApiConfig;
  if (storeDomain) {
    [openid, api] = await Promise.all([
      getJson<OpenIdConfig>(`https://${storeDomain}/.well-known/openid-configuration`),
      getJson<ApiConfig>(`https://${storeDomain}/.well-known/customer-account-api`),
    ]);
  } else {
    // No storefront domain: Shopify's shop-ID based endpoints.
    const auth = `https://shopify.com/authentication/${shopId}`;
    openid = {
      authorization_endpoint: `${auth}/oauth/authorize`,
      token_endpoint: `${auth}/oauth/token`,
      end_session_endpoint: `${auth}/logout`,
      issuer: auth,
    };
    api = {
      graphql_api: `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`,
    };
  }
  // Pin the API version we built against instead of whatever "latest" discovery returns.
  api = {
    graphql_api: api.graphql_api.replace(/\/api\/[^/]+\/graphql/, `/api/${apiVersion}/graphql`),
  };
  cache = { at: Date.now(), openid, api };
  return cache;
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const randomToken = (size = 32) => b64url(crypto.getRandomValues(new Uint8Array(size)));

export async function codeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64url(new Uint8Array(digest));
}

export const callbackUrl = () => `${customerAccountConfig().appBaseUrl}/account/callback`;

export async function authorizeUrl(p: { state: string; nonce: string; verifier: string }) {
  const { openid } = await discover();
  const { clientId } = customerAccountConfig();
  const url = new URL(openid.authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("state", p.state);
  url.searchParams.set("nonce", p.nonce);
  url.searchParams.set("code_challenge", await codeChallenge(p.verifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("locale", "en");
  url.searchParams.set("region_country", "IN");
  return url.toString();
}

async function tokenRequest(body: Record<string, string>): Promise<TokenSet> {
  const { openid } = await discover();
  const { clientId, clientSecret, appBaseUrl } = customerAccountConfig();
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
    "user-agent": userAgent(),
    // Public clients must send an Origin that is registered under JavaScript origin(s).
    origin: new URL(appBaseUrl).origin,
  };
  if (clientSecret) headers["authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  const res = await fetch(openid.token_endpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams({ client_id: clientId, ...body }),
  });
  if (!res.ok) {
    // Never log the response body or request: it can contain tokens.
    throw new Error(`Token endpoint returned ${res.status}`);
  }
  const json = (await res.json()) as Partial<TokenSet>;
  if (!json.access_token || !json.expires_in) throw new Error("Token response incomplete");
  return json as TokenSet;
}

export const exchangeCode = (code: string, verifier: string) =>
  tokenRequest({
    grant_type: "authorization_code",
    redirect_uri: callbackUrl(),
    code,
    code_verifier: verifier,
  });

export const refreshTokens = (refreshToken: string) =>
  tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });

/**
 * Checks the id_token claims we rely on: nonce (replay), audience and expiry. The token comes
 * straight from Shopify's token endpoint over TLS, which OpenID Connect accepts in place of
 * a signature check.
 */
export function verifyIdToken(idToken: string, expectedNonce: string) {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Malformed id_token");
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  const claims = JSON.parse(json) as { nonce?: string; aud?: string | string[]; exp?: number };
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!timingSafeEqual(claims.nonce ?? "", expectedNonce)) throw new Error("Nonce mismatch");
  if (!aud.includes(customerAccountConfig().clientId)) throw new Error("Audience mismatch");
  if (!claims.exp || claims.exp * 1000 < Date.now() - 60_000) throw new Error("id_token expired");
}

export async function logoutUrl(idToken: string | undefined, redirectTo: string) {
  const { openid } = await discover();
  const url = new URL(openid.end_session_endpoint);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", redirectTo);
  return url.toString();
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length || !a) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
