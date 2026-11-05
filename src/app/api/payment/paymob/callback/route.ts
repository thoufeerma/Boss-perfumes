import { NextRequest, NextResponse } from "next/server";
import { PaymobProvider } from "@/lib/payment/paymob";
import { paymentConfig } from "@/lib/payment/config";
import { fetchWC } from "@/api/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const success = searchParams.get("success") === "true";
  const transactionId = searchParams.get("id");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const hmac = searchParams.get("hmac");
  const errorMessage = searchParams.get("data.message") || searchParams.get("txn_response_code");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // Strict HMAC signature verification
  if (paymentConfig.paymob.hmacSecret) {
    if (!hmac) {
      console.warn("[Paymob Callback] Missing required HMAC parameter.");
      const failureUrl = new URL("/checkout", appUrl);
      failureUrl.searchParams.set("error", "paymob_unauthorized");
      return NextResponse.redirect(failureUrl);
    }

    try {
      const provider = new PaymobProvider();
      const paramsObj: Record<string, any> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      const calculatedHmac = provider.calculateHmac(paramsObj);
      if (calculatedHmac.toLowerCase() !== hmac.toLowerCase()) {
        console.error("[Paymob Callback] HMAC signature mismatch! Tampering detected.");
        const failureUrl = new URL("/checkout", appUrl);
        failureUrl.searchParams.set("error", "paymob_tampered");
        return NextResponse.redirect(failureUrl);
      }
    } catch (e) {
      console.error("[Paymob Callback] HMAC verification error:", e);
      const failureUrl = new URL("/checkout", appUrl);
      failureUrl.searchParams.set("error", "paymob_verification_error");
      return NextResponse.redirect(failureUrl);
    }
  } else {
    console.warn("[Paymob Callback] WARNING: PAYMOB_HMAC_SECRET is not configured. Callback cannot cryptographically verify authenticity.");
  }

  if (success) {
    console.log(`[Paymob Callback] Payment succeeded for transaction ${transactionId}, order ${merchantOrderId}`);
    if (merchantOrderId) {
      try {
        await fetchWC(`orders/${merchantOrderId}`, {
          method: "PUT",
          body: JSON.stringify({
            status: "processing",
            set_paid: true,
            transaction_id: transactionId || undefined,
          }),
        });
        await fetchWC(`orders/${merchantOrderId}/notes`, {
          method: "POST",
          body: JSON.stringify({
            note: `Paymob payment approved. Transaction ID: ${transactionId || "N/A"}.`,
            customer_note: false,
          }),
        });
      } catch (err) {
        console.error(`[Paymob Callback] Failed to update WooCommerce order ${merchantOrderId}:`, err);
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
