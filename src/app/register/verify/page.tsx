"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function VerifyOtpContent() {
  const { verifyOtp, resendOtp, isLoading, error } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every(v => v !== "")) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^[0-9]+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    const success = await verifyOtp(code);
    if (success) {
      router.push("/account");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    const success = await resendOtp();
    if (success) {
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-brand-surface border border-brand-border p-8 md:p-12 shadow-sm text-center">
        <h1 className="text-3xl font-serif text-brand-text mb-2">Verify Your Email</h1>
        <p className="text-brand-text-muted text-sm mb-8">
          We sent a 6-digit verification code to your email address.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 md:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-10 h-12 md:w-14 md:h-16 border border-brand-border text-center text-xl font-medium focus:outline-none focus:border-brand-text transition-colors bg-brand-surface"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.some(v => v === "")}
            className="w-full bg-[#111111] text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70"
          >
            {isLoading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-sm text-brand-text-muted mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isLoading}
            className="text-brand-text underline underline-offset-4 hover:opacity-70 transition-opacity disabled:opacity-50 disabled:no-underline"
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
