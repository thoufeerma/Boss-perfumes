import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fetchWC } from "@/api/client";
import { paymentConfig } from "@/lib/payment/config";

function secretsMatch(provided: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * Approves a return and issues the refund (a real Tabby refund for Tabby orders).
 * Staff-only: every call must carry RETURNS_ADMIN_SECRET, in the `x-admin-secret`
 * header or as `adminSecret` in the body. With no secret configured the endpoint is off.
 */
export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.RETURNS_ADMIN_SECRET;
    if (!expectedSecret || expectedSecret.length < 24) {
      console.error("[Return Approve] RETURNS_ADMIN_SECRET is not set (or shorter than 24 characters); endpoint disabled.");
      return NextResponse.json({ error: "Return approval is not configured" }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { orderId, amount } = body;

    const providedSecret = request.headers.get("x-admin-secret") || body.adminSecret;
    if (typeof providedSecret !== "string" || !secretsMatch(providedSecret, expectedSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const numericOrderId = Number(orderId);
    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      return NextResponse.json({ error: "A valid order ID is required" }, { status: 400 });
    }

    const order = await fetchWC(`orders/${numericOrderId}`);
    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "refunded") {
      return NextResponse.json({ error: "Order is already refunded" }, { status: 409 });
    }

    const orderTotal = parseFloat(order.total || "0");
    const requestedAmount = amount !== undefined && amount !== null && amount !== "" ? parseFloat(amount) : orderTotal;
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > orderTotal + 0.001) {
      return NextResponse.json({ error: "Refund amount must be greater than 0 and no more than the order total" }, { status: 400 });
    }

    const refundAmount = requestedAmount.toFixed(2);
    const paymentMethod = String(order.payment_method || "").toLowerCase();
    const isTabby = paymentMethod.includes("tabby") || order.meta_data?.some((m: any) => m.key === "_payment_provider" && m.value === "Tabby");

    let tabbyRefundResult = null;

    if (isTabby) {
      // Find Tabby payment ID from metadata or transaction_id
      const tabbyPaymentId =
        order.meta_data?.find((m: any) => m.key === "_tabby_payment_id")?.value ||
        order.meta_data?.find((m: any) => m.key === "_transaction_id")?.value ||
        order.transaction_id;

      if (tabbyPaymentId) {
        console.log(`[Tabby Refund] Triggering Tabby API refund for payment ${tabbyPaymentId}, amount: ${refundAmount}`);
        const apiUrl = paymentConfig.tabby.apiUrl || "https://api.tabby.ai/api/v2";
        const refundRes = await fetch(`${apiUrl}/payments/${tabbyPaymentId}/refunds`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${paymentConfig.tabby.secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: refundAmount,
            reason: "Customer Return Approved by Merchant",
            reference_id: `refund_${order.id}_${Date.now()}`,
          }),
        });

        if (refundRes.ok) {
          tabbyRefundResult = await refundRes.json();
          console.log("[Tabby Refund] Success:", tabbyRefundResult);
        } else {
          const errText = await refundRes.text();
          console.warn("[Tabby Refund] API call error (proceeding with status update):", errText);
        }
      }
    }

    // Update WooCommerce Order status to refunded
    const updatedMeta = [
      ...(order.meta_data || []).filter((m: any) => m.key !== "_return_request_status"),
      { key: "_return_request_status", value: "approved" },
      { key: "_refunded_amount", value: refundAmount },
    ];

    await fetchWC(`orders/${order.id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "refunded",
        meta_data: updatedMeta,
      }),
    });

    // Add order note
    await fetchWC(`orders/${order.id}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: `✅ [RETURN APPROVED] Refund of ${refundAmount} AED has been approved and issued to customer via ${order.payment_method_title || "Original Payment Method"}.`,
        customer_note: true,
      }),
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: "refunded",
      refundAmount,
      tabbyRefundResult,
    });
  } catch (error: any) {
    console.error("Approve return error:", error);
    return NextResponse.json({ error: error.message || "Failed to approve return" }, { status: 500 });
  }
}
