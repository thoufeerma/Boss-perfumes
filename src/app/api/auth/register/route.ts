import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const wcRes = await fetchWC("customers", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: email,
      })
    });

    if (wcRes.code && wcRes.code.includes("registration_error")) {
      return NextResponse.json({ error: wcRes.message || "Email already exists" }, { status: 400 });
    }

    if (wcRes.code === "rest_invalid_param") {
       return NextResponse.json({ error: wcRes.message || "Invalid registration parameters" }, { status: 400 });
    }

    if (!wcRes.id) {
      return NextResponse.json({ error: wcRes.message || "Failed to create account" }, { status: 400 });
    }

    const authUrl = process.env.JWT_AUTH_URL;
    if (!authUrl) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const loginRes = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    const loginData = await loginRes.json();

    if (loginRes.ok && loginData.token) {
      await setAuthCookie(loginData.token, false);
      return NextResponse.json({ success: true, user: { email, displayName: `${firstName} ${lastName}`.trim() } }, { status: 201 });
    }

    return NextResponse.json({ success: true, message: "Account created but automatic login failed" }, { status: 201 });

  } catch (error) {
    console.error("Register route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
