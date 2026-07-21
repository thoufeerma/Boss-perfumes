import { NextResponse } from "next/server";
import { getCurrentUser, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    
    if (!userPayload) {
      await clearAuthCookie();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json({ user: userPayload }, { status: 200 });
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
