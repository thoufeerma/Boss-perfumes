import { NextRequest, NextResponse } from "next/server";
import { PaymobProvider } from "@/lib/payment/paymob";
import { paymentConfig } from "@/lib/payment/config";
import { fetchWC } from "@/api/client";
import { amountCoversOrder, claimTransactionForOrder, safeEqual } from "@/lib/payment/verification";

// Order states a successful payment may move forward. Anything else (already paid,
// refunded, cancelled by staff, ...) is left alone.
const PAYABLE_STATUSES = ["pending", "failed", "on-hold"];

/**
 * Where Paymob sends the shopper's browser after checkout. The query string is
 * attacker-controllable, so the order is only marked paid when the HMAC verifies, the
 * signed amount and currency cover the order, and the transaction has not already paid
 * for a different order. Otherwise the shopper is still redirected, but the order is left
 * for the (also signed) server-to-server webhook to settle.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const success = searchParams.get("success") === "true";
  const transactionId = searchParams.get("id");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const hmac = searchParams.get("hmac");
  const errorMessage = searchParams.get("data.message") || searchParams.get("txn_response_code");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const redirectToCheckoutError = (code: string) => {
    const failureUrl = new URL("/checkout", appUrl);
    failureUrl.searchParams.set("error", code);
    return NextResponse.redirect(failureUrl);
  };

  if (!paymentConfig.paymob.hmacSecret) {
    // Without the secret nothing here can be trusted: never mark an order paid.
    console.error("[Paymob Callback] PAYMOB_HMAC_SECRET is not configured. The order will NOT be marked paid from this callback.");
  } else {
    if (!hmac) {
      console.warn("[Paymob Callback] Missing required HMAC parameter.");
      return redirectToCheckoutError("paymob_unauthorized");
    }

    try {
      const provider = new PaymobProvider();
      const paramsObj: Record<string, any> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      const calculatedHmac = provider.calculateHmac(paramsObj);
      if (!safeEqual(calculatedHmac.toLowerCase(), hmac.toLowerCase())) {
        console.error("[Paymob Callback] HMAC signature mismatch! Tampering detected.");
        return redirectToCheckoutError("paymob_tampered");
      }
    } catch (e) {
      console.error("[Paymob Callback] HMAC verification error:", e);
      return redirectToCheckoutError("paymob_verification_error");
    }
  }

  if (success) {
    console.log(`[Paymob Callback] Payment succeeded for transaction ${transactionId}, order ${merchantOrderId}`);
    const orderId = merchantOrderId ? parseInt(merchantOrderId, 10) : NaN;

    if (paymentConfig.paymob.hmacSecret && Number.isInteger(orderId) && orderId > 0 && transactionId) {
      try {
        await markOrderPaidIfValid(orderId, transactionId, searchParams);
      } catch (err) {
        console.error(`[Paymob Callback] Failed to update WooCommerce order ${orderId}:`, err);
      }
    }

    const successUrl = new URL("/checkout/success", appUrl);
    if (transactionId) successUrl.searchParams.set("payment_id", transactionId);
    if (merchantOrderId) successUrl.searchParams.set("order_id", merchantOrderId);
    successUrl.searchParams.set("provider", "paymob");
    return NextResponse.redirect(successUrl);
  } else {
    console.warn(`[Paymob Callback] Payment failed/cancelled for transaction ${transactionId}, order ${merchantOrderId}`);
    const failureUrl = new URL("/checkout", appUrl);
    failureUrl.searchParams.set("error", "paymob_failed");
    if (errorMessage) {
      failureUrl.searchParams.set("message", errorMessage);
    }
    return NextResponse.redirect(failureUrl);
  }
}

async function markOrderPaidIfValid(orderId: number, transactionId: string, params: URLSearchParams) {
  const order = await fetchWC(`orders/${orderId}`);
  if (!order || order.id !== orderId) {
    console.error(`[Paymob Callback] Order ${orderId} not found.`);
    return;
  }

  if (!PAYABLE_STATUSES.includes(order.status)) {
    console.log(`[Paymob Callback] Order ${orderId} is already "${order.status}"; leaving it unchanged.`);
    return;
  }

  // amount_cents and currency are covered by the HMAC verified above.
  const amountPaid = Number(params.get("amount_cents")) / 100;
  if (!amountCoversOrder(amountPaid, order)) {
    console.error(`[Paymob Callback] Order ${orderId}: paid ${amountPaid} but order total is ${order.total}. Not marking paid.`);
    await fetchWC(`orders/${orderId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        note: `⚠️ Paymob callback rejected: amount paid (${amountPaid}) is less than the order total (${order.total}). Transaction ID: ${transactionId}.`,
        customer_note: false,
      }),
    });
    return;
  }

  const currency = params.get("currency");
  if (currency && order.currency && currency.toUpperCase() !== String(order.currency).toUpperCase()) {
    console.error(`[Paymob Callback] Order ${orderId}: paid in ${currency} but order is in ${order.currency}. Not marking paid.`);
    return;
  }

  // Shares its key space with the webhook handler, so the callback and the webhook for
  // the same payment agree, while the same transaction cannot pay for a second order.
  const claimed = await claimTransactionForOrder("paymob", transactionId, orderId);
  if (!claimed) {
    console.error(`[Paymob Callback] Transaction ${transactionId} already paid for another order; refusing order ${orderId}.`);
    return;
  }

  await fetchWC(`orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "processing",
      set_paid: true,
      transaction_id: transactionId,
    }),
  });
  await fetchWC(`orders/${orderId}/notes`, {
    method: "POST",
    body: JSON.stringify({
      note: `Paymob payment approved. Transaction ID: ${transactionId}.`,
      customer_note: false,
    }),
  });
}
