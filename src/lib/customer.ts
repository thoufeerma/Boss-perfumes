import { getCurrentUser } from "@/lib/auth";
import { fetchAuthenticated } from "@/lib/fetchAuthenticated";
import { fetchWC } from "@/api/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cache } from "react";

export class CustomerResolutionError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "CustomerResolutionError";
  }
}

/**
 * Robustly resolves the WooCommerce customer for the currently authenticated session.
 * Request-scoped cached using React.cache() to prevent duplicate database lookups
 * and duplicate JWT parsing during a single server render cycle.
 */
export const getAuthenticatedCustomer = cache(async () => {
  const tokenPayload = await getCurrentUser();
  if (!tokenPayload) {
    throw new CustomerResolutionError("Unauthorized", 401);
  }

  const jwtId = tokenPayload?.data?.user?.id;
  const jwtEmail = tokenPayload?.user_email || tokenPayload?.data?.user?.email;

  // 1. Try fast path: Direct ID lookup if available
  if (jwtId) {
    try {
      const customer = await fetchWC(`customers/${jwtId}`);
      if (customer && !Array.isArray(customer) && customer.id) {
        return customer;
      }
    } catch (e: any) {
      if (isRedirectError(e)) throw e;
      // If it fails because the WP user is not a WC customer, we will fall back to email
      const errorMessage = e.message || "";
      if (!errorMessage.includes("wc_user_invalid_id") && !errorMessage.includes("rest_user_invalid_id")) {
        throw new CustomerResolutionError(`WooCommerce API Error: ${errorMessage}`, 500);
      }
    }
  }

  // 2. Fallback path: Try email lookup
  if (jwtEmail) {
    try {
      const customers = await fetchWC(`customers?email=${encodeURIComponent(jwtEmail)}`);
      if (Array.isArray(customers) && customers.length > 0 && customers[0].id) {
        return customers[0];
      }
    } catch (e: any) {
      if (isRedirectError(e)) throw e;
      throw new CustomerResolutionError(`WooCommerce API Error: ${e.message}`, e.statusCode || 500);
    }
  }

  // 3. Absolute fallback: If WC API fails completely (e.g. user is Admin/Subscriber without a WC profile),
  // we query WP Core directly and construct a compatible customer object.
  try {
    const me = await fetchAuthenticated("wp-json/wp/v2/users/me?context=edit");
    if (me && me.id) {
       return {
         id: me.id,
         email: me.email || jwtEmail || tokenPayload?.email || "",
         first_name: me.first_name || tokenPayload?.data?.user?.first_name || "",
         last_name: me.last_name || tokenPayload?.data?.user?.last_name || "",
         username: me.username || tokenPayload?.data?.user?.display_name || tokenPayload?.user_display_name || "User",
         billing: { email: me.email || jwtEmail || tokenPayload?.email || "" },
         shipping: {}
       };
    }
  } catch (e: any) {
      if (isRedirectError(e)) throw e;
    // Otherwise, swallow the error and fall through to the synthetic user fallback below
  }

  // 4. Ultimate Synthetic Fallback: Construct one purely from the JWT to prevent a total crash
  // We extract whatever we can from the token payload regardless of its specific schema
  const fallbackEmail = jwtEmail || tokenPayload?.email || tokenPayload?.data?.email || "";
  const fallbackName = tokenPayload?.user_display_name || tokenPayload?.data?.user?.display_name || tokenPayload?.username || "User";
  
  return {
    id: jwtId || tokenPayload?.id || 0,
    email: fallbackEmail,
    first_name: fallbackName.split(' ')[0] || "User",
    last_name: fallbackName.split(' ')[1] || "",
    username: fallbackName,
    billing: { email: fallbackEmail },
    shipping: {}
  };
});
