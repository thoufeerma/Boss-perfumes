import { fetchAuthenticated } from "./fetchAuthenticated";
import { revalidateTag } from "next/cache";

// --- Custom Errors ---
export class WishlistError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "WishlistError";
  }
}
export class WishlistTimeoutError extends WishlistError {
  constructor() {
    super("Wishlist request timed out.", 408);
    this.name = "WishlistTimeoutError";
  }
}
export class WishlistNetworkError extends WishlistError {
  constructor(message: string = "Network failure while reaching wishlist backend.") {
    super(message, 502);
    this.name = "WishlistNetworkError";
  }
}
export class WishlistAuthError extends WishlistError {
  constructor() {
    super("Unauthorized to access wishlist.", 401);
    this.name = "WishlistAuthError";
  }
}
export class WishlistServerError extends WishlistError {
  constructor(message: string = "Unexpected server response.") {
    super(message, 500);
    this.name = "WishlistServerError";
  }
}

// --- Resilient Fetch Wrapper ---
/**
 * Wraps fetchAuthenticated with an AbortSignal timeout and exactly 1 retry for transient failures.
 */
type FetchAuthOptions = NonNullable<Parameters<typeof fetchAuthenticated>[1]>;

async function fetchWithRetry(endpoint: string, options: FetchAuthOptions = {}, retries = 1, timeoutMs = 5000): Promise<any> {
  const attemptFetch = async (retryCount: number): Promise<any> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchAuthenticated(endpoint, {
        ...options,
        signal: controller.signal as AbortSignal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Pass through NEXT_REDIRECT immediately
      if (error.message === 'NEXT_REDIRECT') {
        throw error;
      }

      const isTimeout = error.name === 'AbortError';
      const isAuthError = error.message?.includes('401') || error.message?.includes('403');
      
      if (isAuthError) {
        throw new WishlistAuthError();
      }

      if (retryCount > 0 && !isAuthError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[Wishlist] Fetch failed (${isTimeout ? 'Timeout' : 'Network'}). Retrying...`);
        }
        return attemptFetch(retryCount - 1);
      }

      if (isTimeout) {
        throw new WishlistTimeoutError();
      }

      if (error.message?.includes('API Error:')) {
         throw new WishlistServerError(error.message);
      }

      throw new WishlistNetworkError(error.message);
    }
  };

  return attemptFetch(retries);
}

/**
 * Retrieves the authenticated user's wishlist from YITH REST API.
 * Uses Next.js 15 data fetching with a 'wishlist' tag for instant flushability.
 */
export async function getYithWishlist(): Promise<number[]> {
  const data = await fetchWithRetry("wp-json/yith/wishlist/v1/lists", {
    cache: 'no-store'
  });

  let items: number[] = [];
  if (data?.lists && Array.isArray(data.lists)) {
    data.lists.forEach((list: any) => {
      if (list.items && Array.isArray(list.items)) {
        items = [...items, ...list.items.map((i: any) => i.product_id)];
      }
    });
  }
  
  return items;
}

/**
 * Adds a product to the user's wishlist in YITH.
 */
export async function addToYithWishlist(productId: number): Promise<any> {
  const result = await fetchWithRetry("wp-json/yith/wishlist/v1/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });

  // Invalidate any Server Components caching the wishlist tag
  // @ts-ignore - Next.js experimental types currently expect 2 arguments
  revalidateTag("wishlist");

  return result;
}

/**
 * Removes a product from the user's wishlist in YITH.
 */
export async function removeFromYithWishlist(productId: number): Promise<any> {
  const result = await fetchWithRetry(`wp-json/yith/wishlist/v1/items`, {
    method: "DELETE",
    body: JSON.stringify({ product_id: productId }),
  });

  // Invalidate any Server Components caching the wishlist tag
  // @ts-ignore - Next.js experimental types currently expect 2 arguments
  revalidateTag("wishlist");

  return result;
}
