"use client";

import { type WCCategory } from "@/api/categories";
import { type WCAttributeTerm } from "@/api/attributes";
import { FilterDrawer } from "./filters/FilterDrawer";
import { FilterGroup } from "./filters/FilterGroup";
import { CategoryNavigation } from "./filters/CategoryNavigation";
import { CheckboxFilter } from "./filters/CheckboxFilter";
import { PriceSlider } from "./filters/PriceSlider";
import { BudgetFilter } from "./filters/BudgetFilter";
import { BrandSearch } from "./filters/BrandSearch";

interface FilterSidebarProps {
  categories: WCCategory[];
  brands: WCAttributeTerm[];
  sizes: WCAttributeTerm[];
  scents: WCAttributeTerm[];
  selectedCategorySlug?: string;
  maxPrice?: number;
  baseFilters?: Record<string, any>;
}

export function FilterSidebar({ 
  categories, 
  brands, 
  sizes, 
  scents, 
  selectedCategorySlug,
  maxPrice = 1000,
  baseFilters = {}
}: FilterSidebarProps) {
  
  return (
    <FilterDrawer>
      <div 
        className="space-y-2 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .space-y-2::-webkit-scrollbar { display: none; }
        `}} />
        {/* Premium Category Navigation */}
        <CategoryNavigation 
          categories={categories} 
          selectedCategorySlug={selectedCategorySlug} 
        />

        <FilterGroup title="Price">
          <PriceSlider maxProductPrice={maxPrice} baseFilters={baseFilters} />
        </FilterGroup>

        <FilterGroup title="Budget">
          <BudgetFilter baseFilters={baseFilters} />
        </FilterGroup>

        {sizes.length > 0 && (
          <FilterGroup title="Size">
            <CheckboxFilter paramKey="size" options={sizes} />
          </FilterGroup>
        )}

        {brands.length > 0 && (
          <FilterGroup title="Brand">
            <BrandSearch brands={brands} />
          </FilterGroup>
        )}

        {scents.length > 0 && (
          <FilterGroup title="Scent Profile">
            <CheckboxFilter paramKey="scent" options={scents} />
          </FilterGroup>
        )}
      </div>
    </FilterDrawer>
  );
}
