"use client";

import { useAuth } from "@/hooks/useAuth";

export function LogoutButton({ className }: { className?: string }) {
  const { logout, isLoading } = useAuth();

  return (
    <button 
      onClick={() => logout()}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Logging Out..." : "Log Out"}
    </button>
  );
}
