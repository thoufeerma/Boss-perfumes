import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import { paymentConfig } from "./config";

export class TelrProvider implements PaymentProvider {
  private storeId: string;
  private authKey: string;

  constructor() {
    this.storeId = paymentConfig.telr.storeId || "";
    this.authKey = paymentConfig.telr.authKey || "";
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Telr] Preparing Payment Session...");
    
    if (!this.storeId || !this.authKey) {
      throw new Error("Telr merchant credentials are not configured.");
    }

    // TODO: Implement actual Telr Hosted Payment Page creation logic
    
    return {
      sessionId: "telr_placeholder_session",
      redirectUrl: "http://localhost:3000/checkout/success", // Placeholder
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    // TODO: Implement Telr webhook signature verification
    return false;
  }

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "approved" | "declined" | "captured" | "refunded" | "voided" | "unknown", transactionId?: string, provider?: string } | null> {
    // TODO: Implement Telr webhook parsing
    return null;
  }
}
