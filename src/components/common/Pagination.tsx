"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push("ellipsis");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("ellipsis");

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <nav 
      aria-label="Pagination" 
      className={cn("flex items-center justify-center gap-1 sm:gap-2 mt-12 pt-8 border-t border-[#ECE8E2]", className)}
    >
      {/* Previous Page */}
      {currentPage > 1 ? (
        onPageChange ? (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-brand-text hover:text-brand-accent transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
        ) : (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-brand-text hover:text-brand-accent transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </Link>
        )
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Numbered Pages */}
      <div className="flex items-center gap-1 sm:gap-1.5 mx-2">
        {getPageNumbers().map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                …
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return onPageChange ? (
            <button
              key={item}
              onClick={() => handlePageClick(item)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "w-9 h-9 rounded-full text-xs font-serif transition-all flex items-center justify-center",
                isCurrent
                  ? "bg-[#111111] text-white font-medium shadow-sm"
                  : "text-brand-text hover:bg-[#FAF8F4] hover:text-[#111111] border border-transparent hover:border-[#ECE8E2]"
              )}
            >
              {item}
            </button>
          ) : (
            <Link
              key={item}
              href={createPageUrl(item)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "w-9 h-9 rounded-full text-xs font-serif transition-all flex items-center justify-center",
                isCurrent
                  ? "bg-[#111111] text-white font-medium shadow-sm"
                  : "text-brand-text hover:bg-[#FAF8F4] hover:text-[#111111] border border-transparent hover:border-[#ECE8E2]"
              )}
            >
              {item}
            </Link>
          );
        })}
      </div>

      {/* Next Page */}
      {currentPage < totalPages ? (
        onPageChange ? (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-brand-text hover:text-brand-accent transition-colors"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-brand-text hover:text-brand-accent transition-colors"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-widest font-medium text-gray-300 cursor-not-allowed">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
