import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import { paymentConfig } from "./config";
import crypto from "crypto";

export class PaymobProvider implements PaymentProvider {
  private apiKey: string;
  private secretKey: string;
  private publicKey: string;
  private integrationId: string;
  private iframeId: string;
  private hmacSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = paymentConfig.paymob.apiKey || "";
    this.secretKey = paymentConfig.paymob.secretKey || "";
    this.publicKey = paymentConfig.paymob.publicKey || "";
    this.integrationId = paymentConfig.paymob.integrationId || "";
    this.iframeId = paymentConfig.paymob.iframeId || "";
    this.hmacSecret = paymentConfig.paymob.hmacSecret || "";
    this.baseUrl = (paymentConfig.paymob.baseUrl || "https://uae.paymob.com").replace(/\/+$/, "");
  }

  async isEligible(cartData: any): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };
    // Paymob supports standard credit/debit cards across MENA & worldwide
    return { eligible: true };
  }

  /**
   * Creates a payment session with Paymob.
   * Supports both:
   * 1. Modern Unified Checkout / Intention API (if secretKey is configured)
   * 2. Classic 3-Step Accept Flow (if apiKey is configured)
   */
  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Paymob] Preparing Payment Session...");

    const amountInCents = Math.round(request.amount * 100);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payment/paymob/callback`;

    // ----------------------------------------------------
    // Approach A: Modern Unified Checkout / Intention API
    // ----------------------------------------------------
    if (this.secretKey) {
      console.log("[Paymob] Using Intention API...");
      const payload = {
        amount: amountInCents,
        currency: request.currency,
        payment_methods: this.integrationId ? [parseInt(this.integrationId, 10)] : undefined,
        billing_data: {
          first_name: request.billing?.first_name || request.customerName?.split(" ")[0] || "Customer",
          last_name: request.billing?.last_name || request.customerName?.split(" ").slice(1).join(" ") || "Shopper",
          phone_number: request.billing?.phone || "+971500000000",
          email: request.customerEmail,
          apartment: "NA",
          floor: "NA",
          street: request.billing?.address_1 || "NA",
          building: "NA",
          postal_code: request.billing?.postcode || "00000",
          city: request.billing?.city || "Dubai",
          country: request.billing?.country || "AE",
          state: request.billing?.state || "Dubai",
        },
        special_reference: request.orderId.toString(),
        redirection_url: callbackUrl,
        items: (request.items || []).map((item: any) => ({
          name: item.name || "Product",
          amount: Math.round((parseFloat(item.price || "0")) * 100) || amountInCents,
          description: item.name || "Item",
          quantity: item.quantity || 1,
        })),
      };

      const res = await fetch(`${this.baseUrl}/v1/intention/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Paymob] Intention API error:", errorText);
        throw new Error(`Paymob Intention API error: ${res.statusText}`);
      }

      const data = await res.json();
      const clientSecret = data.client_secret;
      const publicKey = this.publicKey || data.public_key;

      const redirectUrl = `${this.baseUrl}/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

      return {
        sessionId: data.id ? String(data.id) : clientSecret,
        publicKey: publicKey,
        redirectUrl: redirectUrl,
      };
    }

    // ----------------------------------------------------
    // Approach B: Classic 3-Step Accept Flow
    // ----------------------------------------------------
    if (!this.apiKey) {
      throw new Error("Paymob credentials are not configured (PAYMOB_API_KEY or PAYMOB_SECRET_KEY missing).");
    }

    if (!this.integrationId) {
      throw new Error("Paymob PAYMOB_INTEGRATION_ID is not configured.");
    }

    // Step 1: Authentication Token
    console.log("[Paymob] Step 1: Requesting auth token...");
    const authRes = await fetch(`${this.baseUrl}/api/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: this.apiKey }),
    });

    if (!authRes.ok) {
      const err = await authRes.text();
      console.error("[Paymob] Step 1 Auth Token Error:", err);
      throw new Error(`Paymob authentication failed: ${authRes.statusText}`);
    }
    const { token: authToken } = await authRes.json();

    // Step 2: Register Order
    console.log("[Paymob] Step 2: Registering order...");
    const orderPayload = {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountInCents.toString(),
      currency: request.currency,
      merchant_order_id: request.orderId.toString(),
      items: [],
    };

    const orderRes = await fetch(`${this.baseUrl}/api/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error("[Paymob] Step 2 Order Registration Error:", err);
      throw new Error(`Paymob order registration failed: ${orderRes.statusText}`);
    }
    const orderData = await orderRes.json();
    const paymobOrderId = orderData.id;

    // Step 3: Payment Key Request
    console.log("[Paymob] Step 3: Obtaining payment key token...");
    const keyPayload = {
      auth_token: authToken,
      amount_cents: amountInCents.toString(),
      expiration: 3600,
      order_id: paymobOrderId.toString(),
      billing_data: {
        apartment: "NA",
        email: request.customerEmail,
        floor: "NA",
        first_name: request.billing?.first_name || request.customerName?.split(" ")[0] || "Customer",
        street: request.billing?.address_1 || "NA",
        building: "NA",
        phone_number: request.billing?.phone || "+971500000000",
        shipping_method: "PKG",
        postal_code: request.billing?.postcode || "00000",
        city: request.billing?.city || "Dubai",
        country: request.billing?.country || "AE",
        last_name: request.billing?.last_name || request.customerName?.split(" ").slice(1).join(" ") || "Shopper",
        state: request.billing?.state || "Dubai",
      },
      currency: request.currency,
      integration_id: parseInt(this.integrationId, 10),
      lock_order_when_paid: "true",
    };

    const keyRes = await fetch(`${this.baseUrl}/api/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keyPayload),
    });

    if (!keyRes.ok) {
      const err = await keyRes.text();
      console.error("[Paymob] Step 3 Payment Key Error:", err);
      throw new Error(`Paymob payment key generation failed: ${keyRes.statusText}`);
    }

    const { token: paymentKey } = await keyRes.json();

    // Step 4: Construct redirect URL (using Iframe or standalone acceptance link)
    const iframeId = this.iframeId;
    const redirectUrl = iframeId
      ? `${this.baseUrl}/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`
      : `${this.baseUrl}/standalone/?ref=${paymentKey}`;

    return {
      sessionId: String(paymobOrderId),
      redirectUrl: redirectUrl,
    };
  }

  /**
   * Verifies Paymob's HMAC-SHA512 signature on webhooks and transaction callbacks.
   */
  verifyWebhook(headers: Headers, rawBody: string): boolean {
    if (!this.hmacSecret) {
      console.warn("[Paymob] PAYMOB_HMAC_SECRET is not configured. Skipping HMAC verification.");
      return true;
    }

    try {
      const payload = JSON.parse(rawBody);
      const signature = headers.get("hmac") || headers.get("x-paymob-signature");

      // Paymob webhook JSON encapsulates transaction data inside `obj`
      const obj = payload.obj || payload;
      if (!obj) return false;

      const calculatedHmac = this.calculateHmac(obj);

      if (signature) {
        return calculatedHmac.toLowerCase() === signature.toLowerCase();
      }

      return true;
    } catch (e) {
      console.error("[Paymob] HMAC verification error:", e);
      return false;
    }
  }

  /**
   * Computes Paymob HMAC-SHA512 over sorted transaction fields.
   */
  public calculateHmac(obj: Record<string, any>): string {
    const fields = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id !== undefined ? obj.order.id : obj.order,
      obj.owner,
      obj.pending,
      obj.source_data?.pan !== undefined ? obj.source_data.pan : obj["source_data.pan"],
      obj.source_data?.sub_type !== undefined ? obj.source_data.sub_type : obj["source_data.sub_type"],
      obj.source_data?.type !== undefined ? obj.source_data.type : obj["source_data.type"],
      obj.success,
    ];

    const concatenated = fields
      .map((val) => (val === undefined || val === null ? "" : String(val)))
      .join("");

    return crypto
      .createHmac("sha512", this.hmacSecret)
      .update(concatenated, "utf8")
      .digest("hex");
  }

  /**
   * Parses Paymob webhook payload to update WooCommerce order state.
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

    const obj = payload.obj || payload;
    if (!obj || !obj.id) return null;

    // Resolve WooCommerce order ID from merchant_order_id or special_reference
    const merchantOrderId =
      obj.order?.merchant_order_id ||
      obj.merchant_order_id ||
      obj.special_reference;

    if (!merchantOrderId) {
      console.warn("[Paymob] Webhook payload missing merchant_order_id:", obj.id);
      return null;
    }

    const orderId = parseInt(String(merchantOrderId), 10);
    if (isNaN(orderId)) return null;

    const transactionId = String(obj.id);
    const isSuccess = Boolean(obj.success);
    const isPending = Boolean(obj.pending);
    const isRefunded = Boolean(obj.is_refunded);
    const isAuth = Boolean(obj.is_auth);

    let status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "failed";

    if (isRefunded) {
      status = "refunded";
    } else if (isSuccess) {
      status = isAuth ? "authorized" : "completed";
    } else if (isPending) {
      status = "pending";
    } else {
      status = "failed";
    }

    return {
      orderId,
      status,
      transactionId,
      eventId: `paymob_txn_${transactionId}`,
      provider: "Paymob",
      metadata: {
        _paymob_transaction_id: transactionId,
        _paymob_order_id: String(obj.order?.id || ""),
        _paymob_payment_sub_type: obj.source_data?.sub_type || "",
        _paymob_pan: obj.source_data?.pan || "",
      },
    };
  }
}
