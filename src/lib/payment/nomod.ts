import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import { paymentConfig } from "./config";
import crypto from "crypto";

export class NomodProvider implements PaymentProvider {
  private apiKey: string;
  private apiUrl: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = paymentConfig.nomod.apiKey || "";
    this.apiUrl = (paymentConfig.nomod.apiUrl || "https://api.nomod.com/v1").replace(/\/+$/, "");
    this.webhookSecret = paymentConfig.nomod.webhookSecret || "";
  }

  async isEligible(cartData: any): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };
    // Nomod supports cards, Apple Pay, Google Pay, etc. in AED & GCC currencies
    return { eligible: true };
  }

  /**
   * Creates a Nomod Hosted Checkout session and returns the checkout URL.
   */
  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Nomod] Preparing Checkout Session for Order:", request.orderId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bossperfumes.com";
    const successReturnUrl = request.successUrl || `${appUrl}/checkout/success?order_id=${request.orderId}`;
    const failureReturnUrl = request.failureUrl || request.cancelUrl || `${appUrl}/checkout?error=nomod_failed`;

    // 1. Direct Nomod Links API Flow (using X-API-KEY)
    if (this.apiKey) {
      try {
        console.log("[Nomod] Creating direct payment link via Nomod API...");
        const items = (request.items || []).map((item: any, idx: number) => {
          const unitAmount = parseFloat(item.price || item.unit_price || "0").toFixed(2);
          return {
            name: item.name || `Item #${idx + 1}`,
            quantity: item.quantity || 1,
            amount: unitAmount,
          };
        });

        const amountStr = request.amount.toFixed(2);
        const payload: any = {
          currency: request.currency || "AED",
          title: `Boss Perfumes - Order #${request.orderId}`,
          note: `Order #${request.orderId}`,
          items: items.length > 0 ? items : [
            {
              name: `Order #${request.orderId}`,
              amount: amountStr,
              quantity: 1,
            }
          ],
          success_url: successReturnUrl,
          failure_url: failureReturnUrl,
        };

        const res = await fetch(`${this.apiUrl}/links`, {
          method: "POST",
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("[Nomod] Payment Link Created Successfully:", data.id, "URL:", data.url);
          const redirectUrl = data.url || data.link;
          if (redirectUrl) {
            return {
              sessionId: data.id || String(request.orderId),
              redirectUrl,
            };
          }
        } else {
          const errorText = await res.text();
          console.warn("[Nomod] Direct Links API returned error, falling back to WooCommerce order-pay:", errorText);
        }
      } catch (err) {
        console.error("[Nomod] Direct Links API exception, falling back to WooCommerce order-pay:", err);
      }
    }

    // 2. Fallback to WooCommerce Nomod Plugin Order-Pay URL
    console.log("[Nomod] Routing via WooCommerce Nomod Plugin Order-Pay...");
    const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL || "https://cms.bossperfumes.com";
    const cleanStoreUrl = storeUrl.replace(/\/+$/, "");
    const orderKeyParam = request.orderKey ? `&key=${encodeURIComponent(request.orderKey)}` : "";
    let redirectUrl = request.paymentUrl || `${cleanStoreUrl}/checkout/order-pay/${request.orderId}/?pay_for_order=true${orderKeyParam}`;

    if (!redirectUrl.includes("return_url=")) {
      redirectUrl += `${redirectUrl.includes("?") ? "&" : "?"}return_url=${encodeURIComponent(successReturnUrl)}`;
    }

    console.log("[Nomod WooCommerce] Redirect URL:", redirectUrl);
    return {
      sessionId: `nomod_wc_${request.orderId}`,
      redirectUrl,
    };
  }

  /**
   * Verifies incoming webhook signature from Nomod using HMAC-SHA256.
   */
  verifyWebhook(headers: Headers, rawBody: string): boolean {
    if (!this.webhookSecret) {
      console.warn("[Nomod] NOMOD_WEBHOOK_SECRET is not configured. Skipping webhook signature verification.");
      return true;
    }

    const signature =
      headers.get("x-nomod-signature") ||
      headers.get("nomod-signature") ||
      headers.get("x-signature");

    if (!signature) {
      console.warn("[Nomod] Missing webhook signature header.");
      return false;
    }

    try {
      const calculatedHash = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(rawBody, "utf8")
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature.toLowerCase()),
        Buffer.from(calculatedHash.toLowerCase())
      );
    } catch (e) {
      console.error("[Nomod] Webhook verification error:", e);
      return false;
    }
  }

  /**
   * Handles Nomod webhook payload and maps it to standardized WooCommerce order status.
   */
  async handleWebhookEvent(payload: any): Promise<{
    orderId: number;
    status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded";
    eventId?: string;
    transactionId?: string;
    provider?: string;
    metadata?: Record<string, any>;
  } | null> {
    if (!payload) return null;

    // Nomod events can be wrapped in `data` or top-level
    const data = payload.data || payload;
    const eventType = payload.event || payload.type || data.status;

    const referenceId = data.reference_id || data.metadata?.order_id || payload.reference_id;
    if (!referenceId) {
      console.warn("[Nomod] Webhook event missing reference_id / order_id:", payload);
      return null;
    }

    const orderId = parseInt(String(referenceId), 10);
    if (isNaN(orderId)) return null;

    const transactionId = data.id || data.charge_id || data.transaction_id || payload.id;
    const statusStr = String(data.status || eventType || "").toLowerCase();

    let status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "failed";

    if (
      statusStr.includes("success") ||
      statusStr.includes("completed") ||
      statusStr.includes("paid") ||
      statusStr.includes("captured")
    ) {
      status = "completed";
    } else if (statusStr.includes("authorized")) {
      status = "authorized";
    } else if (statusStr.includes("refund")) {
      status = "refunded";
    } else if (statusStr.includes("pending") || statusStr.includes("created")) {
      status = "pending";
    } else if (statusStr.includes("cancel")) {
      status = "cancelled";
    } else {
      status = "failed";
    }

    return {
      orderId,
      status,
      transactionId: transactionId ? String(transactionId) : undefined,
      eventId: `nomod_evt_${transactionId || orderId}_${status}`,
      provider: "Nomod",
      metadata: {
        _nomod_transaction_id: transactionId ? String(transactionId) : "",
        _nomod_status: statusStr,
        _nomod_payment_method: data.payment_method || data.source?.type || "card",
      },
    };
  }
}
