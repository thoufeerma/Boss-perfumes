"use client";

import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: number;
  quantity: number;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({ productId, quantity, disabled, className }: AddToCartButtonProps) {
  const { add, isAdding } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || isAdding) return;
    add(productId, quantity);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={cn(
        "w-full bg-[#111111] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#222222] transition-colors duration-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed",
        className || "h-[52px]"
      )}
    >
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
      )}
      {isAdding ? "Adding..." : "Add to Bag"}
    </button>
  );
}
