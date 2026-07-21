"use client";

import { useUIStore } from "@/store/ui-store";
import { useCartContext } from "@/components/cart/CartProvider";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { cart, cartCount } = useCartContext();
  const { remove, update, isUpdating } = useCart();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setCartOpen(false)}
      />

      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-md bg-brand-surface border-l border-brand-border transform transition-transform duration-500 ease-out flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 lg:p-8 border-b border-brand-border">
          <h2 className="text-xl font-serif text-brand-text tracking-widest uppercase">
            Your Cart {cartCount > 0 && `(${cartCount})`}
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 -mr-2 text-brand-text hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {(!cart || !cart.items || cart.items.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-text-muted">
              <p className="mb-4">Your cart is currently empty.</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="text-brand-text underline underline-offset-4 tracking-widest uppercase text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.items.map((item) => {
              // WooCommerce Store API returns a permalink for cart items, e.g., "https://store.com/product/my-slug/"
              // We extract the slug from the permalink to link to our headless frontend route.
              const slug = item.permalink ? item.permalink.split('/').filter(Boolean).pop() : '';
              
              return (
              <div key={item.key} className="flex gap-6 py-6 border-b border-brand-border first:pt-0">
                <Link 
                  href={slug ? `/product/${slug}` : '#'} 
                  onClick={() => setCartOpen(false)}
                  className="relative w-24 aspect-[3/4] bg-brand-bg-secondary flex-shrink-0 group block"
                >
                  <Image
                    src={item.images?.[0]?.src || "/images/product-placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="96px"
                  />
                </Link>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link 
                        href={slug ? `/product/${slug}` : '#'} 
                        onClick={() => setCartOpen(false)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <h3 className="font-serif text-brand-text text-lg">{item.name}</h3>
                      </Link>
                      <span className="text-xs uppercase tracking-widest text-brand-text-muted">{item.sku}</span>
                    </div>
                    <span className="font-medium text-brand-text">
                      {formatPrice(item.prices?.price, item.prices?.currency_code, 10 ** (item.prices?.currency_minor_unit || 2))}
                    </span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-brand-border">
                      <button 
                        className="p-2 text-brand-text hover:bg-brand-bg-secondary transition-colors disabled:opacity-50"
                        onClick={() => update(item.key, Math.max(1, item.quantity - 1))}
                        disabled={isUpdating}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        className="p-2 text-brand-text hover:bg-brand-bg-secondary transition-colors disabled:opacity-50"
                        onClick={() => update(item.key, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => remove(item.key)}
                      disabled={isUpdating}
                      className="text-xs uppercase tracking-widest text-brand-text-muted hover:text-brand-text transition-colors underline underline-offset-4 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Footer */}
        {cart && cart.items && cart.items.length > 0 && cart.totals && (
          <div className="p-6 lg:p-8 border-t border-brand-border bg-brand-bg">
            <div className="flex justify-between text-brand-text mb-6">
              <span className="uppercase tracking-widest text-sm font-medium">Subtotal</span>
              <span className="font-medium">
                {formatPrice(cart.totals.total_price, cart.totals.currency_code, 10 ** (cart.totals.currency_minor_unit || 2))}
              </span>
            </div>
            <p className="text-brand-text-muted text-xs mb-6 text-center">Shipping & taxes calculated at checkout.</p>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="flex items-center justify-center w-full py-4 bg-brand-text text-white text-sm font-medium tracking-widest uppercase hover:bg-brand-accent transition-colors duration-300"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
