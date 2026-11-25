import { NextResponse } from "next/server";
import { verifyCurrentSession, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  try {
    const result = await verifyCurrentSession();

    if (result.status === "valid") {
      return NextResponse.json({ user: result.payload }, { status: 200 });
    }

    // Only drop the cookie when the token is actually bad. If WordPress was merely
    // unreachable, keep the session so a brief outage does not sign everyone out.
    if (result.status === "invalid") {
      await clearAuthCookie();
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
