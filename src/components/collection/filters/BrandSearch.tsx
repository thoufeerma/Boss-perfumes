"use client";

import { useState } from "react";
import { type WCAttributeTerm } from "@/api/attributes";
import { CheckboxFilter } from "./CheckboxFilter";
import { Search } from "lucide-react";

interface BrandSearchProps {
  brands: WCAttributeTerm[];
}

export function BrandSearch({ brands }: BrandSearchProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const displayedBrands = showAll ? filteredBrands : filteredBrands.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search brands..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#FAF8F4] border border-[#ECE8E2] rounded-md text-[13px] text-[#111111] focus:outline-none focus:border-brand-text transition-colors"
        />
      </div>

      <CheckboxFilter paramKey="brand" options={displayedBrands} />

      {filteredBrands.length > 10 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-[11px] font-bold uppercase tracking-widest text-brand-text hover:text-brand-accent transition-colors"
        >
          {showAll ? "Show Less" : `Show All ${filteredBrands.length} Brands`}
        </button>
      )}
    </div>
  );
}
