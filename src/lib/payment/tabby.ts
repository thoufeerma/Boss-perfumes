import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import crypto from "crypto";
import { paymentConfig } from "./config";

export class TabbyProvider implements PaymentProvider {
  private secretKey: string;
  private publicKey: string;
  private merchantCode: string;
  private apiUrl: string;

  constructor() {
    this.secretKey = paymentConfig.tabby.secretKey || "";
    this.publicKey = paymentConfig.tabby.publicKey || "";
    this.merchantCode = paymentConfig.tabby.merchantCode || "";
    this.apiUrl = paymentConfig.tabby.apiUrl || "https://api.tabby.ai/api/v2";
  }

  isEligible(cartData: any): { eligible: boolean; reason?: string } {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };
    
    const minAmount = paymentConfig.tabby.minAmount || 10;
    const maxAmount = paymentConfig.tabby.maxAmount || 5000;
    const supportedCurrencies = paymentConfig.tabby.supportedCurrencies || ["AED", "SAR", "KWD", "BHD", "QAR", "EGP"];

    const total = parseFloat(cartData.totals?.total_price || "0") / (10 ** (cartData.totals?.currency_minor_unit || 2));
    const currency = cartData.totals?.currency_code || "AED";

    if (!supportedCurrencies.includes(currency)) {
      return { eligible: false, reason: `Currency ${currency} not supported` };
    }
    
    if (total < minAmount) {
      return { eligible: false, reason: `Minimum order amount of ${minAmount} ${currency} not met` };
    }

    if (total > maxAmount) {
      return { eligible: false, reason: `Maximum order amount of ${maxAmount} ${currency} exceeded` };
    }

    return { eligible: true };
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Tabby] Preparing Payment Session...");
    
    if (!this.secretKey || !this.publicKey) {
      throw new Error("Tabby credentials are not configured.");
    }

    const payload = {
      payment: {
        amount: request.amount.toFixed(2),
        currency: request.currency,
        description: `Order ${request.orderId}`,
        buyer: {
          email: request.customerEmail,
          name: request.customerName || "",
          phone: request.billing?.phone || "",
        },
        order: {
          reference_id: request.reference || request.orderId.toString(),
          items: [], // Map items here if necessary
        },
        buyer_history: {
          registered_since: new Date().toISOString()
        }
      },
      lang: "en",
      merchant_code: this.merchantCode,
      merchant_urls: {
        success: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
        cancel: request.cancelUrl || request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`,
        failure: request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`
      }
    };

    const response = await fetch(`${this.apiUrl}/checkout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`, // Tabby v2 uses public key for checkout creation in some integrations, or secret key. Using secret key is safer for backend.
        // Wait, Tabby docs say: "Include your secret_key in the request header...". Let's use secretKey.
      },
    });

    // We'll update headers to use secretKey.
    const res = await fetch(`${this.apiUrl}/checkout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Tabby Raw Error:", errorText);
      throw new Error(`Failed to create Tabby session: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Tabby Success:", JSON.stringify(data, null, 2));

    return {
      sessionId: data.payment?.id || data.id,
      redirectUrl: data.configuration?.available_products?.installments?.[0]?.web_url || data.payment?.web_url,
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    const signature = headers.get("x-tabby-signature");
    if (!signature) return false;

    const webhookSecret = paymentConfig.tabby.webhookSecret;
    if (!webhookSecret) {
      console.warn("TABBY_WEBHOOK_SECRET is not set. Skipping signature verification.");
      return true;
    }

    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody, "utf8")
      .digest("hex");

    return hash === signature;
  }

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded", transactionId?: string, provider?: string } | null> {
    if (!payload || !payload.id || !payload.status) {
      return null;
    }

    const eventStatus = payload.status;
    const reference = payload.order?.reference_id;
    if (!reference) return null;

    const orderId = parseInt(reference, 10);
    if (isNaN(orderId)) return null;

    let status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "pending";

    switch (eventStatus.toUpperCase()) {
      case "AUTHORIZED":
        status = "authorized";
        break;
      case "CLOSED":
        status = "completed";
        break;
      case "REJECTED":
      case "EXPIRED":
      case "FAILED":
        status = "failed";
        break;
      default:
        return null;
    }

    return { orderId, status, transactionId: payload.id, provider: "Tabby" };
  }
}
