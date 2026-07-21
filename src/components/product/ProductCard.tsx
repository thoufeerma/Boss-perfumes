"use client";

import Image from "next/image";
import Link from "next/link";
import { type WCProduct } from "@/api/products";
import { Heart, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

import { WishlistButton } from "./purchase/WishlistButton";
function ProductImage({ product }: { product: WCProduct }) {
  const imageSrc = product.images?.[0]?.src || "/images/product-placeholder.png";
  const hoverImageSrc = product.images?.[1]?.src || imageSrc;
  const hasGallery = product.images && product.images.length > 1;
  
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F4] rounded-t-[17px]">
      <Image
        src={imageSrc}
        alt={product.name}
        fill
        className={cn(
          "object-contain object-center p-8 transition-all duration-250 mix-blend-multiply",
          hasGallery && "group-hover:scale-[1.03] group-hover:opacity-0"
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />
      {hasGallery && (
        <Image
          src={hoverImageSrc}
          alt={product.name}
          fill
          className="object-contain object-center p-8 absolute inset-0 opacity-0 transition-all duration-250 scale-95 group-hover:scale-[1.03] group-hover:opacity-100 mix-blend-multiply"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      )}
    </div>
  );
}

import { ProductPrice } from "./ProductPrice";
import { AddToCartButton } from "./purchase/AddToCartButton";
export function ProductCard({ product }: { product: WCProduct }) {
  return (
    <div className="group relative flex flex-col h-full bg-white rounded-[18px] border border-[#ECE8E2] hover:border-[#D0C9C0] overflow-hidden p-5 md:p-6 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <WishlistButton 
        productId={product.id} 
        iconOnly 
        className="absolute top-5 right-5 z-10 w-[30px] h-[30px] bg-white/50 backdrop-blur-sm hover:bg-white text-brand-text"
      />
      <Link href={`/product/${product.slug}`} className="flex flex-col flex-grow">
        <ProductImage product={product} />
        <div className="flex flex-col flex-grow mt-5">
          <h3 className="text-[16px] md:text-[18px] font-serif font-medium text-[#111111] line-clamp-2 leading-snug md:leading-[1.4]">
            {product.name}
          </h3>
          <div className="mt-auto">
            <ProductPrice product={product} />
          </div>
        </div>
      </Link>
      <div className="mt-5">
        <AddToCartButton productId={product.id} quantity={1} disabled={product.stock_status === "outofstock"} className="h-[54px] md:h-[56px]" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-[18px] border border-[#ECE8E2] overflow-hidden p-5 md:p-6">
      <div className="aspect-[4/5] w-full bg-[#FAF8F4] rounded-t-[17px] animate-pulse" />
      <div className="flex flex-col flex-grow mt-5 space-y-2">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="mt-auto">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mt-3" />
        </div>
      </div>
      <div className="w-full h-[54px] md:h-[56px] mt-5 rounded-xl bg-gray-100 animate-pulse" />
    </div>
  );
}
