"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { type CartData, getCart } from "@/api/cart";

interface CartContextType {
  cart: CartData | null;
  isLoading: boolean;
  cartCount: number;
  refreshCart: () => Promise<void>;
  setCart: (cart: CartData | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, initialCart }: { children: ReactNode; initialCart: CartData | null }) {
  const [cart, setCartState] = useState<CartData | null>(initialCart);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const freshCart = await getCart();
      setCartState(freshCart);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCart = useCallback((newCart: CartData | null) => {
    setCartState(newCart);
  }, []);

  const cartCount = cart?.items_count || 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, cartCount, refreshCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
