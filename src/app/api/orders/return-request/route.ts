import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { sendReturnRequestNotice } from "@/lib/email";

const NOT_FOUND_MESSAGE = "We couldn't find an order with that number and email.";
const TOO_MANY_MESSAGE = "Too many attempts. Please try again later.";

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function parseOrderId(value: unknown): number | null {
  const id = Number(String(value ?? "").replace(/\D/g, ""));
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Trims free text before it goes into an order note. */
function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** True when the request comes from the signed-in customer who owns the order. */
async function isSignedInOwner(order: any): Promise<boolean> {
  const currentUser = await getCurrentUser();
  const customerId = Number(currentUser?.data?.user?.id || 0);
  return customerId > 0 && customerId === order.customer_id;
}

/**
 * Guest return lookup by order number + billing email.
 *
 * Order numbers are sequential and emails are often guessable, so a guest lookup is rate
 * limited and does not return the street address, phone number or surname; the shopper
 * types the pickup address in the form instead. The signed-in owner gets the full order.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = parseOrderId(searchParams.get("orderId"));
    const email = normalizeEmail(searchParams.get("email"));

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
    }

    if (
      !(await checkRateLimit(`return_lookup_ip:${getClientIp(request)}`, 10, 10 * 60)) ||
      !(await checkRateLimit(`return_lookup_order:${orderId}`, 10, 60 * 60))
    ) {
      return NextResponse.json({ error: TOO_MANY_MESSAGE }, { status: 429 });
    }

    const order = await fetchWC(`orders/${orderId}`);
    // One answer for "no such order" and "wrong email", so the form cannot be used to
    // find out which order numbers exist.
    if (!order || !order.id || normalizeEmail(order.billing?.email) !== email) {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    const isOwner = await isSignedInOwner(order);

    // Extract return request metadata if already submitted
    const existingReturn = order.meta_data?.find((m: any) => m.key === "_return_request")?.value || null;
    const returnStatus = order.meta_data?.find((m: any) => m.key === "_return_request_status")?.value || null;

    // Check 14-day policy limit
    const orderDate = new Date(order.date_created);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const isWithin14Days = daysSinceOrder <= 14;

    const billing = isOwner
      ? order.billing
      : { first_name: order.billing?.first_name || "", email: order.billing?.email || "" };
    const shipping = isOwner
      ? order.shipping
      : { city: order.shipping?.city || order.billing?.city || "" };

    return NextResponse.json({
      order: {
        id: order.id,
        date_created: order.date_created,
        status: order.status,
        total: order.total,
        currency_symbol: order.currency_symbol || "AED",
        payment_method: order.payment_method,
        payment_method_title: order.payment_method_title,
        billing,
        shipping,
        line_items: order.line_items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          total: item.total,
          price: item.price,
        })) || [],
        existingReturn: existingReturn ? { id: existingReturn.id, status: existingReturn.status } : null,
        returnStatus,
        isWithin14Days,
        daysSinceOrder,
      }
    });
  } catch (error: any) {
    console.error("Fetch return order error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const {
      email,
      items, // array of { id, quantity, reason }
      overallReason,
      comments,
      returnMethod, // 'courier_pickup' | 'store_dropoff'
      pickupAddress, // { address, city, phone }
      bankDetails, // { bankName, accountHolder, iban } (for COD)
    } = body;
    const orderId = parseOrderId(body.orderId);

    if (!orderId || !items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Order ID and selected items are required" }, { status: 400 });
    }

    if (
      !(await checkRateLimit(`return_submit_ip:${getClientIp(request)}`, 5, 60 * 60)) ||
      !(await checkRateLimit(`return_submit_order:${orderId}`, 5, 60 * 60))
    ) {
      return NextResponse.json({ error: TOO_MANY_MESSAGE }, { status: 429 });
    }

    // Fetch the order
    const order = await fetchWC(`orders/${orderId}`);
    if (!order || !order.id) {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    // Security check: Verify customer ownership or email match
    const isOwner = await isSignedInOwner(order);
    const orderEmail = normalizeEmail(order.billing?.email);
    const providedEmail = normalizeEmail(email);
    const emailMatches = !!providedEmail && providedEmail === orderEmail;

    if (!isOwner && !emailMatches) {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
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

    // Only items that are on the order, at most the quantity ordered, with names taken
    // from the order rather than from the request.
    const lineItems: any[] = Array.isArray(order.line_items) ? order.line_items : [];
    const fallbackReason = clip(overallReason, 200) || "Return requested by customer";
    const validatedItems = items
      .map((it: any) => {
        const line = lineItems.find((li) => li.id === Number(it?.id));
        const qty = Math.floor(Number(it?.quantity));
        if (!line || !Number.isFinite(qty) || qty < 1) return null;
        return {
          id: line.id,
          name: line.name,
          quantity: Math.min(qty, line.quantity),
          reason: clip(it?.reason, 200) || fallbackReason,
        };
      })
      .filter(Boolean) as { id: number; name: string; quantity: number; reason: string }[];

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "None of the selected items are on this order" }, { status: 400 });
    }

    const method = returnMethod === "store_dropoff" ? "store_dropoff" : "courier_pickup";
    const isCOD = order.payment_method?.toLowerCase().includes("cod");
    const safePickup = pickupAddress && typeof pickupAddress === "object"
      ? { address: clip(pickupAddress.address, 300), city: clip(pickupAddress.city, 100), phone: clip(pickupAddress.phone, 40) }
      : null;
    const safeBank = isCOD && bankDetails && typeof bankDetails === "object"
      ? { bankName: clip(bankDetails.bankName, 100), accountHolder: clip(bankDetails.accountHolder, 100), iban: clip(bankDetails.iban, 40) }
      : null;
    const safeComments = clip(comments, 2000);

    const rmaId = `RMA-${order.id}-${Date.now().toString().slice(-6)}`;
    const returnData = {
      id: rmaId,
      status: "pending_review",
      submitted_at: new Date().toISOString(),
      items: validatedItems,
      overallReason: fallbackReason,
      comments: safeComments,
      returnMethod: method,
      pickupAddress: safePickup || {
        address: order.shipping?.address_1 || order.billing?.address_1,
        city: order.shipping?.city || order.billing?.city,
        phone: order.billing?.phone,
      },
      bankDetails: safeBank,
      payment_method: order.payment_method,
      payment_method_title: order.payment_method_title,
      verified_by: isOwner ? "signed_in_owner" : "order_number_and_email",
    };

    // Build human-readable order note for WooCommerce admin
    const itemsList = validatedItems
      .map((it) => `• ${it.name} (Qty: ${it.quantity}) - Reason: ${it.reason}`)
      .join("\n");

    const returnMethodText = method === "courier_pickup"
      ? `Doorstep Courier Pickup (${returnData.pickupAddress.city}, Phone: ${returnData.pickupAddress.phone})`
      : "Customer Store Drop-off (Deira, Dubai)";

    const settlementText = order.payment_method?.toLowerCase().includes("tabby")
      ? "Tabby (Installments will be cancelled/refunded via Tabby upon return approval)"
      : isCOD
      ? `Cash on Delivery (Bank Transfer: ${safeBank?.bankName || "N/A"}, IBAN: ${safeBank?.iban || "N/A"}, Name: ${safeBank?.accountHolder || "N/A"})`
      : `Original Payment Method (${order.payment_method_title})`;

    const verificationText = isOwner
      ? "Verified: submitted by the signed-in account owner."
      : "⚠️ Verified by order number + billing email only (guest). Before refunding by bank transfer, confirm the bank details with the customer using the phone/email on the order.";

    const noteContent = `📦 [CUSTOMER RETURN REQUEST - ${rmaId}]
Submitted: ${new Date().toLocaleString()}
Status: Pending Review
${verificationText}

Items to Return:
${itemsList}

Return Method: ${returnMethodText}
Settlement: ${settlementText}
Customer Comments: ${safeComments || "None"}

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

    // 3. Let the address on the order know, so a return filed by someone else is noticed.
    if (order.billing?.email) {
      await sendReturnRequestNotice(order.billing.email, order.id, rmaId);
    }

    return NextResponse.json({
      success: true,
      rmaId,
      message: "Your return request has been submitted successfully. Our team will review your request and arrange pickup.",
      returnData,
    });
  } catch (error: any) {
    console.error("Submit return request error:", error);
    return NextResponse.json({ error: "Failed to submit return request" }, { status: 500 });
  }
}
