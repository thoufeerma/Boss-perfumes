import { NextRequest, NextResponse } from "next/server";
import { fetchWC } from "@/api/client";
import { getRegistrationState, saveRegistrationState, deleteRegistrationState } from "@/lib/redis";
import { hashOTP, decryptPassword, checkRateLimit } from "@/lib/security";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isIpAllowed = await checkRateLimit(`ip_verify:${ip}`, 10, 60); // 10 attempts per minute
    if (!isIpAllowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { otp } = await req.json();
    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const verificationId = req.cookies.get('bp_verification')?.value;
    if (!verificationId) {
      return NextResponse.json({ error: "Verification session expired or invalid" }, { status: 400 });
    }

    const state = await getRegistrationState(verificationId);
    if (!state) {
      // Clear cookie if state is missing/expired
      const response = NextResponse.json({ error: "Verification session expired. Please register again." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    if (Date.now() > state.expiresAt) {
      await deleteRegistrationState(verificationId);
      const response = NextResponse.json({ error: "OTP expired. Please register again." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    if (state.attempts >= 5) {
      await deleteRegistrationState(verificationId);
      const response = NextResponse.json({ error: "Maximum attempts reached. Please register again." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    const currentHash = hashOTP(otp);
    if (currentHash !== state.otpHash) {
      // Increment attempt
      state.attempts += 1;
      await saveRegistrationState(state);
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // OTP is valid!
    // 1. Verify email doesn't exist one last time (prevent race condition)
    const existingCustomers = await fetchWC("customers", { params: { email: state.email } });
    if (existingCustomers && existingCustomers.length > 0) {
      await deleteRegistrationState(verificationId);
      const response = NextResponse.json({ error: "An account with this email address already exists." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    // Decrypt the password
    const password = decryptPassword(state.passwordEncrypted);

    // 2. Create the WordPress User via WooCommerce REST API
    const wcRes = await fetchWC("customers", {
      method: "POST",
      body: JSON.stringify({
        email: state.email,
        password: password,
        first_name: state.firstName,
        last_name: state.lastName,
        username: state.email,
        meta_data: [
          { key: "email_verified", value: "true" },
          { key: "verified_at", value: new Date().toISOString() }
        ]
      })
    });

    if (!wcRes.id) {
      console.error("WooCommerce registration failed:", wcRes);
      // Don't delete state yet, might be a network error, let them try again or it expires
      return NextResponse.json({ error: wcRes.message || "Failed to create account in WooCommerce" }, { status: 400 });
    }

    // 3. Authenticate User (JWT Login)
    const authUrl = process.env.JWT_AUTH_URL;
    let loggedIn = false;
    let displayName = `${state.firstName} ${state.lastName}`.trim();
    let loginData = null;
    
    if (authUrl) {
      try {
        const loginRes = await fetch(authUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: state.email, password }),
        });
        loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.token) {
          loggedIn = true;
          await setAuthCookie(loginData.token, false);
        }
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
      }
    }

    // 4. Cleanup
    await deleteRegistrationState(verificationId);
    
    const response = NextResponse.json({ 
      success: true, 
      user: { email: state.email, displayName },
      loggedIn,
      message: loggedIn ? "Verified and logged in" : "Verified but automatic login failed" 
    }, { status: 201 });
    
    response.cookies.delete('bp_verification');
    return response;

  } catch (error) {
    console.error("verify-otp route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
