import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "./providerFactory";
import { fetchWC } from "@/api/client";

export async function processWebhook(request: NextRequest, providerId?: string) {
  try {
    const rawBody = await request.text();

    // Auto-detect provider if not explicitly passed
    let detectedProviderId = providerId;
    if (!detectedProviderId) {
      if (request.headers.get("cko-signature")) {
        detectedProviderId = "checkoutcom";
      } else if (request.headers.get("x-tabby-webhook-secret")) {
        detectedProviderId = "tabby";
      } else if (request.headers.get("x-wc-webhook-signature") || request.headers.get("x-wc-webhook-source")) {
        detectedProviderId = "woopayments";
      }
      // Add Telr detection here later if needed
    }

    const provider = getPaymentProvider(detectedProviderId);

    // Verify Webhook Signature
    const isValid = provider.verifyWebhook(request.headers, rawBody);
    if (!isValid) {
      console.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      // Some providers might send URL-encoded forms instead of JSON. 
      // For Checkout.com and Telr (usually), it's JSON.
      console.error("Failed to parse webhook JSON", e);
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }
    
    // Parse Payload to common format
    const event = await provider.handleWebhookEvent(payload);

    if (!event) {
      // Event not handled or irrelevant
      return NextResponse.json({ received: true });
    }

    const { orderId, status, eventId: providerEventId, transactionId, provider: providerName, metadata: providerMetadata } = event;

    // Fetch current order to check state and idempotency
    const currentOrder = await fetchWC(`orders/${orderId}`, { method: "GET" });
    if (!currentOrder || currentOrder.id !== orderId) {
       return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const processedEvents = currentOrder.meta_data.find((m: any) => m.key === "_processed_webhook_events")?.value || [];
    // Prefer the provider's own key: `payload.id` is only unique per event for providers
    // that mint a fresh id per event, which Tabby does not.
    const eventId = providerEventId || payload.id || transactionId;
    
    if (eventId && Array.isArray(processedEvents) && processedEvents.includes(eventId)) {
       return NextResponse.json({ received: true, message: "Duplicate event ignored" });
    }

    // State machine logic
    let wcStatus = currentOrder.status; // default to current
    const currentIsFinal = ["completed", "processing", "refunded", "cancelled"].includes(currentOrder.status);

    switch (status) {
      case "authorized":
      case "completed":
      case "processing":
        if (!currentIsFinal || currentOrder.status === "cancelled") {
          // If it was somehow cancelled before but now paid, we can move it to processing. 
          wcStatus = "processing";
        }
        // Fallback: Ensure customer's persistent cart in WooCommerce is emptied once payment is confirmed
        if (currentOrder.customer_id && currentOrder.customer_id > 0) {
          try {
            await fetchWC(`customers/${currentOrder.customer_id}`, {
              method: "PUT",
              body: JSON.stringify({
                meta_data: [
                  { key: "_woocommerce_persistent_cart", value: "" },
                  { key: "_woocommerce_persistent_cart_1", value: "" }
                ]
              })
            });
            console.log(`[Webhook] Emptied persistent cart fallback for customer ${currentOrder.customer_id}`);
          } catch (err) {
            console.warn(`[Webhook] Failed to clear persistent cart for customer ${currentOrder.customer_id}:`, err);
          }
        }
        break;
      case "cancelled":
      case "failed":
        if (!currentIsFinal) {
          wcStatus = "failed";
        }
        break;
      case "refunded":
        wcStatus = "refunded";
        break;
    }

    let newProcessedEvents = Array.isArray(processedEvents) ? [...processedEvents] : [];
    if (eventId) newProcessedEvents.push(eventId);
    // keeping only last 20 to avoid huge metadata array
    if (newProcessedEvents.length > 20) newProcessedEvents = newProcessedEvents.slice(-20);

    const metaData: { key: string; value: any }[] = [
      { key: "_processed_webhook_events", value: newProcessedEvents }
    ];
    if (transactionId) {
      metaData.push({ key: "_transaction_id", value: transactionId });
    }
    if (providerName) {
      metaData.push({ key: "_payment_method_title", value: providerName });
      metaData.push({ key: "_payment_provider", value: providerName });
    }
    
    // Add provider-specific metadata
    if (providerMetadata) {
      for (const [key, value] of Object.entries(providerMetadata)) {
        metaData.push({ key, value });
      }
    }

    // Update WooCommerce Order
    const updateResponse = await fetchWC(`orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({
        status: wcStatus,
        transaction_id: transactionId, // Native WC field
        meta_data: metaData,
      }),
    });

    if (updateResponse?.id) {
      // Add Order Note about Webhook
      await fetchWC(`orders/${orderId}/notes`, {
        method: "POST",
        body: JSON.stringify({
          note: `Webhook Received: ${status.toUpperCase()}\nProvider: ${providerName || detectedProviderId}\nTransaction ID: ${transactionId || "N/A"}\nEvent ID: ${eventId || "N/A"}`,
          customer_note: false
        })
      });

      return NextResponse.json({ success: true, orderId, newStatus: wcStatus });
    } else {
      console.error("Failed to update WC order", updateResponse);
      return NextResponse.json({ error: "Failed to update order in WC" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
