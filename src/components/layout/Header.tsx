"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useCartContext } from "@/components/cart/CartProvider";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import { createUrl } from "@/lib/navigation";

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Brands", href: "/brands" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Luxury", href: "/collections/luxury" },
  { label: "Offers", href: "/collections/offers" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen, setCartOpen } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerBg = isScrolled || isMobileMenuOpen ? "bg-white shadow-sm" : "bg-transparent";
  const textColor = isScrolled || isMobileMenuOpen ? "text-brand-text" : "text-brand-text"; 

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out",
        headerBg
      )}
    >
      <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
        {/* Left: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            
            // Preserve query params when navigating between collections
            const isCollectionNav = pathname.startsWith("/collections") && link.href.startsWith("/collections");
            const finalHref = isCollectionNav 
              ? createUrl(link.href, searchParams, { page: null }) 
              : link.href;

            return (
              <Link
                key={link.label}
                href={finalHref}
                className={cn(
                  "text-sm font-medium tracking-wide uppercase transition-colors duration-300 relative group",
                  isActive ? "text-brand-text" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute left-0 -bottom-1 w-full h-[1px] bg-brand-text transition-transform duration-300 origin-left ease-out",
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}></span>
              </Link>
            );
          })}
        </nav>

        {/* Left: Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 -ml-2 text-brand-text hover:opacity-70 transition-opacity"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
        </button>

        {/* Center: Logo */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <Image
            src="/black logo.png"
            alt="Boss Perfumes"
            width={140}
            height={48}
            className="h-8 md:h-12 w-auto object-contain"
            priority
            style={{ width: "auto" }}
          />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1 text-brand-text hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/account"
            className="hidden md:block p-1 text-brand-text hover:opacity-70 transition-opacity"
            aria-label="Account"
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/wishlist?v=new"
            className="p-1 text-brand-text hover:opacity-70 transition-opacity relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" strokeWidth={1.5} />
            <WishlistBadge />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="p-1 text-brand-text hover:opacity-70 transition-opacity relative"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            <CartBadge />
          </button>
        </div>
      </div>
    </header>
  );
}

function CartBadge() {
  const { cartCount } = useCartContext();
  
  if (cartCount === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-2 bg-[#111111] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
      {cartCount}
    </span>
  );
}

function WishlistBadge() {
  const wishlistCount = useWishlistStore(state => state.wishlistIds.length);
  const isInitialized = useWishlistStore(state => state.isInitialized);
  
  if (!isInitialized || wishlistCount === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-2 bg-[#111111] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
      {wishlistCount}
    </span>
  );
}
