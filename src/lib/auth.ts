import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export function getCookieName(): string {
  const cookieName = process.env.JWT_COOKIE_NAME;

  if (!cookieName) {
    return "bossperfumes_auth";
  }

  return cookieName;
}

export async function setAuthCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const name = getCookieName();

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined; // 30 days or session

  cookieStore.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  const name = getCookieName();
  cookieStore.delete(name);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const name = getCookieName();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

// ---------------------------------------------------------------------------
// Token verification
//
// The auth cookie holds a JWT issued by the WordPress JWT plugin. Its payload decides
// which WooCommerce customer every account page and API route acts for, using admin
// REST credentials, so it must never be trusted until its signature has been checked.
//
// Two ways to check it:
//   1. Locally, when JWT_AUTH_SECRET_KEY (the same value as JWT_AUTH_SECRET_KEY in
//      wp-config.php) is set. No network round trip.
//   2. Otherwise, by asking WordPress (POST /jwt-auth/v1/token/validate). Results are
//      cached in memory for a short while so a page render does not call WordPress
//      for every lookup.
// ---------------------------------------------------------------------------

export type TokenVerification =
  | { status: "valid"; payload: any }
  | { status: "invalid" }
  // WordPress could not be reached. Treated as signed-out, but callers should not
  // destroy the session over it.
  | { status: "error" };

const CLOCK_SKEW_SECONDS = 60;
const REMOTE_CACHE_TTL_MS = 5 * 60 * 1000;
const REMOTE_CACHE_MAX_ENTRIES = 1000;

// sha256(token) -> { payload, expiresAt }
const remoteValidationCache = new Map<string, { payload: any; expiresAt: number }>();

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function decodeParts(token: string): { header: any; payload: any; signingInput: string; signature: Buffer } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]).toString("utf8"));
    const payload = JSON.parse(base64UrlDecode(parts[1]).toString("utf8"));
    if (!header || typeof header !== "object" || !payload || typeof payload !== "object") return null;
    return { header, payload, signingInput: `${parts[0]}.${parts[1]}`, signature: base64UrlDecode(parts[2]) };
  } catch {
    return null;
  }
}

/** Checks exp / nbf. A token without exp is rejected: every token the plugin issues has one. */
function isWithinValidityWindow(payload: any): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || now >= payload.exp - CLOCK_SKEW_SECONDS) return false;
  if (typeof payload.nbf === "number" && now + CLOCK_SKEW_SECONDS < payload.nbf) return false;
  return true;
}

const HMAC_ALGORITHMS: Record<string, string> = { HS256: "sha256", HS384: "sha384", HS512: "sha512" };

function verifyLocally(token: string, secret: string): TokenVerification {
  const decoded = decodeParts(token);
  if (!decoded) return { status: "invalid" };

  const algorithm = HMAC_ALGORITHMS[decoded.header.alg];
  if (!algorithm) return { status: "invalid" }; // rejects "none" and asymmetric algorithms

  const expected = crypto.createHmac(algorithm, secret).update(decoded.signingInput).digest();
  if (expected.length !== decoded.signature.length || !crypto.timingSafeEqual(expected, decoded.signature)) {
    return { status: "invalid" };
  }

  if (!isWithinValidityWindow(decoded.payload)) return { status: "invalid" };
  return { status: "valid", payload: decoded.payload };
}

function getValidateUrl(): string | null {
  if (process.env.JWT_VALIDATE_URL) return process.env.JWT_VALIDATE_URL;
  if (process.env.JWT_AUTH_URL) return `${process.env.JWT_AUTH_URL.replace(/\/+$/, "")}/validate`;
  return null;
}

async function verifyRemotely(token: string): Promise<TokenVerification> {
  const decoded = decodeParts(token);
  if (!decoded || !isWithinValidityWindow(decoded.payload)) return { status: "invalid" };

  const cacheKey = crypto.createHash("sha256").update(token).digest("hex");
  const cached = remoteValidationCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { status: "valid", payload: cached.payload };
  }
  if (cached) remoteValidationCache.delete(cacheKey);

  const validateUrl = getValidateUrl();
  if (!validateUrl) {
    console.error("[Auth] Neither JWT_AUTH_SECRET_KEY nor JWT_VALIDATE_URL / JWT_AUTH_URL is configured; refusing all sessions.");
    return { status: "error" };
  }

  let res: Response;
  try {
    res = await fetch(validateUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error("[Auth] Token validation request failed", error);
    return { status: "error" };
  }

  if (res.status >= 500) return { status: "error" };
  if (!res.ok) return { status: "invalid" };

  if (remoteValidationCache.size >= REMOTE_CACHE_MAX_ENTRIES) {
    const oldestKey = remoteValidationCache.keys().next().value;
    if (oldestKey) remoteValidationCache.delete(oldestKey);
  }
  remoteValidationCache.set(cacheKey, {
    payload: decoded.payload,
    expiresAt: Math.min(Date.now() + REMOTE_CACHE_TTL_MS, decoded.payload.exp * 1000),
  });

  return { status: "valid", payload: decoded.payload };
}

/** Verifies a JWT's signature and validity window. Never trust a payload that did not come through here. */
export async function verifyAuthToken(token: string): Promise<TokenVerification> {
  const secret = process.env.JWT_AUTH_SECRET_KEY;
  if (secret) return verifyLocally(token, secret);
  return verifyRemotely(token);
}

/** Verifies the auth cookie of the current request. */
export async function verifyCurrentSession(): Promise<TokenVerification> {
  const token = await getAuthToken();
  if (!token) return { status: "invalid" };
  return verifyAuthToken(token);
}

/**
 * The verified JWT payload of the signed-in user, or null when signed out, when the
 * token is forged / expired, or when it cannot be verified right now.
 */
export async function getCurrentUser() {
  const result = await verifyCurrentSession();
  return result.status === "valid" ? result.payload : null;
}
