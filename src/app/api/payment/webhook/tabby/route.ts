import { NextRequest } from "next/server";
import { processWebhook } from "@/lib/payment/webhookHandler";

export async function POST(request: NextRequest) {
  return processWebhook(request, "tabby");
}
