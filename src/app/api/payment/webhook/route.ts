import { NextRequest } from "next/server";
import { processWebhook } from "@/lib/payment/webhookHandler";

export async function POST(request: NextRequest) {
  // Dispatches internally based on headers or defaults to the active provider
  return processWebhook(request);
}
