import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearCart } from "@/api/cart";
import { getCurrentUser } from "@/lib/auth";
import { fetchWC } from "@/api/client";

export async function POST() {
  const cookieStore = await cookies();

  try {
    // 1. Delete items on WooCommerce Store API
    await clearCart();

    // 2. Clear persistent cart for logged-in user if applicable
    const currentUser = await getCurrentUser();
    const customerId = currentUser?.data?.user?.id;
    if (customerId && customerId > 0) {
      try {
        await fetchWC(`customers/${customerId}`, {
          method: "PUT",
          body: JSON.stringify({
            meta_data: [
              { key: "_woocommerce_persistent_cart", value: "" },
              { key: "_woocommerce_persistent_cart_1", value: "" },
            ],
          }),
        });
        console.log(`[Cart Clear Route] Persistent cart emptied for customer ${customerId}`);
      } catch (err) {
        console.warn("[Cart Clear Route] Failed to empty customer persistent cart:", err);
      }
    }
  } catch (err) {
    console.error("[Cart Clear Route] Error while clearing cart on WooCommerce:", err);
  }

  // 3. Delete cookies in request store
  cookieStore.delete("wc_cart_token");
  cookieStore.delete("wc_store_nonce");

  // 4. Return response with explicit Set-Cookie deletion headers
  const res = NextResponse.json({ success: true });
  res.cookies.set("wc_cart_token", "", { path: "/", maxAge: 0, expires: new Date(0) });
  res.cookies.set("wc_store_nonce", "", { path: "/", maxAge: 0, expires: new Date(0) });
  return res;
}
