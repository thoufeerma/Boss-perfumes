import { NextRequest, NextResponse } from "next/server";
import { getRegistrationState, saveRegistrationState, deleteRegistrationState } from "@/lib/redis";
import { generateOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { hashOTP, checkRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isIpAllowed = await checkRateLimit(`ip_resend:${ip}`, 5, 60); // 5 attempts per minute
    if (!isIpAllowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const verificationId = req.cookies.get('bp_verification')?.value;
    if (!verificationId) {
      return NextResponse.json({ error: "Verification session expired or invalid" }, { status: 400 });
    }

    const state = await getRegistrationState(verificationId);
    if (!state) {
      const response = NextResponse.json({ error: "Verification session expired. Please register again." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    // Check expiry
    if (Date.now() > state.expiresAt) {
      await deleteRegistrationState(verificationId);
      const response = NextResponse.json({ error: "Verification session expired. Please register again." }, { status: 400 });
      response.cookies.delete('bp_verification');
      return response;
    }

    // Check resend limits
    if (state.resends >= 5) {
      return NextResponse.json({ error: "Maximum resend attempts reached. Please wait or register again." }, { status: 400 });
    }

    // Check cooldown
    if (Date.now() < state.resendAvailableAt) {
      const waitSeconds = Math.ceil((state.resendAvailableAt - Date.now()) / 1000);
      return NextResponse.json({ error: `Please wait ${waitSeconds} seconds before requesting a new code.` }, { status: 400 });
    }

    // Generate new OTP
    const otp = generateOTP(6);
    const now = Date.now();
    
    // Update state
    state.otpHash = hashOTP(otp);
    state.resends += 1;
    state.resendAvailableAt = now + 60 * 1000; // 60s cooldown
    // We optionally extend expiry or keep original. Let's extend it to 5 mins from now
    state.expiresAt = now + 5 * 60 * 1000;
    
    await saveRegistrationState(state);

    // Send Email
    const emailSent = await sendOTPEmail(state.email, otp);
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("resend-otp route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
