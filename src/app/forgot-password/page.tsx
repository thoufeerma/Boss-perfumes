"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    const ok = await forgotPassword(email);
    if (ok) setSuccess(true);
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif text-brand-text mb-2 text-center">Reset Password</h1>
        
        {success ? (
          <div className="text-center">
            <p className="text-brand-text-muted text-sm mb-6">
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
            <Link href="/login" className="inline-block bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-brand-text-muted text-sm text-center mb-8">
              Enter your email address to receive a password reset link.
            </p>

            {(error || validationError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
                {validationError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 mt-4"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {!success && (
          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm text-brand-text-muted hover:text-brand-text transition-colors">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
