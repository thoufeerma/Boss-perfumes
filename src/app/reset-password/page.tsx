"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("key") || searchParams.get("token");
  const email = searchParams.get("login") || searchParams.get("email");
  
  const { resetPassword, isLoading, error } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    await resetPassword({ token, email, password });
  };

  if (!token || !email) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-6 text-sm">Invalid or missing reset link.</p>
        <a href="/forgot-password" className="text-xs uppercase tracking-widest text-brand-text underline underline-offset-4">
          Request new link
        </a>
      </div>
    );
  }

  return (
    <>
      <p className="text-brand-text-muted text-sm text-center mb-8">
        Create a new password for {email}
      </p>

      {(error || validationError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">
            New Password
          </label>
          <input
            type="password"
            required
            className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#111111] text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 mt-4"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif text-brand-text mb-2 text-center">Set New Password</h1>
        <Suspense fallback={<p className="text-center text-sm text-brand-text-muted">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
