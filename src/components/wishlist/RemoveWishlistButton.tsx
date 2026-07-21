"use client";

import { useWishlist } from "@/hooks/useWishlist";

export function RemoveWishlistButton({ productId }: { productId: number }) {
  const { toggle, isToggling } = useWishlist(productId);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={isToggling}
      className="w-full bg-transparent text-brand-text border border-brand-text py-2 text-xs font-medium tracking-widest uppercase hover:bg-brand-bg-secondary transition-colors disabled:opacity-50"
    >
      {isToggling ? "Removing..." : "Remove"}
    </button>
  );
}
