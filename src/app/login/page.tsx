"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    await login(formData);
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif text-brand-text mb-2 text-center">Welcome Back</h1>
        <p className="text-brand-text-muted text-sm text-center mb-8">Sign in to your Boss Perfumes account</p>

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
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-brand-text-muted hover:text-brand-text"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-text cursor-pointer border-brand-border"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span className="text-sm text-brand-text-muted">Remember Me</span>
            </label>

            <Link href="/forgot-password" className="text-sm text-brand-text-muted hover:text-brand-text transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#111111] text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 mt-4"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand-text underline underline-offset-4 hover:opacity-70 transition-opacity">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
