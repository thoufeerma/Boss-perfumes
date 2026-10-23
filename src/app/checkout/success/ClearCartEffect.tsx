"use client";
import { useEffect } from "react";
import { useCartContext } from "@/components/cart/CartProvider";

export function ClearCartEffect() {
  const { refreshCart } = useCartContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("boss_pending_cart_backup");
    }
    fetch("/api/cart/clear", { method: "POST" }).then(() => {
      refreshCart();
    }).catch(console.error);
  }, [refreshCart]);

  return null;
}
