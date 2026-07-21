import { getFilteredProducts } from "@/api/products";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "../common/EmptyState";
import { AlertCircle } from "lucide-react";

interface FilteredProductLoaderProps {
  baseFilters?: Record<string, any>;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function FilteredProductLoader({ baseFilters = {}, searchParams }: FilteredProductLoaderProps) {
  try {
    // Merge baseFilters (e.g. from virtual collection config or category route) with searchParams
    const mergedFilters = {
      ...baseFilters,
      ...searchParams,
    };

    const products = await getFilteredProducts(mergedFilters);

    if (!products || products.length === 0) {
      return (
        <EmptyState 
          title="No Products Available" 
          description="We couldn't find any products in this collection matching your criteria. Try adjusting your filters or browse other collections."
          actionLabel="Continue Shopping"
          actionHref="/collections"
        />
      );
    }

    return <ProductGrid products={products} />;
  } catch (error) {
    // If we updated fetchWC to throw, or if network fails before fetchWC handles it
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-serif text-[#111111] mb-3">Connection Error</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We're having trouble connecting to our store catalog right now. Please try refreshing the page.
        </p>
      </div>
    );
  }
}
