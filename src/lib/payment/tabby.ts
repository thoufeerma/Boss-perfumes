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

  async isEligible(cartData: any): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };
    
    // Fail-safe approach: if keys are missing or API fails, default to true
    if (!this.secretKey) return { eligible: true };

    const amount = (parseFloat(cartData.totals?.total_price || "0") / (10 ** (cartData.totals?.currency_minor_unit || 2))).toFixed(2);
    const currency = cartData.totals?.currency_code || "AED";

    const payload = {
      payment: {
        amount,
        currency,
        buyer: {
          email: cartData.billing_address?.email || "guest@example.com",
          phone: cartData.billing_address?.phone || "+971500000000"
        }
      },
      lang: "en",
      merchant_code: this.merchantCode
    };

    try {
      const res = await fetch(`${this.apiUrl}/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return { eligible: true }; // Fail-safe
      }

      const data = await res.json();
      
      if (data.status === "rejected") {
        const reason = data.configuration?.products?.installments?.rejection_reason;
        let uiMessage = "Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method for your order.\nنأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى.";
        
        if (reason === "order_amount_too_high") {
          uiMessage = "This purchase is above your current spending limit with Tabby, try a smaller cart or use another payment method\nقيمة الطلب تفوق الحد الأقصى المسموح به حاليًا مع تابي. يُرجى تخفيض قيمة السلة أو استخدام وسيلة دفع أخرى.";
        } else if (reason === "order_amount_too_low") {
          uiMessage = "The purchase amount is below the minimum amount required to use Tabby, try adding more items or use another payment method\nقيمة الطلب أقل من الحد الأدنى المسموح به حاليًا مع تابي. يُرجى زيادة قيمة السلة أو استخدام وسيلة دفع أخرى.";
        }
        
        return { eligible: false, reason: uiMessage };
      }
      
      return { eligible: true };
    } catch (e) {
      return { eligible: true }; // Fail-safe
    }
  }

  async createSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    console.log("[Tabby] Preparing Payment Session...");
    
    if (!this.secretKey || !this.publicKey) {
      throw new Error("Tabby credentials are not configured.");
    }

    const buyerHistory = request.buyerHistory || { registered_since: new Date().toISOString() };
    const orderHistory = request.orderHistory || [];

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
        shipping_address: {
          city: request.shipping?.city || request.billing?.city || "Unknown",
          address: request.shipping?.address_1 || request.billing?.address_1 || "Unknown",
          zip: request.shipping?.postcode || request.billing?.postcode || "00000",
        },
        order: {
          reference_id: request.reference || request.orderId.toString(),
          items: request.items ? request.items.map(item => ({
            reference_id: item.sku || item.product_id?.toString() || item.id?.toString(),
            title: item.name || item.title || "Product",
            quantity: item.quantity || 1,
            unit_price: item.prices?.price 
              ? (parseFloat(item.prices.price) / (10 ** (item.prices.currency_minor_unit || 2))).toFixed(2)
              : (parseFloat(item.price || "0")).toFixed(2),
            image_url: item.image || item.images?.[0]?.src || "",
            product_url: item.permalink || "",
            category: item.categories?.[0]?.name || item.category || "Perfumes",
            brand: "Boss Perfumes",
          })) : [],
        },
        buyer_history: buyerHistory,
        order_history: orderHistory,
      },
      lang: "en",
      merchant_code: this.merchantCode,
      merchant_urls: {
        success: request.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
        cancel: request.cancelUrl 
            ? (request.cancelUrl.includes('?') ? `${request.cancelUrl}&error=tabby_cancel` : `${request.cancelUrl}?error=tabby_cancel`)
            : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?error=tabby_cancel`,
        failure: request.failureUrl 
            ? (request.failureUrl.includes('?') ? `${request.failureUrl}&error=tabby_failed` : `${request.failureUrl}?error=tabby_failed`)
            : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?error=tabby_failed`
      }
    };

    const response = await fetch(`${this.apiUrl}/checkout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.publicKey}`, // Tabby v2 uses public key for checkout creation in some integrations, or secret key. Using secret key is safer for backend.
        // Wait, Tabby docs say: "Include your secret_key in the request header...". Let's use secretKey.
      },
    });

    console.log("TABBY SESSION PAYLOAD:", JSON.stringify(payload, null, 2));

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
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {}

      if (errorData?.rejection_reason === "not_available") {
        throw new Error("Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method for your order. / نأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى.");
      } else if (errorData?.rejection_reason === "order_amount_too_high") {
        throw new Error("This purchase is above your current spending limit with Tabby, try a smaller cart or use another payment method / قيمة الطلب تفوق الحد الأقصى المسموح به حاليًا مع تابي. يُرجى تخفيض قيمة السلة أو استخدام وسيلة دفع أخرى.");
      }
      throw new Error(`Failed to create Tabby session: ${errorData?.error || res.statusText}`);
    }

    const data = await res.json();
    console.log("Tabby Success:", JSON.stringify(data, null, 2));

    return {
      sessionId: data.payment?.id || data.id,
      redirectUrl: data.configuration?.available_products?.installments?.[0]?.web_url || data.payment?.web_url,
    };
  }

  verifyWebhook(headers: Headers, rawBody: string): boolean {
    const secret = headers.get("x-tabby-webhook-secret");
    if (!secret) {
      console.warn("Tabby webhook custom header missing. Headers received:", Array.from(headers.keys()).join(", "));
      return false;
    }

    const expectedSecret = process.env.TABBY_WEBHOOK_SECRET;
    if (!expectedSecret) {
      console.warn("TABBY_WEBHOOK_SECRET is not set in environment.");
      return false;
    }

    const cleanSecret = secret.replace(/['"]/g, '').trim();
    const cleanExpected = expectedSecret.replace(/['"]/g, '').trim();

    if (cleanSecret !== cleanExpected) {
      console.warn(`Webhook secret mismatch! Received length: ${cleanSecret.length}, Expected length: ${cleanExpected.length}.`);
      console.warn(`Received starts with: ${cleanSecret.substring(0, 3)}..., Expected starts with: ${cleanExpected.substring(0, 3)}...`);
      return false;
    }

    return true;
  }

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded", transactionId?: string, provider?: string, metadata?: Record<string, any> } | null> {
    if (!payload || !payload.id || !payload.status) {
      return null;
    }

    const eventStatus = payload.status.toLowerCase();
    const reference = payload.order?.reference_id;
    if (!reference) return null;

    const orderId = parseInt(reference, 10);
    if (isNaN(orderId)) return null;

    const paymentId = payload.id;
    let status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded" = "pending";
    let captureId: string | undefined = undefined;

    if (eventStatus === "authorized") {
      try {
        console.log(`[Tabby Webhook] Authorized event for payment ${paymentId}. Retrieving payment...`);
        const retrieveRes = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.secretKey}`,
          },
        });

        if (!retrieveRes.ok) {
          console.error(`[Tabby Webhook] Failed to retrieve payment ${paymentId}`);
          return null;
        }

        const retrieveData = await retrieveRes.json();
        
        if (retrieveData.status === "AUTHORIZED") {
          console.log(`[Tabby Webhook] Payment ${paymentId} is AUTHORIZED. Initiating capture...`);
          const captureRes = await fetch(`${this.apiUrl}/payments/${paymentId}/captures`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: retrieveData.amount,
              reference_id: `capture_${orderId}_${paymentId}` // Idempotent reference
            })
          });

          if (!captureRes.ok) {
             const errText = await captureRes.text();
             console.error(`[Tabby Webhook] Capture failed for payment ${paymentId}:`, errText);
             return null;
          }

          const captureData = await captureRes.json();
          if (captureData.status === "CLOSED" || retrieveData.status === "CLOSED") { // Capture sometimes updates the main payment status
             console.log(`[Tabby Webhook] Capture successful for ${paymentId}.`);
             status = "processing";
             captureId = captureData.id;
          } else {
             console.warn(`[Tabby Webhook] Capture returned unexpected status for ${paymentId}:`, captureData.status);
             return null;
          }
        } else if (retrieveData.status === "CLOSED") {
           console.log(`[Tabby Webhook] Payment ${paymentId} already CLOSED.`);
           status = "processing";
        } else {
           console.log(`[Tabby Webhook] Payment ${paymentId} status is ${retrieveData.status}, not capturing.`);
           return null;
        }
      } catch (err) {
        console.error(`[Tabby Webhook] Error during retrieve/capture flow for ${paymentId}:`, err);
        return null;
      }
    } else if (eventStatus === "closed") {
      status = "processing";
    } else if (eventStatus === "rejected" || eventStatus === "expired" || eventStatus === "failed") {
      status = "failed";
    } else {
      return null; // created, etc
    }

    const metadata: Record<string, any> = {
      _tabby_payment_id: paymentId,
      _tabby_status: eventStatus,
    };
    if (captureId) {
      metadata._tabby_capture_id = captureId;
    }

    return { orderId, status, transactionId: paymentId, provider: "Tabby", metadata };
  }
}
