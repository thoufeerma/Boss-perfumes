"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: number;
  className?: string;
  iconOnly?: boolean;
}

export function WishlistButton({ productId, className, iconOnly = false }: WishlistButtonProps) {
  const { isWishlisted, isToggling, toggle } = useWishlist(productId);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  if (iconOnly) {
    return (
      <button 
        className={cn("flex items-center justify-center rounded-full transition-all duration-300", className)}
        aria-label="Add to wishlist"
        onClick={handleWishlist}
        disabled={isToggling}
      >
        <Heart 
          className={cn(
            "w-5 h-5 transition-colors duration-300",
            isWishlisted ? "fill-brand-text text-brand-text" : "hover:fill-brand-text"
          )} 
          strokeWidth={1.5} 
        />
      </button>
    );
  }

  return (
    <button 
      className={cn(
        "h-[52px] px-6 rounded-full border border-[#ECE8E2] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors duration-300 font-medium text-sm",
        isWishlisted ? "text-brand-text" : "text-[#111111]",
        className
      )}
      onClick={handleWishlist}
      disabled={isToggling}
    >
      <Heart 
        className={cn("w-4 h-4 transition-colors", isWishlisted && "fill-brand-text text-brand-text")} 
        strokeWidth={1.5} 
      />
      <span className="hidden sm:inline">
        {isWishlisted ? 'Saved' : 'Wishlist'}
      </span>
    </button>
  );
}
