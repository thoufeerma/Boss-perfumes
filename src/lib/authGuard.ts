import { getCurrentUser } from "@/lib/auth";
import { getAuthenticatedCustomer } from "@/lib/customer";
import { redirect } from "next/navigation";

/**
 * Ensures the user has an authenticated WordPress session.
 * If not authenticated, instantly halts execution and redirects to /login.
 * 
 * Use this for pages that ONLY need authentication (e.g. Layout, Wishlist).
 */
export async function requireAuth() {
  const token = await getCurrentUser();
  if (!token) {
    redirect("/login");
  }
  return token;
}

/**
 * Ensures the user is authenticated AND securely resolves their WooCommerce customer object.
 * If not authenticated, instantly halts execution and redirects to /login.
 * 
 * Use this for pages that REQUIRE a WooCommerce customer ID (e.g. Orders, Addresses, Profile).
 */
export async function requireAuthenticatedCustomer() {
  await requireAuth(); // Guaranteed redirect if guest
  return await getAuthenticatedCustomer(); // Guaranteed valid customer if not redirected
}
