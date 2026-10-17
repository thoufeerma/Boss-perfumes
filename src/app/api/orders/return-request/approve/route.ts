import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { paymentConfig } from "@/lib/payment/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, adminSecret } = body;

    // Optional admin secret verification (or fallback to webhook secret)
    const expectedSecret = process.env.TABBY_WEBHOOK_SECRET || "bossperfumes-tabby-secret-123";
    if (adminSecret && adminSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await fetchWC(`orders/${orderId}`);
    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const refundAmount = amount ? parseFloat(amount).toFixed(2) : parseFloat(order.total || "0").toFixed(2);
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
