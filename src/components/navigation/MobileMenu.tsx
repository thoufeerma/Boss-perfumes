"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { createUrl } from "@/lib/navigation";

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Brands", href: "/brands" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Luxury Collection", href: "/collections/luxury" },
  { label: "Offers", href: "/collections/offers" },
  { label: "Wishlist", href: "/wishlist?v=new" },
  { label: "Account", href: "/account" },
];

export function MobileMenu() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-[100dvh] w-full max-w-sm bg-brand-surface border-r border-brand-border transform transition-transform duration-500 ease-out lg:hidden flex flex-col pt-24 pb-8 px-8",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-6">
          {NAV_LINKS.map((link, i) => {
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
                  "text-2xl font-serif transition-colors",
                  isActive ? "text-brand-text" : "text-brand-text/60 hover:text-brand-text"
                )}
                onClick={() => setMobileMenuOpen(false)}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : '0ms' }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto">
          <p className="text-sm text-brand-text-muted mb-4 uppercase tracking-widest">Need Help?</p>
          <a href="mailto:brbossperfumes@gmail.com" className="text-base text-brand-text hover:underline underline-offset-4">brbossperfumes@gmail.com</a>
        </div>
      </div>
    </>
  );
}
