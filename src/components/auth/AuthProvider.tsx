"use client";

import { createContext, useContext, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist-store";

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export function AuthProvider({ 
  children, 
  isAuthenticated 
}: { 
  children: React.ReactNode; 
  isAuthenticated: boolean;
}) {
  // We use the passed isAuthenticated prop directly from the server.
  // We also sync it with the wishlist store so it knows what mode to operate in.
  useEffect(() => {
    useWishlistStore.setState({ isAuthenticated, isInitialized: false });
    // Trigger initialization now that auth state is known on the client
    useWishlistStore.getState().initialize();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthState = () => useContext(AuthContext);
