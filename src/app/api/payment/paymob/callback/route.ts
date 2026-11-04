import { NextRequest, NextResponse } from "next/server";
import { PaymobProvider } from "@/lib/payment/paymob";
import { paymentConfig } from "@/lib/payment/config";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const success = searchParams.get("success") === "true";
  const transactionId = searchParams.get("id");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const hmac = searchParams.get("hmac");
  const errorMessage = searchParams.get("data.message") || searchParams.get("txn_response_code");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // Optional: Verify HMAC if secret is configured
  if (paymentConfig.paymob.hmacSecret && hmac) {
    try {
      const provider = new PaymobProvider();
      // Construct object from search parameters
      const paramsObj: Record<string, any> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      const calculatedHmac = provider.calculateHmac(paramsObj);
      if (calculatedHmac.toLowerCase() !== hmac.toLowerCase()) {
        console.warn("[Paymob Callback] HMAC mismatch, potential tampering detected.");
      }
    } catch (e) {
      console.error("[Paymob Callback] HMAC verification error:", e);
    }
  }

  if (success) {
    console.log(`[Paymob Callback] Payment succeeded for transaction ${transactionId}, order ${merchantOrderId}`);
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
