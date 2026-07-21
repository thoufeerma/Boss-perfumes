import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
    if (!storeUrl) {
      return NextResponse.json({ error: "Store URL not configured" }, { status: 500 });
    }

    const res = await fetch(`${storeUrl}/wp-json/headless-auth/v1/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: token, login: email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to reset password" }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "Password has been successfully reset." }, { status: 200 });
  } catch (error) {
    console.error("Reset password route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
