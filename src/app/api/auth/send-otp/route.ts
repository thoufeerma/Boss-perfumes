import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { generateOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { saveRegistrationState } from "@/lib/redis";
import { hashOTP, encryptPassword, checkRateLimit } from "@/lib/security";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isIpAllowed = await checkRateLimit(`ip:${ip}`, 5, 60); // 5 requests per minute
    if (!isIpAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { firstName, lastName, email, password } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 2. Email-based rate limiting
    const isEmailAllowed = await checkRateLimit(`email:${email}`, 3, 60); // 3 requests per minute per email
    if (!isEmailAllowed) {
      return NextResponse.json({ error: "Too many requests for this email. Please try again later." }, { status: 429 });
    }

    // 3. Check if email already exists in WooCommerce
    const existingCustomers = await fetchWC("customers", { params: { email } });
    if (existingCustomers && existingCustomers.length > 0) {
      return NextResponse.json({ error: "An account with this email address already exists" }, { status: 400 });
    }

    // 4. Generate OTP & save state in Redis
    const otp = generateOTP(6);
    const verificationId = crypto.randomUUID();
    const now = Date.now();
    
    await saveRegistrationState({
      verificationId,
      firstName,
      lastName,
      email,
      passwordEncrypted: encryptPassword(password),
      otpHash: hashOTP(otp),
      expiresAt: now + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
      resends: 0,
      resendAvailableAt: now + 60 * 1000, // 60 seconds
      createdAt: now,
    });

    // 5. Send Email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      // Cleanup redis if email fails to send
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    // 6. Set HttpOnly Cookie
    const response = NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
    response.cookies.set('bp_verification', verificationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 300, // 5 minutes matching TTL
    });

    return response;

  } catch (error) {
    console.error("send-otp route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
