import { NextRequest, NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/payment/registry";
import { getPaymentProvider } from "@/lib/payment/providerFactory";

export async function POST(req: NextRequest) {
  try {
    const { cartData } = await req.json();

    if (!cartData) {
      return NextResponse.json({ error: "cartData is required" }, { status: 400 });
    }

    const enabledMethods = getEnabledPaymentMethods();
    
    // Evaluate eligibility in parallel for performance
    const methodsWithEligibility = await Promise.all(
      enabledMethods.map(async (method) => {
        try {
          const provider = getPaymentProvider(method.id);
          const check = await provider.isEligible(cartData);
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
