import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitKey } from "@/lib/security";

const GENERIC_SUCCESS = { success: true, message: "If an account exists, a reset link has been sent." };

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Stops this form being used to flood someone's inbox with reset emails.
    if (!(await checkRateLimit(`forgot_ip:${getClientIp(req)}`, 5, 15 * 60))) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    if (!(await checkRateLimit(`forgot_email:${rateLimitKey(email)}`, 3, 60 * 60))) {
      // Same answer as success, so the limit does not reveal whether the account exists.
      return NextResponse.json(GENERIC_SUCCESS, { status: 200 });
    }

    const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
    if (!storeUrl) {
      return NextResponse.json({ error: "Store URL not configured" }, { status: 500 });
    }

    const res = await fetch(`${storeUrl}/wp-json/headless-auth/v1/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.status >= 500) {
      console.error("Forgot password: WordPress returned", res.status);
      return NextResponse.json({ error: "Failed to process request. Please try again." }, { status: 502 });
    }

    // Whether or not the email has an account, answer the same way, so the form cannot
    // be used to find out who shops here.
    return NextResponse.json(GENERIC_SUCCESS, { status: 200 });
  } catch (error) {
    console.error("Forgot password route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
