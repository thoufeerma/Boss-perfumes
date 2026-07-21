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

    const { orderId, status, transactionId, provider: providerName } = event;

    // Map standardized status to WooCommerce status
    let wcStatus = "pending";
    switch (status) {
      case "approved":
      case "captured":
        wcStatus = "processing";
        break;
      case "declined":
      case "voided":
        wcStatus = "failed";
        break;
      case "refunded":
        wcStatus = "refunded";
        break;
    }

    const metaData = [];
    if (transactionId) {
      metaData.push({ key: "_transaction_id", value: transactionId });
    }
    if (providerName) {
      metaData.push({ key: "_payment_method_title", value: providerName });
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
