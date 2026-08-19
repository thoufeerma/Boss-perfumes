"use client";

import { useState } from "react";
import { type WCProduct } from "@/api/products";
import { QuantitySelector } from "./QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { TabbyPromo } from "@/components/payment/TabbyPromo";

interface PurchaseBlockProps {
  product: WCProduct;
}

export function PurchaseBlock({ product }: PurchaseBlockProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock_status === "outofstock";
  const price = parseFloat(product.price || "0");

  return (
    <div className="pt-6 space-y-4 mb-8">
      <TabbyPromo price={price} currency="AED" source="product" />
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
