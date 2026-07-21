"use client";

import { useEffect, useState } from "react";
import { type WCProduct } from "@/api/products";
import { ProductCarousel } from "@/components/collection/ProductCarousel";

const RECENTLY_VIEWED_KEY = "boss_perfumes_recently_viewed";
const MAX_ITEMS = 8;

interface RecentlyViewedProps {
  currentProduct?: WCProduct;
}

export function RecentlyViewed({ currentProduct }: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<WCProduct[]>([]);

  useEffect(() => {
    // 1. Read existing from local storage
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let history: WCProduct[] = stored ? JSON.parse(stored) : [];

    // 2. If we have a current product, add it to history
    if (currentProduct) {
      // Remove it if it's already in there to bump it to the front
      history = history.filter((p) => p.id !== currentProduct.id);
      
      // Add to front
      history.unshift(currentProduct);
      
      // Trim to max length
      if (history.length > MAX_ITEMS) {
        history = history.slice(0, MAX_ITEMS);
      }
      
      // Save back
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(history));
    }

    // 3. Set state to render, excluding the current product from being displayed
    const displayHistory = history.filter(p => !currentProduct || p.id !== currentProduct.id);
    setViewedProducts(displayHistory);
  }, [currentProduct]);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 border-t border-[#ECE8E2] bg-[#FAF8F4]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <h2 className="text-3xl lg:text-4xl font-serif text-center mb-12 text-[#111111]">
          Recently Viewed
        </h2>
        <ProductCarousel products={viewedProducts} />
      </div>
    </section>
  );
}
