"use client";

import Link from "next/link";
import { type WCCategory } from "@/api/categories";
import { cn } from "@/lib/utils";
import { FilterGroup } from "./FilterGroup";

interface CategoryNavigationProps {
  categories: WCCategory[];
  selectedCategorySlug?: string;
}

export function CategoryNavigation({ categories, selectedCategorySlug }: CategoryNavigationProps) {
  // Filter out 'uncategorized' and optionally empty categories
  const validCategories = categories.filter(
    (c) => c.slug.toLowerCase() !== "uncategorized" && c.count > 0
  );

  return (
    <FilterGroup title="Categories" defaultExpanded={true}>
      <div className="space-y-3">
        {/* All Collections Option */}
        <Link 
          href="/collections"
          scroll={false}
          className="flex items-center gap-3 cursor-pointer group w-full focus:outline-none"
        >
          <div 
            className={cn(
              "w-[18px] h-[18px] rounded-[6px] border flex flex-shrink-0 items-center justify-center transition-all duration-200 ease-in-out",
              !selectedCategorySlug 
                ? "bg-[#111111] border-[#111111]" 
                : "border-[#D1CFC9] group-hover:border-[#999999]"
            )}
          >
            {!selectedCategorySlug && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span 
            className={cn(
              "text-[13px] transition-colors duration-200 flex-1 text-left",
              !selectedCategorySlug ? "font-bold text-[#111111]" : "text-gray-500 group-hover:text-[#111111]"
            )}
          >
            All Collections
          </span>
        </Link>

        {validCategories.map((category) => {
          const isSelected = selectedCategorySlug === category.slug;
          return (
            <Link 
              key={category.id} 
              href={`/collections/${category.slug}`}
              scroll={false}
              className="flex items-center gap-3 cursor-pointer group w-full focus:outline-none"
            >
              <div 
                className={cn(
                  "w-[18px] h-[18px] rounded-[6px] border flex flex-shrink-0 items-center justify-center transition-all duration-200 ease-in-out",
                  isSelected 
                    ? "bg-[#111111] border-[#111111]" 
                    : "border-[#D1CFC9] group-hover:border-[#999999]"
                )}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span 
                className={cn(
                  "text-[13px] transition-colors duration-200 flex-1 text-left",
                  isSelected ? "font-bold text-[#111111]" : "text-gray-500 group-hover:text-[#111111]"
                )}
              >
                {category.name}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {category.count}
              </span>
            </Link>
          );
        })}
      </div>
    </FilterGroup>
  );
}
