"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { type WCBrand } from "@/api/brands";
import { Pagination } from "@/components/common/Pagination";

interface BrandsDirectoryProps {
  initialBrands: WCBrand[];
}

const ITEMS_PER_PAGE = 20;

export function BrandsDirectory({ initialBrands }: BrandsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Collect available first letters from all brands
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    initialBrands.forEach((b) => {
      const firstChar = b.name.trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return ["ALL", ...Array.from(letters).sort()];
  }, [initialBrands]);

  // Filter brands based on search query and selected letter
  const filteredBrands = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialBrands.filter((brand) => {
      const matchesSearch = query === "" || brand.name.toLowerCase().includes(query);
      const firstChar = brand.name.trim().charAt(0).toUpperCase();
      const matchesLetter = selectedLetter === "ALL" || firstChar === selectedLetter;

      return matchesSearch && matchesLetter;
    });
  }, [initialBrands, searchQuery, selectedLetter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBrands.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBrands, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedLetter("ALL");
    setCurrentPage(1);
  };

  return (
    <div ref={topRef} className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Luxury Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search 
              className="absolute left-4 w-4 h-4 text-brand-text-muted pointer-events-none transition-colors" 
              strokeWidth={1.75} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search brands by name..."
              className="w-full bg-white ps-11 pe-10 py-3 rounded-full border border-[#ECE8E2] text-[13px] tracking-wide text-[#111111] placeholder:text-gray-400 placeholder:font-light shadow-sm transition-all focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/15"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-[#111111] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Counter Badge */}
        <div className="text-xs uppercase tracking-widest text-brand-text-muted self-start md:self-center">
          <span>
            {filteredBrands.length} {filteredBrands.length === 1 ? "Brand" : "Brands"}
            {filteredBrands.length !== initialBrands.length && ` (of ${initialBrands.length})`}
          </span>
        </div>
      </div>

      {/* Alphabet Quick Filter */}
      {alphabet.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {alphabet.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => handleLetterSelect(letter)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "bg-[#111111] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-[#ECE8E2] hover:border-[#111111] hover:text-[#111111]"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {/* Brands Grid / Empty State */}
      {filteredBrands.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#ECE8E2] p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F4] flex items-center justify-center mx-auto mb-4 border border-[#ECE8E2]">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-serif text-xl text-[#111111] mb-2">No brands found</h3>
          <p className="text-sm text-brand-text-muted mb-6">
            We couldn't find any brand matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#111111] text-white text-xs uppercase tracking-widest font-medium rounded-full hover:bg-black transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedBrands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/brands/${brand.slug}`}
                className="group flex flex-col bg-white rounded-[18px] border border-[#ECE8E2] hover:border-[#D0C9C0] overflow-hidden p-[18px] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="aspect-[4/3] w-full bg-[#FAF8F4] rounded-t-[17px] mb-4 flex items-center justify-center p-6 relative overflow-hidden">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-brand-text/30 group-hover:text-brand-text/50 transition-colors">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-[16px] font-serif font-medium text-[#111111] line-clamp-1">
                    {brand.name}
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-brand-text-muted mt-1">
                    {brand.count} {brand.count === 1 ? "Product" : "Products"}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Luxury Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
