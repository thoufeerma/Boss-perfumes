import { PaymentProvider, PaymentSessionRequest, PaymentSessionResponse } from "./types";
import crypto from "crypto";
import { paymentConfig } from "./config";
import { paymentMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/** The only market Tabby is contracted for. Expanding to the GCC means adding codes here. */
export const TABBY_SUPPORTED_COUNTRIES = ["AE"];

/** Tabby's `Currency` enum admits exactly these two; anything else is a 400 from their API. */
export const TABBY_SUPPORTED_CURRENCIES = ["AED", "SAR"];

/** A refund entry as Tabby appends it to a payment's `refunds` array. */
interface TabbyRefund {
  id?: string;
  amount?: string;
  created_at?: string;
  reference_id?: string;
  reason?: string;
}

/** Maps Tabby's rejection_reason to the message shown to the shopper, in their language. */
function rejectionMessage(reason: string | undefined, locale: Locale): string {
  const m = paymentMessages(locale).tabby;
  switch (reason) {
    case "order_amount_too_high":
      return m.amountTooHigh;
    case "order_amount_too_low":
      return m.amountTooLow;
    default:
      return m.notAvailable;
  }
}

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

  async isEligible(cartData: any, locale: Locale = DEFAULT_LOCALE): Promise<{ eligible: boolean; reason?: string }> {
    if (!cartData) return { eligible: false, reason: "Cart data missing" };

    const m = paymentMessages(locale).tabby;
    const currency = String(cartData.totals?.currency_code || "AED").toUpperCase();

    // Market and currency gates run BEFORE the fail-safe below: availability must never
    // depend on Tabby's API being reachable. An empty country means the shopper has not
    // chosen one yet and checkout defaults to AE, so only an explicit non-AE choice
    // disqualifies - which is the case Tabby's QA reported.
    const country = String(
      cartData.billing_address?.country || cartData.shipping_address?.country || ""
    ).trim().toUpperCase();

    if (country && !TABBY_SUPPORTED_COUNTRIES.includes(country)) {
      return { eligible: false, reason: m.countryUnsupported };
    }

    if (!TABBY_SUPPORTED_CURRENCIES.includes(currency)) {
      return { eligible: false, reason: m.currencyUnsupported };
    }

    // Fail-safe approach: if keys are missing or API fails, default to true
    if (!this.secretKey) return { eligible: true };

    const amount = (parseFloat(cartData.totals?.total_price || "0") / (10 ** (cartData.totals?.currency_minor_unit || 2))).toFixed(2);

    const payload = {
      payment: {
        amount,
        currency,
        buyer: {
          email: cartData.billing_address?.email || "guest@example.com",
          phone: (cartData.billing_address?.phone || "+971500000000").replace("+971", "").replace("00971", "").replace(/^05/, "5")
        }
      },
      lang: locale,
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
        return { eligible: false, reason: rejectionMessage(reason, locale) };
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

    // Drives both the rejection messages we surface and Tabby's own hosted checkout, so
    // the shopper does not get bounced from an Arabic storefront into an English HPP.
    const locale = request.locale ?? DEFAULT_LOCALE;

    // Only `registered_since` is required. The is_*_verified / is_social_networks_connected
    // flags are deliberately omitted rather than asserted: we have no social login and do not
    // verify guest emails or phones, and these feed Tabby's risk scoring.
    const buyerHistory = request.buyerHistory
      ? { registered_since: new Date().toISOString(), ...request.buyerHistory }
      : { registered_since: new Date().toISOString(), loyalty_level: 0 };

    // Normalize phone number to match Tabby's preferred format
    let formattedPhone = request.billing?.phone || "500000000";
    formattedPhone = formattedPhone.replace(/\s+/g, '');
    if (formattedPhone.startsWith("+971")) formattedPhone = formattedPhone.replace("+971", "");
    if (formattedPhone.startsWith("00971")) formattedPhone = formattedPhone.replace("00971", "");
    if (formattedPhone.startsWith("05")) formattedPhone = formattedPhone.substring(1);

    const orderHistory = request.orderHistory ? request.orderHistory.map((oh: any) => {
      // Remove country from history shipping address if present
      const { country, ...restAddress } = oh.shipping_address || {};
      return { ...oh, shipping_address: restAddress };
    }) : [];

    const payload = {
      payment: {
        amount: request.amount.toFixed(2),
        currency: request.currency,
        description: `Order ${request.orderId}`,
        buyer: {
          email: request.customerEmail,
          name: request.customerName || "Customer",
          phone: formattedPhone,
          // dob is optional and we never collect it; sending a placeholder would feed
          // Tabby a fabricated date of birth identical for every customer.
        },
        shipping_address: {
          city: request.shipping?.city || request.billing?.city || "Unknown",
          address: request.shipping?.address_1 || request.billing?.address_1 || "Unknown",
          zip: request.shipping?.postcode || request.billing?.postcode || "00000",
        },
        order: {
          reference_id: request.reference || request.orderId.toString(),
          tax_amount: "0.00",
          shipping_amount: "0.00",
          discount_amount: "0.00",
          updated_at: new Date().toISOString(),
          items: request.items ? request.items.map(item => {
            // image_url and product_url are declared `format: uri`, so an empty string is
            // invalid - leave the key out entirely when we have no URL.
            const imageUrl = item.image || item.images?.[0]?.src;
            const productUrl = item.permalink;

            return {
              reference_id: item.sku || item.product_id?.toString() || item.id?.toString(),
              title: item.name || item.title || "Product",
              quantity: item.quantity || 1,
              unit_price: item.prices?.price
                ? (parseFloat(item.prices.price) / (10 ** (item.prices.currency_minor_unit || 2))).toFixed(2)
                : (parseFloat(item.price || "0")).toFixed(2),
              discount_amount: "0.00",
              ...(imageUrl ? { image_url: imageUrl } : {}),
              ...(productUrl ? { product_url: productUrl } : {}),
              category: item.categories?.[0]?.name || item.category || "Perfumes",
              brand: "Boss Perfumes",
            };
          }) : [],
        },
        buyer_history: buyerHistory,
        order_history: orderHistory,
      },
      lang: locale,
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

    console.log("TABBY SESSION PAYLOAD:", JSON.stringify(payload, null, 2));

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

      if (errorData?.rejection_reason) {
        throw new Error(rejectionMessage(errorData.rejection_reason, locale));
      }
      throw new Error(`Failed to create Tabby session: ${errorData?.error || res.statusText}`);
    }

    const data = await res.json();
    console.log("Tabby Success:", JSON.stringify(data, null, 2));

    if (data.status === "rejected") {
      const reason = data.configuration?.products?.installments?.rejection_reason || data.payment?.status;
      if (reason) {
        throw new Error(rejectionMessage(reason, locale));
      }
      throw new Error(paymentMessages(locale).tabby.sessionRejected);
    }

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

  async handleWebhookEvent(payload: any): Promise<{ orderId: number; status: "pending" | "authorized" | "processing" | "completed" | "cancelled" | "failed" | "refunded", eventId?: string, transactionId?: string, provider?: string, metadata?: Record<string, any> } | null> {
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
    let refundedTotal = 0;
    let refundIds: string[] = [];

    // Tabby reuses the payment id as `payload.id` for every event on a payment, so it
    // cannot serve as the de-duplication key - a refund would be discarded as a repeat of
    // the authorization. Each event therefore gets its own key.
    let eventId = `${paymentId}:${eventStatus}`;

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
      // A refund does NOT move the payment out of CLOSED - Tabby signals it by appending to
      // the `refunds` array and resending a `closed` event. So a closed event is a refund
      // notification when that array is populated, and a plain capture-close when it is not.
      const refunds: TabbyRefund[] = Array.isArray(payload.refunds) ? payload.refunds : [];
      refundedTotal = refunds.reduce((sum, r) => sum + parseFloat(r?.amount || "0"), 0);
      refundIds = refunds.map((r, i) => String(r?.id ?? `refund_${i}`));
      const paymentAmount = parseFloat(payload.amount || "0");

      if (refunds.length > 0) {
        // Key off the newest refund so each successive partial refund is processed once.
        eventId = `${paymentId}:refund:${refundIds[refundIds.length - 1]}`;

        if (paymentAmount > 0 && refundedTotal >= paymentAmount - 0.001) {
          status = "refunded";
        } else {
          // WooCommerce has no partially-refunded status, so the order stays in processing
          // and the refunded total is recorded in metadata for reconciliation.
          status = "processing";
        }
      } else {
        status = "processing";
      }
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
    if (refundedTotal > 0) {
      metadata._tabby_refunded_amount = refundedTotal.toFixed(2);
      metadata._tabby_refund_ids = refundIds;
    }

    return { orderId, status, eventId, transactionId: paymentId, provider: "Tabby", metadata };
  }
}
