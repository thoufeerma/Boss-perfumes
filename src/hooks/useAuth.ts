"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WishlistService } from "@/lib/wishlist/WishlistService";
import { useWishlistStore } from "@/store/wishlist-store";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("[useAuth] Starting login POST request...");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      console.log("[useAuth] Login response received. Status:", res.status);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      console.log("[useAuth] Login successful. Starting wishlist sync...");
      // Hybrid Wishlist Sync
      await WishlistService.syncOnLogin();
      console.log("[useAuth] Wishlist sync finished. Resetting store...");
      
      const wishlistStore = useWishlistStore.getState();
      useWishlistStore.setState({ isAuthenticated: true });
      wishlistStore.reset();
      console.log("[useAuth] Store reset. Initializing from YITH...");
      await wishlistStore.initialize();
      console.log("[useAuth] Store initialized. Navigating to /account...");

      window.location.href = "/account";
      console.log("[useAuth] window.location.href = '/account' called.");
      return true;
    } catch (err: any) {
      console.error("[useAuth] Login error caught:", err);
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("invalid") || msg.includes("password") || msg.includes("credentials") || msg.includes("username")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
      return false;
    } finally {
      setIsLoading(false);
      console.log("[useAuth] Login finally block reached.");
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Redirect to verification page
      router.push("/register/verify");
      return true;
    } catch (err: any) {
      console.error("[useAuth] Registration error caught:", err);
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("exists") || msg.includes("already registered")) {
        setError("An account with this email address already exists.");
      } else if (msg.includes("email") || msg.includes("invalid")) {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Something went wrong. Please try again later.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Hybrid Wishlist Sync after successful verification & login
      if (data.loggedIn) {
        await WishlistService.syncOnLogin();
        const wishlistStore = useWishlistStore.getState();
        useWishlistStore.setState({ isAuthenticated: true });
        wishlistStore.reset();
        await wishlistStore.initialize();
      }

      window.location.href = "/account";
      return true;
    } catch (err: any) {
      console.error("[useAuth] OTP verification error caught:", err);
      setError(err.message || "Invalid OTP. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      return true;
    } catch (err: any) {
      console.error("[useAuth] Resend OTP error caught:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
      return true;
    } catch (err: any) {
      console.error("[useAuth] Logout error caught:", err);
      setError("Something went wrong. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return true;
    } catch (err: any) {
      console.error("[useAuth] Forgot password error caught:", err);
      setError("Something went wrong. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (payload: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      router.push("/login");
      return true;
    } catch (err: any) {
      console.error("[useAuth] Reset password error caught:", err);
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("invalid") || msg.includes("expired")) {
        setError("The password reset link is invalid or has expired.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyOtp,
    resendOtp,
    isLoading,
    error,
    clearError,
  };
}
