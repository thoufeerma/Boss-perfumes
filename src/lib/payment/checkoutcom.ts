import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import crypto from "crypto";
import { paymentConfig } from "./config";

export class CheckoutComProvider implements PaymentProvider {
  private secretKey: string;
  private publicKey: string;
  private isSandbox: boolean;
  private processingChannelId: string;

  constructor() {
    this.secretKey = paymentConfig.checkoutcom.secretKey || "";
    this.publicKey = paymentConfig.checkoutcom.publicKey || "";
    this.processingChannelId = paymentConfig.checkoutcom.processingChannelId || "";
    this.isSandbox = this.secretKey.includes("sbox");
  }

  private get baseUrl() {
    return this.isSandbox 
      ? "https://api.sandbox.checkout.com" 
      : "https://api.checkout.com";
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Checkout.com] Preparing Hosted Payment Session...");
    console.log("CHECKOUT_PUBLIC_KEY loaded:", this.publicKey ? `Yes (${this.publicKey.substring(0, 7)}...)` : "No");
    console.log("CHECKOUT_SECRET_KEY loaded:", this.secretKey ? "Yes (***)" : "No");
    console.log("CHECKOUT_PROCESSING_CHANNEL_ID loaded:", this.processingChannelId ? `Yes (${this.processingChannelId})` : "No");
    
    const url = `${this.baseUrl}/hosted-payments`;
    console.log("Endpoint:", url);

    // Convert amount to minor units
    const amountInMinorUnits = Math.round(request.amount * 100);

    const payload = {
      amount: amountInMinorUnits,
      currency: request.currency,
      reference: request.reference || request.orderId.toString(),
      success_url: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
      cancel_url: request.cancelUrl || request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`,
      failure_url: request.failureUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failed`,
      processing_channel_id: this.processingChannelId,
      customer: {
        email: request.customerEmail,
        name: request.customerName,
      },
      billing: {
        address: {
          country: request.billing?.country || "AE"
        }
      }
    };
    
    console.log("Request Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error("Checkout.com Raw Error:", errorText);
        throw new Error(`Failed to create Checkout.com session: ${response.statusText}`);
      }
      
      console.error("Checkout.com Validation Error JSON:", JSON.stringify(errorData, null, 2));
      
      const errorMsg = errorData.error_codes 
        ? errorData.error_codes.join(", ") 
        : (errorData.message || response.statusText);
        
      throw new Error(`Checkout.com API Error: ${errorMsg}`);
    }

    const data = await response.json();
    console.log("Checkout.com Success JSON:", JSON.stringify(data, null, 2));

    return {
      sessionId: data.id,
      publicKey: this.publicKey,
      redirectUrl: data._links?.redirect?.href,
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    // Standard Checkout.com webhook signature verification
    // Checkout.com sends signature in the 'Cko-Signature' header
    const signature = headers.get("cko-signature");
    if (!signature) return false;

    // The secret is configured in the Checkout.com Dashboard for the webhook
    const webhookSecret = process.env.CHECKOUT_WEBHOOK_SECRET;
    
    // If no secret is configured, we accept it for now (in a real prod app, enforce this)
    if (!webhookSecret) {
      console.warn("CHECKOUT_WEBHOOK_SECRET is not set. Skipping signature verification.");
      return true;
    }

    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody, "utf8")
      .digest("hex");

    return hash === signature;
  }

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "approved" | "declined" | "captured" | "refunded" | "voided" | "unknown", transactionId?: string, provider?: string } | null> {
    if (!payload || !payload.type || !payload.data) {
      return null;
    }

    const eventType = payload.type;
    const reference = payload.data.reference; // This should be our WooCommerce Order ID
    if (!reference) return null;

    const orderId = parseInt(reference, 10);
    if (isNaN(orderId)) return null;

    let status: "approved" | "declined" | "captured" | "refunded" | "voided" | "unknown" = "unknown";

    switch (eventType) {
      case "payment_approved":
        status = "approved";
        break;
      case "payment_captured":
        status = "captured";
        break;
      case "payment_declined":
        status = "declined";
        break;
      case "payment_refunded":
        status = "refunded";
        break;
      case "payment_voided":
        status = "voided";
        break;
      default:
        return null;
    }

    const transactionId = payload.data.id || payload.data.action_id;

    return { orderId, status, transactionId, provider: "Checkout.com" };
  }
}
