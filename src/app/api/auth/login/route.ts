import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitKey } from "@/lib/security";

const TOO_MANY = { error: "Too many sign-in attempts. Please wait a few minutes and try again." };

export async function POST(req: NextRequest) {
  try {
    const { username, password, rememberMe } = await req.json();

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Slow down password guessing: per client IP, and per account so rotating IPs does
    // not help against a single account.
    if (!(await checkRateLimit(`login_ip:${getClientIp(req)}`, 20, 5 * 60))) {
      return NextResponse.json(TOO_MANY, { status: 429 });
    }
    if (!(await checkRateLimit(`login_user:${rateLimitKey(username)}`, 10, 15 * 60))) {
      return NextResponse.json(TOO_MANY, { status: 429 });
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
      // WordPress says whether the username or the password was wrong; passing that on
      // tells an attacker which emails have accounts. Answer the same way for both.
      if (res.status >= 500) {
        return NextResponse.json({ error: "Sign-in is temporarily unavailable. Please try again." }, { status: 502 });
      }
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
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
