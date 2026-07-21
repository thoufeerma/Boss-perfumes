import { type WCCategory } from "@/api/categories";
import { type WCBrand } from "@/api/brands";
import { FilterSidebar } from "./FilterSidebar";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CollectionLayoutProps {
  title: string;
  categories: WCCategory[];
  brands: any[];
  sizes: any[];
  scents: any[];
  selectedCategorySlug?: string;
  breadcrumbs?: { label: string; href: string }[];
  baseFilters?: Record<string, any>;
  children: React.ReactNode;
}

export function CollectionLayout({ 
  title, 
  categories, 
  brands,
  sizes,
  scents,
  selectedCategorySlug,
  breadcrumbs,
  baseFilters = {},
  children
}: CollectionLayoutProps) {
  return (
    <div className="bg-brand-bg-secondary lg:h-screen lg:overflow-hidden lg:flex lg:flex-col">
      <div className="pt-32 lg:pt-[128px]" />
      
      <div className="mx-auto max-w-[1600px] w-full flex-1 flex flex-col lg:flex-row gap-12 px-6 lg:px-12 pb-24 lg:pb-0 lg:h-[calc(100vh-128px)]">
        {/* Sidebar Container */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:h-full lg:flex lg:flex-col">
          <FilterSidebar 
            categories={categories} 
            brands={brands}
            sizes={sizes}
            scents={scents}
            selectedCategorySlug={selectedCategorySlug} 
            baseFilters={baseFilters}
          />
        </div>

        {/* Content Side */}
        <div className="flex-1 flex flex-col lg:overflow-hidden">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4 flex items-center gap-2 text-[10px] tracking-widest uppercase font-medium text-brand-text-muted">
              {breadcrumbs.map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <Link href={crumb.href} className="hover:text-brand-text transition-colors">
                    {crumb.label}
                  </Link>
                  {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
                </div>
              ))}
            </nav>
          )}
          <header className="mb-8 flex justify-between items-end border-b border-brand-border pb-6 flex-shrink-0">
            <h1 className="text-4xl md:text-5xl font-serif text-brand-text">{title}</h1>
          </header>

          {/* Independent Scrolling Grid Area */}
          <div 
            className="lg:flex-1 lg:overflow-y-auto lg:pr-4 pb-24 lg:pb-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              .lg\\:overflow-y-auto::-webkit-scrollbar { display: none; }
            `}} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
