"use server";

import { cookies } from "next/headers";
import { getAuthToken } from "@/lib/auth";

export interface CartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  sku: string;
  permalink?: string;
  images: { id: number; src: string; alt: string }[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_symbol: string;
    currency_code: string;
    currency_minor_unit: number;
  };
}

export interface CartData {
  items: CartItem[];
  items_count: number;
  items_weight: number;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    tax_lines: any[];
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
}

const CART_TOKEN_COOKIE = "wc_cart_token";
const NONCE_COOKIE = "wc_store_nonce";

async function fetchStoreApi(
  endpoint: string, 
  options?: RequestInit, 
  isRetry = false, 
  overrideNonce?: string
): Promise<{ data: any; headers: { cartToken: string | null; nonce: string | null } }> {
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
  if (!storeUrl) throw new Error("Missing NEXT_PUBLIC_WC_STORE_URL");

  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  const nonce = overrideNonce || cookieStore.get(NONCE_COOKIE)?.value;

  const url = new URL(`wp-json/wc/store/v1/${endpoint}`, storeUrl);

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  
  if (cartToken) {
    headers.set("Cart-Token", cartToken);
  }

  if (nonce) {
    headers.set("Nonce", nonce);
  }

  const authToken = await getAuthToken();
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
    cache: "no-store", // Crucial: Never cache cart responses
    next: { tags: ["cart"] }
  });

  // Do NOT mutate cookies here, as this function may be called from Server Components
  const newCartToken = response.headers.get("Cart-Token");
  const newNonce = response.headers.get("Nonce");

  if (!response.ok) {
    const errorBody = await response.text();
    
    let errorJson: any = null;
    try {
      errorJson = JSON.parse(errorBody);
    } catch (e) {
      // Not JSON
    }
    
    // Improved Debug Logging
    console.error("====== WOOCOMMERCE STORE API ERROR ======");
    console.error("Request URL:", url.toString());
    console.error("HTTP Method:", options?.method || "GET");
    console.error("Headers:", Array.from(headers.entries()));
    if (options?.body) {
      console.error("Request Payload:", options.body);
    }
    console.error("Response Status:", response.status, response.statusText);
    console.error("Response Body:", errorBody);
    
    if (errorJson) {
      console.error("WooCommerce Error Code:", errorJson.code);
      console.error("WooCommerce Error Message:", errorJson.message);
    }
    console.error("=========================================");

    // Retry once if nonce is missing or invalid
    if (
      !isRetry &&
      errorJson &&
      (errorJson.code === "woocommerce_rest_invalid_nonce" || errorJson.code === "woocommerce_rest_missing_nonce")
    ) {
      console.log("[Cart API] Nonce invalid/missing. Refreshing nonce via GET /wc/store/v1/cart and retrying...");
      
      const refreshResponse = await fetch(new URL("wp-json/wc/store/v1/cart", storeUrl).toString(), {
        headers: { "Cart-Token": cartToken || "" },
        cache: "no-store",
      });
      
      const freshNonce = refreshResponse.headers.get("Nonce");
      if (freshNonce) {
        return fetchStoreApi(endpoint, options, true, freshNonce);
      }
    }

    if (errorJson && errorJson.message) {
      throw new Error(`${errorJson.code}: ${errorJson.message}`);
    }
    throw new Error(`Failed to interact with WooCommerce Cart: ${response.status}`);
  }

  return {
    data: await response.json(),
    headers: {
      cartToken: newCartToken,
      nonce: newNonce
    }
  };
}

async function updateCartCookies(headers: { cartToken: string | null; nonce: string | null }) {
  try {
    const cookieStore = await cookies();
    
    if (headers.cartToken) {
      const currentToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
      if (headers.cartToken !== currentToken) {
        cookieStore.set(CART_TOKEN_COOKIE, headers.cartToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
    }

    if (headers.nonce) {
      const currentNonce = cookieStore.get(NONCE_COOKIE)?.value;
      if (headers.nonce !== currentNonce) {
        cookieStore.set(NONCE_COOKIE, headers.nonce, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 1 day
        });
      }
    }
  } catch (error) {
    // Next.js throws an error if cookies().set() is called from a Server Component.
    // If this happens, we silently ignore the error so we don't crash the page.
    console.debug("[Cart API] Could not update cookies (likely called from Server Component).", error);
  }
}

export async function getCart(): Promise<CartData | null> {
  try {
    const { data } = await fetchStoreApi("cart");
    // We do NOT update cookies here because getCart is called from Server Components (e.g. Layout)
    // where cookies().set() throws an error.
    return data;
  } catch (error) {
    console.error("Failed to get cart:", error);
    return null;
  }
}

export async function addToCart(productId: number, quantity: number = 1): Promise<CartData | null> {
  try {
    const { data, headers } = await fetchStoreApi("cart/add-item", {
      method: "POST",
      body: JSON.stringify({
        id: productId,
        quantity,
      }),
    });
    
    await updateCartCookies(headers);
    return data;
  } catch (error) {
    console.error("Failed to add to cart:", error);
    throw error;
  }
}

export async function updateItemQuantity(key: string, quantity: number): Promise<CartData | null> {
  try {
    const { data, headers } = await fetchStoreApi("cart/update-item", {
      method: "POST",
      body: JSON.stringify({
        key,
        quantity,
      }),
    });
    
    await updateCartCookies(headers);
    return data;
  } catch (error) {
    console.error("Failed to update item quantity:", error);
    throw error;
  }
}

export async function removeItem(key: string): Promise<CartData | null> {
  try {
    // WooCommerce store API v1 requires POST to remove-item
    const { data, headers } = await fetchStoreApi("cart/remove-item", {
      method: "POST",
      body: JSON.stringify({
        key,
      }),
    });
    
    await updateCartCookies(headers);
    return data;
  } catch (error) {
    console.error("Failed to remove item:", error);
    throw error;
  }
}
