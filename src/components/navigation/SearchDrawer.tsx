"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/ui-store";
import { cn, formatPrice } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { searchProductsAction, getFeaturedProductsAction } from "@/actions/search";
import type { WCProduct } from "@/api/products";
import Image from "next/image";
import Link from "next/link";

export function SearchDrawer() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WCProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<WCProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useScrollLock(isSearchOpen);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
    
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const featured = await getFeaturedProductsAction(4);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchProductsAction(val);
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleProductClick = () => {
    setSearchOpen(false);
  };

  const renderProduct = (product: WCProduct) => {
    const category = product.categories?.[0]?.name;
    const brandAttr = product.attributes?.find(attr => attr.name.toLowerCase() === 'brand');
    const brand = brandAttr ? brandAttr.options[0] : null;
    
    return (
      <Link 
        href={`/product/${product.slug}`} 
        key={product.id}
        onClick={handleProductClick}
        className="flex items-center gap-4 group p-2 hover:bg-brand-bg-secondary transition-colors"
      >
        <div className="relative w-16 h-20 flex-shrink-0 bg-brand-bg overflow-hidden">
          {product.images?.[0] ? (
            <Image 
              src={product.images[0].src} 
              alt={product.images[0].alt || product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
              sizes="64px" 
            />
          ) : (
            <div className="w-full h-full bg-brand-border/20" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-brand-text truncate group-hover:text-brand-accent transition-colors">
            {product.name}
          </h4>
          {(brand || category) && (
            <p className="text-xs text-brand-text-muted mt-1 uppercase tracking-wider truncate">
              {brand || category}
            </p>
          )}
        </div>
        <div className="text-sm font-medium text-brand-text whitespace-nowrap">
          {formatPrice(product.price, "AED")}
        </div>
      </Link>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setSearchOpen(false)}
      />

      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-brand-surface border-b border-brand-border transform transition-transform duration-500 ease-out max-h-[80vh] flex flex-col",
          isSearchOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12 pt-8 pb-4 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-brand-text">Search</h2>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 -mr-2 text-brand-text hover:opacity-70 transition-opacity"
              aria-label="Close search"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-text-muted" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search for fragrances, brands..."
              className="w-full bg-transparent border-none border-b border-brand-border pb-4 pl-10 text-2xl font-serif focus:outline-none focus:ring-0 placeholder:text-brand-text-muted/50 text-brand-text"
              autoFocus={isSearchOpen}
            />
            {isLoading && (
              <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text animate-spin" />
            )}
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto pb-8 mx-auto max-w-7xl px-6 lg:px-12 w-full">
          {query.trim().length > 0 ? (
            <div className="mt-4">
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {results.map(renderProduct)}
                </div>
              ) : !isLoading ? (
                <div className="py-12 text-center">
                  <p className="text-brand-text-muted text-lg">No products found for "{query}"</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-sm font-medium tracking-wide uppercase text-brand-text-muted mb-6">
                Featured Products
              </h3>
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {featuredProducts.map(renderProduct)}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-brand-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading featured...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
