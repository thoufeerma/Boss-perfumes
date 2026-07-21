"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    });
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-brand-bg-secondary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-brand-surface border border-brand-border p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif text-brand-text mb-2 text-center">Create Account</h1>
        <p className="text-brand-text-muted text-sm text-center mb-8">Join Boss Perfumes to manage your orders</p>

        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">First Name</label>
              <input
                type="text"
                required
                className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">Last Name</label>
              <input
                type="text"
                required
                className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-brand-text mb-2">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full border border-brand-border p-3 focus:outline-none focus:border-brand-text transition-colors"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#111111] text-white py-4 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 mt-4"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-text underline underline-offset-4 hover:opacity-70 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
