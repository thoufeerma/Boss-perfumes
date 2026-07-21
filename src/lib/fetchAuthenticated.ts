import { getAuthToken, clearAuthCookie } from "./auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function fetchAuthenticated(endpoint: string, options?: RequestInit & { params?: Record<string, string>, next?: { tags?: string[], revalidate?: number } }) {
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
  const token = await getAuthToken();
  
  if (!token) {
    redirect("/login");
  }
  
  const url = new URL(endpoint.startsWith('wp-json') ? endpoint : `wp-json/wc/v3/${endpoint}`, storeUrl);
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = response.statusText;
      }
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    // Also keep the existing fallback just in case
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    throw error;
  }
}
