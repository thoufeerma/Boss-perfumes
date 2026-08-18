import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { getEnabledPaymentMethods } from "@/lib/payment/registry";
import { cookies } from "next/headers";
import { fetchWC } from "@/api/client";
import { getCart } from "@/api/cart";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let orderId: number | null = null;
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

    orderId = existingOrderId;

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

    let buyerHistory: any = {
      registered_since: new Date().toISOString(),
      loyalty_level: 0
    };
    let orderHistory: any[] = [];

    if (billing.email) {
      try {
        const customerOrders = await fetchWC("orders", { params: { email: billing.email } });
        if (customerOrders && Array.isArray(customerOrders)) {
          const pastOrders = customerOrders.filter((o: any) => o.id !== orderId);
          if (pastOrders.length > 0) {
            pastOrders.sort((a: any, b: any) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
            
            let registeredSince = new Date(pastOrders[pastOrders.length - 1].date_created).toISOString();
            if (customerId && customerId > 0) {
              const customer = await fetchWC(`customers/${customerId}`);
              if (customer && customer.date_created) {
                registeredSince = new Date(customer.date_created).toISOString();
              }
            }

            buyerHistory = {
              registered_since: registeredSince,
              loyalty_level: pastOrders.filter((o: any) => o.status === 'completed' || o.status === 'processing').length,
            };

            const mapWcStatusToTabby = (status: string) => {
              switch (status) {
                case 'pending': return 'NEW';
                case 'processing': return 'PROCESSING';
                case 'completed': return 'COMPLETE';
                case 'refunded': return 'REFUNDED';
                case 'cancelled': return 'CANCELED';
                case 'failed': return 'FAILED';
                default: return 'UNKNOWN';
              }
            };

            const historyToSend = pastOrders.slice(0, 10);
            for (const order of historyToSend) {
              orderHistory.push({
                purchased_at: new Date(order.date_created).toISOString(),
                amount: (parseFloat(order.total || "0")).toFixed(2),
                payment_method: (order.payment_method?.toLowerCase().includes('cod') || order.payment_method?.toLowerCase().includes('cash')) ? 'cod' : 'card',
                status: mapWcStatusToTabby(order.status),
                buyer: { phone: order.billing?.phone || "000000000", email: order.billing?.email || "guest@example.com", name: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() || "Customer" },
                shipping_address: {
                  city: order.shipping?.city || order.billing?.city || "Unknown",
                  address: order.shipping?.address_1 || order.billing?.address_1 || "Unknown",
                  zip: order.shipping?.postcode || order.billing?.postcode || "00000",
                },
                items: order.line_items?.map((item: any) => ({
                  reference_id: item.sku || item.product_id?.toString() || item.id?.toString(),
                  title: item.name || "Product",
                  quantity: item.quantity || 1,
                  unit_price: (parseFloat(item.price || "0")).toFixed(2),
                  category: "Store",
                })) || []
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch WooCommerce order history for buyer", err);
      }
    }

    // 4. PRESERVE the cart token until payment succeeds.
    // Do NOT delete it here.

    // 5. Initialize Payment Session
    const provider = getPaymentProvider(selectedMethod.id);
    const session = await provider.createSession({
      orderId: orderId as number,
      amount: standardAmount,
      currency: cartData.totals.currency_code || "AED",
      customerEmail: billing.email || "",
      customerName: `${billing.first_name || ""} ${billing.last_name || ""}`.trim(),
      billing: billing,
      shipping: shipping || billing,
      items: cartData.items || [],
      customerId: customerId,
      buyerHistory: buyerHistory,
      orderHistory: orderHistory,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout`,
    });

    return NextResponse.json({ ...session, orderId });

  } catch (error: any) {
    console.error("Create session error:", error);
    // Note: orderId might not be defined if it failed before creation, but let's try to pass it if we can.
    // However, `orderId` is not in the catch scope if it was declared inside `try` but it IS declared in the try scope.
    // Wait, orderId is declared in the try block!
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      orderId: orderId
    }, { status: 500 });
  }
}
