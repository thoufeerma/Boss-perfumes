"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { createUrl } from "@/lib/navigation";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useAuthState } from "@/components/auth/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { useT, useLocale } from "@/components/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const NAV_LINKS = [
  { key: "collections", href: "/collections" },
  { key: "brands", href: "/brands" },
  { key: "men", href: "/collections/men" },
  { key: "women", href: "/collections/women" },
  { key: "luxuryCollection", href: "/collections/luxury" },
  { key: "wishlist", href: "/wishlist?v=new" },
  { key: "account", href: "/account" },
] as const;

export function MobileMenu() {
  const t = useT();
  const locale = useLocale();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthState();
  const { logout } = useAuth();
  
  useScrollLock(isMobileMenuOpen);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    setMobileMenuOpen(false);
  };

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
            // No entry in NAV_LINKS is "/", so startsWith needs no home-page guard.
            const isActive = pathname === link.href || pathname.startsWith(link.href);
            
            // Preserve query params when navigating between collections
            const isCollectionNav = pathname.startsWith("/collections") && link.href.startsWith("/collections");
            const finalHref = isCollectionNav 
              ? createUrl(link.href, searchParams, { page: null }) 
              : link.href;

            return (
              <Link
                key={link.key}
                href={finalHref}
                className={cn(
                  "text-2xl font-serif transition-colors",
                  isActive ? "text-brand-text" : "text-brand-text/60 hover:text-brand-text"
                )}
                onClick={() => setMobileMenuOpen(false)}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : '0ms' }}
              >
                {t.nav[link.key]}
              </Link>
            );
          })}
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-2xl font-serif transition-colors text-brand-text/60 hover:text-brand-text text-start"
              style={{ transitionDelay: isMobileMenuOpen ? `${NAV_LINKS.length * 50}ms` : '0ms' }}
            >
              {t.menu.logout}
            </button>
          )}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-brand-border space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-brand-text-muted">Language</span>
            <LanguageSwitcher current={locale} />
          </div>
          <div>
            <p className="text-xs text-brand-text-muted mb-2 uppercase tracking-widest">{t.menu.needHelp}</p>
            <a href="mailto:brbossperfumes@gmail.com" className="text-sm text-brand-text hover:underline underline-offset-4">brbossperfumes@gmail.com</a>
          </div>
        </div>
      </div>
    </>
  );
}
