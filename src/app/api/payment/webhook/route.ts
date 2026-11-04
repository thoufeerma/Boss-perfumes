import { NextRequest } from "next/server";
import { processWebhook } from "@/lib/payment/webhookHandler";

export async function POST(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") || undefined;
  // Dispatches internally based on headers, query param, or payload inspection
  return processWebhook(request, provider);
}
