"use client";

import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export function SearchDrawer() {
  const { isSearchOpen, setSearchOpen } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setSearchOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-brand-surface border-b border-brand-border transform transition-transform duration-500 ease-out",
          isSearchOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif text-brand-text">Search</h2>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 -mr-2 text-brand-text hover:opacity-70 transition-opacity"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-text-muted" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search for fragrances..."
              className="w-full bg-transparent border-none border-b border-brand-border pb-4 pl-10 text-2xl font-serif focus:outline-none focus:ring-0 placeholder:text-brand-text-muted/50"
              autoFocus={isSearchOpen}
            />
          </form>
          
          {/* Quick links placeholder */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-medium tracking-wide uppercase text-brand-text-muted mb-4">Trending Searches</h3>
              <ul className="flex flex-col gap-2">
                <li><a href="#" className="text-brand-text hover:text-brand-accent transition-colors">Oud Wood</a></li>
                <li><a href="#" className="text-brand-text hover:text-brand-accent transition-colors">Rose Noir</a></li>
                <li><a href="#" className="text-brand-text hover:text-brand-accent transition-colors">Summer Collection</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
