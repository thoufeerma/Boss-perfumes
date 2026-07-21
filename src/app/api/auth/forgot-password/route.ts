import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to process request" }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
