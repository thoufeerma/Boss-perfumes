"use client";

import { useState } from "react";
import { type WCProduct } from "@/api/products";
import { QuantitySelector } from "./QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

interface PurchaseBlockProps {
  product: WCProduct;
}

export function PurchaseBlock({ product }: PurchaseBlockProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock_status === "outofstock";

  return (
    <div className="pt-6 space-y-4 mb-8">
      <div className="flex gap-4">
        <QuantitySelector 
          quantity={quantity} 
          setQuantity={setQuantity} 
          max={product.stock_quantity || 99}
        />
        <div className="flex-1">
          <AddToCartButton 
            productId={product.id} 
            quantity={quantity} 
            disabled={isOutOfStock} 
          />
        </div>
      </div>
      <WishlistButton productId={product.id} className="w-full" />
    </div>
  );
}
