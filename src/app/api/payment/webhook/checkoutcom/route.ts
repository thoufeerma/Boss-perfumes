import { NextRequest } from "next/server";
import { processWebhook } from "@/lib/payment/webhookHandler";

export async function POST(request: NextRequest) {
  // Explicitly dispatch to checkoutcom provider
  return processWebhook(request, "checkoutcom");
}
