import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const email = searchParams.get("email");

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
    }

    const order = await fetchWC(`orders/${orderId}`);
    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify email matches order billing email
    const orderEmail = String(order.billing?.email || "").trim().toLowerCase();
    const queryEmail = String(email).trim().toLowerCase();

    if (orderEmail !== queryEmail) {
      return NextResponse.json({ error: "Email does not match this order" }, { status: 403 });
    }

    // Extract return request metadata if already submitted
    const existingReturn = order.meta_data?.find((m: any) => m.key === "_return_request")?.value || null;
    const returnStatus = order.meta_data?.find((m: any) => m.key === "_return_request_status")?.value || null;

    // Check 14-day policy limit
    const orderDate = new Date(order.date_created);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const isWithin14Days = daysSinceOrder <= 14;

    return NextResponse.json({
      order: {
        id: order.id,
        date_created: order.date_created,
        status: order.status,
        total: order.total,
        currency_symbol: order.currency_symbol || "AED",
        payment_method: order.payment_method,
        payment_method_title: order.payment_method_title,
        billing: order.billing,
        shipping: order.shipping,
        line_items: order.line_items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          total: item.total,
          price: item.price,
        })) || [],
        existingReturn,
        returnStatus,
        isWithin14Days,
        daysSinceOrder,
      }
    });
  } catch (error: any) {
    console.error("Fetch return order error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      email,
      items, // array of { id, name, quantity, reason }
      overallReason,
      comments,
      returnMethod, // 'courier_pickup' | 'store_dropoff'
      pickupAddress, // { address, city, phone }
      bankDetails, // { bankName, accountHolder, iban } (for COD)
    } = body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order ID and selected items are required" }, { status: 400 });
    }

    // Fetch the order
    const order = await fetchWC(`orders/${orderId}`);
    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: Verify customer ownership or email match
    const currentUser = await getCurrentUser();
    const customerId = currentUser?.data?.user?.id;
    const orderEmail = String(order.billing?.email || "").trim().toLowerCase();
    const providedEmail = String(email || "").trim().toLowerCase();

    const isAuthorized =
      (customerId && customerId === order.customer_id) ||
      (providedEmail && providedEmail === orderEmail);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Invalid credentials for this order" }, { status: 403 });
    }

    // Check order status eligibility
    if (order.status === "refunded" || order.status === "cancelled") {
      return NextResponse.json({ error: `Cannot request a return for an order that is already ${order.status}` }, { status: 400 });
    }

    // Check if a return request is already pending
    const existingReturn = order.meta_data?.find((m: any) => m.key === "_return_request")?.value;
    if (existingReturn && existingReturn.status === "pending_review") {
      return NextResponse.json({
        error: "A return request is already pending review for this order.",
        rmaId: existingReturn.id
      }, { status: 400 });
    }

    const rmaId = `RMA-${order.id}-${Date.now().toString().slice(-6)}`;
    const returnData = {
      id: rmaId,
      status: "pending_review",
      submitted_at: new Date().toISOString(),
      items,
      overallReason: overallReason || "Return requested by customer",
      comments: comments || "",
      returnMethod: returnMethod || "courier_pickup",
      pickupAddress: pickupAddress || {
        address: order.shipping?.address_1 || order.billing?.address_1,
        city: order.shipping?.city || order.billing?.city,
        phone: order.billing?.phone,
      },
      bankDetails: order.payment_method?.toLowerCase().includes("cod") ? bankDetails : null,
      payment_method: order.payment_method,
      payment_method_title: order.payment_method_title,
    };

    // Build human-readable order note for WooCommerce admin
    const itemsList = items
      .map((it: any) => `• ${it.name} (Qty: ${it.quantity}) - Reason: ${it.reason || overallReason}`)
      .join("\n");

    const returnMethodText = returnMethod === "courier_pickup"
      ? `Doorstep Courier Pickup (${returnData.pickupAddress.city}, Phone: ${returnData.pickupAddress.phone})`
      : "Customer Store Drop-off (Deira, Dubai)";

    const settlementText = order.payment_method?.toLowerCase().includes("tabby")
      ? "Tabby (Installments will be cancelled/refunded via Tabby upon return approval)"
      : order.payment_method?.toLowerCase().includes("cod")
      ? `Cash on Delivery (Bank Transfer: ${bankDetails?.bankName || "N/A"}, IBAN: ${bankDetails?.iban || "N/A"}, Name: ${bankDetails?.accountHolder || "N/A"})`
      : `Original Payment Method (${order.payment_method_title})`;

    const noteContent = `📦 [CUSTOMER RETURN REQUEST - ${rmaId}]
Submitted: ${new Date().toLocaleString()}
Status: Pending Review

Items to Return:
${itemsList}

Return Method: ${returnMethodText}
Settlement: ${settlementText}
Customer Comments: ${comments || "None"}

To approve this return and initiate the refund, inspect the items upon arrival and trigger approval.`;

    // 1. Add order note in WooCommerce
    await fetchWC(`orders/${order.id}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: noteContent,
        customer_note: false,
      }),
    });

    // 2. Update order meta_data in WooCommerce
    const updatedMeta = [
      ...(order.meta_data || []).filter((m: any) => m.key !== "_return_request" && m.key !== "_return_request_status"),
      { key: "_return_request", value: returnData },
      { key: "_return_request_status", value: "pending_review" },
    ];

    await fetchWC(`orders/${order.id}`, {
      method: "PUT",
      body: JSON.stringify({
        meta_data: updatedMeta,
      }),
    });

    return NextResponse.json({
      success: true,
      rmaId,
      message: "Your return request has been submitted successfully. Our team will review your request and arrange pickup.",
      returnData,
    });
  } catch (error: any) {
    console.error("Submit return request error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit return request" }, { status: 500 });
  }
}
