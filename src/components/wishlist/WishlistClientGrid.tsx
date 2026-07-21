"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlist-store";
import { getProductsByIds } from "@/actions/wishlist";
import { AddToCartButton } from "@/components/product/purchase/AddToCartButton";
import { RemoveWishlistButton } from "@/components/wishlist/RemoveWishlistButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Loader2 } from "lucide-react";

export function WishlistClientGrid() {
  const { wishlistIds, isInitialized, initialize } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize wishlist state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch full products when wishlistIds change
  useEffect(() => {
    let isMounted = true;
    
    async function loadProducts() {
      if (!isInitialized) return;
      
      if (wishlistIds.length === 0) {
        if (isMounted) {
          setProducts([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const fetchedProducts = await getProductsByIds(wishlistIds);
      
      if (isMounted) {
        // Maintain the order of wishlistIds if desired, or just set the fetched array
        setProducts(fetchedProducts);
        setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [wishlistIds, isInitialized]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center py-20 border border-brand-border bg-brand-bg-secondary">
        <Loader2 className="w-8 h-8 text-brand-text-muted animate-spin" />
      </div>
    );
  }

  if (wishlistIds.length === 0 || products.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-bg-secondary border border-brand-border">
        <p className="text-brand-text-muted mb-4 font-light">Your wishlist is currently empty.</p>
        <Link href="/collections" className="inline-block bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors">
          Discover Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border border-brand-border p-4 group flex flex-col h-full">
          <Link href={`/product/${product.slug}`} className="block relative aspect-square mb-4 bg-brand-bg-secondary overflow-hidden">
            {product.images && product.images[0] ? (
              <Image 
                src={product.images[0].src} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-text-muted">No Image</div>
            )}
          </Link>
          <div className="flex-1 flex flex-col text-center">
            <h3 className="text-sm font-medium text-brand-text mb-1 truncate">{product.name}</h3>
            <div className="mb-4">
              <ProductPrice product={product} />
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <AddToCartButton productId={product.id} quantity={1} disabled={product.stock_status === 'outofstock'} />
              <RemoveWishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
