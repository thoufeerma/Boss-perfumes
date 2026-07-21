import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, rememberMe } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const authUrl = process.env.JWT_AUTH_URL;
    if (!authUrl) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const res = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Invalid credentials" },
        { status: res.status }
      );
    }

    if (data.token) {
      await setAuthCookie(data.token, rememberMe);
      return NextResponse.json({
        user: {
          email: data.user_email,
          displayName: data.user_display_name,
        }
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
