import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("wc_cart_token");
  // The Store API nonce is bound to the session the cart token belonged to. Leaving it
  // behind means the next add-to-cart sends a stale nonce with no cart token, which
  // WooCommerce rejects - the "Failed to add item to bag" seen after a completed order.
  // It outlives the cart by 24h, so it has to go at the same time.
  cookieStore.delete("wc_store_nonce");

  return NextResponse.json({ success: true });
}
