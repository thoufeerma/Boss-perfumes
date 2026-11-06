"use client";
import { useEffect } from "react";
import { useCartContext } from "@/components/cart/CartProvider";

export function ClearCartEffect() {
  const { refreshCart, setCart } = useCartContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("boss_pending_order_id");
      sessionStorage.removeItem("boss_pending_cart_backup");
    }
    setCart(null);
    fetch("/api/cart/clear", { method: "POST" })
      .then(() => {
        refreshCart();
      })
      .catch(console.error);
  }, [refreshCart, setCart]);

  return null;
}
