import { NextRequest, NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/payment/registry";
import { getPaymentProvider } from "@/lib/payment/providerFactory";
import { getLocale } from "@/lib/i18n/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cartData = body?.cartData;
    const requestedLocale = body?.locale;

    if (!cartData) {
      return NextResponse.json({ error: "cartData is required" }, { status: 400 });
    }

    // Method labels and any rejection reason have to come back in the shopper's language.
    const serverLocale = await getLocale();
    const locale = (requestedLocale === "en" || requestedLocale === "ar") ? requestedLocale : serverLocale;
    const enabledMethods = getEnabledPaymentMethods(locale);

    // Evaluate eligibility in parallel for performance
    const methodsWithEligibility = await Promise.all(
      enabledMethods.map(async (method) => {
        try {
          const provider = getPaymentProvider(method.id);
          const check = await provider.isEligible(cartData, locale);
          return { ...method, eligible: check.eligible, reason: check.reason };
        } catch (e) {
          console.error(`Error checking eligibility for ${method.id}:`, e);
          return { ...method, eligible: false, reason: "Internal error" };
        }
      })
    );

    return NextResponse.json({ methods: methodsWithEligibility });
  } catch (error) {
    console.error("Eligibility check failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
