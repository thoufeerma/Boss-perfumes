import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { getEnabledPaymentMethods } from "@/lib/payment/registry";
import { cookies } from "next/headers";
import { fetchWC } from "@/api/client";
import { getCart } from "@/api/cart";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billing, shipping, paymentMethod, existingOrderId } = body;

    const cookieStore = await cookies();
    const cartToken = cookieStore.get("wc_cart_token")?.value;

    if (!cartToken) {
      return NextResponse.json({ error: "Cart is empty or token missing" }, { status: 400 });
    }

    // 1. Fetch current cart
    const cartData = await getCart();
    
    if (!cartData || cartData.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Map cart items to WooCommerce Order line_items
    const lineItems = cartData.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    // Map authenticated user to the order
    const currentUser = await getCurrentUser();
    const customerId = currentUser?.data?.user?.id || 0;

    // Resolve payment method details
    const methods = getEnabledPaymentMethods();
    const selectedMethod = methods.find(m => m.id === paymentMethod) || methods[0] || { id: "checkoutcom", name: "Checkout.com", provider: "Checkout.com" };

    let orderId = existingOrderId;

    if (!orderId) {
      // 3. Create Pending WooCommerce Order directly via Server-to-Server REST API
      const orderPayload = {
        payment_method: selectedMethod.id, 
        payment_method_title: selectedMethod.name,
        set_paid: false, // Leave order as Pending
        customer_id: customerId,
        billing: billing,
        shipping: shipping || billing,
        line_items: lineItems,
        meta_data: [
          { key: "_payment_provider", value: selectedMethod.provider }
        ]
      };

      const orderResponse = await fetchWC("orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse || !orderResponse.id) {
        console.error("WooCommerce Order Creation Error:", orderResponse);
        return NextResponse.json({ 
          error: "Failed to create WooCommerce order", 
          details: orderResponse 
        }, { status: 400 });
      }
      
      orderId = orderResponse.id;
    } else {
      // Optional: Update the existing order's payment method and billing info before retrying
      await fetchWC(`orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({
          payment_method: selectedMethod.id,
          payment_method_title: selectedMethod.name,
          meta_data: [
            { key: "_payment_provider", value: selectedMethod.provider },
            { key: "_transaction_id", value: "" }, // Clear stale transaction
            { key: "_session_id", value: "" } // Clear stale session
          ]
        })
      });
    }

    // Add Order Note
    await fetchWC(`orders/${orderId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: `Payment Provider: ${selectedMethod.provider}\nSession Created`,
        customer_note: false
      })
    });
    const amountInMinorUnits = parseInt(cartData.totals.total_price || "0", 10);
    const minorUnitDivisor = 10 ** (cartData.totals.currency_minor_unit || 2);
    const standardAmount = amountInMinorUnits / minorUnitDivisor;

    // 4. PRESERVE the cart token until payment succeeds.
    // Do NOT delete it here.

    // 5. Initialize Payment Session
    const provider = getPaymentProvider(selectedMethod.id);
    const session = await provider.createSession({
      orderId: orderId,
      amount: standardAmount,
      currency: cartData.totals.currency_code || "AED",
      customerEmail: billing.email || "",
      customerName: `${billing.first_name || ""} ${billing.last_name || ""}`.trim(),
      billing: billing,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout`,
    });

    return NextResponse.json({ ...session, orderId });

  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
