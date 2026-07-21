"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  children: React.ReactNode;
}

export function FilterDrawer({ children }: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate active filter count
  const activeFiltersCount = Array.from(searchParams.keys()).length;

  const clearAll = () => {
    router.push(pathname);
    setIsOpen(false);
  };

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 border border-[#ECE8E2] px-4 py-2 rounded-full text-sm font-medium hover:border-[#111111] transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-[#111111] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Content */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-[85%] max-w-md bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 lg:bg-transparent lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#ECE8E2] lg:hidden">
          <h2 className="text-xl font-serif">Filters</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-0 lg:h-full lg:overflow-y-hidden">
          <div className="lg:h-full">
            {children}
          </div>
        </div>

        <div className="p-6 border-t border-[#ECE8E2] flex items-center gap-4 lg:hidden bg-white">
          <button 
            onClick={clearAll}
            className="flex-1 px-4 py-3 text-sm font-medium border border-[#ECE8E2] rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-3 text-sm font-medium bg-black text-white rounded-md hover:bg-black/90"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
