import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import { paymentConfig } from "./config";
import crypto from "crypto";

export class WooPaymentsProvider implements PaymentProvider {
  private storeUrl: string;
  private webhookSecret: string;

  constructor() {
    this.storeUrl = paymentConfig.woopayments.storeUrl || process.env.NEXT_PUBLIC_WC_STORE_URL || "";
    this.webhookSecret = paymentConfig.woopayments.webhookSecret || "";
  }

  async isEligible(cartData: any): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) {
      return { eligible: false, reason: "Cart data is empty" };
    }
    return { eligible: true };
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[WooPayments] Creating payment session for Order:", request.orderId);

    // If WooCommerce already generated a payment_url during order creation, use it directly
    let redirectUrl = request.paymentUrl;

    if (!redirectUrl) {
      if (!this.storeUrl) {
        throw new Error("WooCommerce store URL is not configured.");
      }

      const cleanStoreUrl = this.storeUrl.replace(/\/+$/, "");
      const orderKeyParam = request.orderKey ? `&key=${encodeURIComponent(request.orderKey)}` : "";
      redirectUrl = `${cleanStoreUrl}/checkout/order-pay/${request.orderId}/?pay_for_order=true${orderKeyParam}`;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bossperfumes.com";
    const successReturnUrl = request.successUrl || `${appUrl}/checkout/success?order_id=${request.orderId}`;
    if (!redirectUrl.includes("return_url=")) {
      redirectUrl += `${redirectUrl.includes("?") ? "&" : "?"}return_url=${encodeURIComponent(successReturnUrl)}`;
    }

    console.log("[WooPayments] Order Pay Redirect URL:", redirectUrl);

    return {
      sessionId: `woopayments_${request.orderId}`,
      redirectUrl,
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    if (!this.webhookSecret) {
      // If no secret configured, accept the webhook
      return true;
    }

    const signature = headers.get("x-wc-webhook-signature");
    if (!signature) {
      console.warn("[WooPayments] Missing x-wc-webhook-signature header");
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(rawBody, "utf8")
        .digest("base64");

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (err) {
      console.error("[WooPayments] Error verifying webhook signature:", err);
      return false;
    }
  }

  async handleWebhookEvent(payload: any): Promise<{
    orderId: number;
    status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded";
    eventId?: string;
    transactionId?: string;
    provider?: string;
    metadata?: Record<string, any>;
  } | null> {
    if (!payload || !payload.id) {
      return null;
    }

    const orderId = Number(payload.id);
    const wcStatus = String(payload.status || "").toLowerCase();

    let standardizedStatus: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "processing";

    switch (wcStatus) {
      case "completed":
        standardizedStatus = "completed";
        break;
      case "processing":
        standardizedStatus = "processing";
        break;
      case "pending":
      case "on-hold":
        standardizedStatus = "pending";
        break;
      case "cancelled":
        standardizedStatus = "cancelled";
        break;
      case "failed":
        standardizedStatus = "failed";
        break;
      case "refunded":
        standardizedStatus = "refunded";
        break;
      default:
        standardizedStatus = "processing";
    }

    const eventId = `wc_order_${orderId}_${payload.date_modified || Date.now()}`;
    const transactionId = payload.transaction_id || "";

    return {
      orderId,
      status: standardizedStatus,
      eventId,
      transactionId,
      provider: "WooPayments",
      metadata: {
        _payment_provider: "WooPayments",
        _wc_payment_method: payload.payment_method,
        _wc_payment_method_title: payload.payment_method_title,
      },
    };
  }
}
