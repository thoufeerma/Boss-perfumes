import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import { paymentConfig } from "./config";
import crypto from "crypto";

export class TelrProvider implements PaymentProvider {
  private storeId: string;
  private authKey: string;
  private gatewayUrl: string;

  constructor() {
    this.storeId = paymentConfig.telr.storeId || "";
    this.authKey = paymentConfig.telr.authKey || "";
    this.gatewayUrl = paymentConfig.telr.gatewayUrl || "https://secure.telr.com/gateway/order.json";
  }

  async isEligible(cartData: any): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };
    return { eligible: true };
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Telr] Preparing Payment Session...");
    
    if (!this.storeId || !this.authKey) {
      throw new Error("Telr merchant credentials are not configured.");
    }

    const payload = {
      ivp_method: "create",
      ivp_store: this.storeId,
      ivp_authkey: this.authKey,
      ivp_cart: request.reference || request.orderId.toString(),
      ivp_test: "1", // Set to 0 for production, this should ideally be in config
      ivp_amount: request.amount.toFixed(2),
      ivp_currency: request.currency,
      ivp_desc: `Order ${request.orderId}`,
      return_auth: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
      return_can: request.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`,
      return_decl: request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`,
      bill_fname: request.customerName?.split(" ")[0] || "Customer",
      bill_sname: request.customerName?.split(" ").slice(1).join(" ") || "",
      bill_addr1: request.billing?.address_1 || "Dubai",
      bill_city: request.billing?.city || "Dubai",
      bill_country: request.billing?.country || "AE",
      bill_email: request.customerEmail,
    };

    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, value as string);
    }

    const res = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Telr Raw Error:", errorText);
      throw new Error(`Failed to create Telr session: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Telr Success:", JSON.stringify(data, null, 2));

    if (data.error) {
      throw new Error(`Telr API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return {
      sessionId: data.order?.ref || "",
      redirectUrl: data.order?.url,
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    const signature = headers.get("X-Telr-Signature");
    if (!signature) return false;

    const webhookSecret = paymentConfig.telr.webhookSecret;
    if (!webhookSecret) {
      console.warn("TELR_WEBHOOK_SECRET is not set. Skipping signature verification.");
      return true;
    }

    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody, "utf8")
      .digest("hex");

    return hash === signature;
  }

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded", transactionId?: string, provider?: string } | null> {
    if (!payload || !payload.cart_id) {
      return null;
    }

    const eventStatus = payload.order_status; // A for Authorized, H for Held, etc.
    const reference = payload.cart_id;
    if (!reference) return null;

    const orderId = parseInt(reference, 10);
    if (isNaN(orderId)) return null;

    let status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "pending";

    // Standard Telr response codes A (Authorised), H (Held), P (Pending), E (Error), D (Declined), C (Cancelled)
    switch (eventStatus) {
      case "A":
        status = "completed"; // Or authorized depending on integration
        break;
      case "H":
      case "P":
        status = "processing";
        break;
      case "E":
      case "D":
        status = "failed";
        break;
      case "C":
        status = "cancelled";
        break;
      default:
        return null;
    }

    return { orderId, status, transactionId: payload.tran_ref, provider: "Telr" };
  }
}
