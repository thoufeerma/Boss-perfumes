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

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("[Auth] Token does not have 3 parts");
      return true;
    }
    
    // Use standard atob for Edge runtime compatibility instead of Buffer
    const payloadStr = atob(parts[1]);
    const payload = JSON.parse(payloadStr);
    
    if (!payload.exp) {
      console.log("[Auth] Token does not have an exp field");
      return false;
    }
    
    const expTime = payload.exp * 1000;
    const now = Date.now();
    const isExp = now >= (expTime - 60000);
    console.log(`[Auth] Token exp verification: now=${now}, expTime=${expTime}, isExpired=${isExp}`);
    return isExp;
  } catch (error) {
    console.error("[Auth] Failed to decode token", error);
    return true;
  }
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    return null;
  }
  
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    return null;
  }
}
