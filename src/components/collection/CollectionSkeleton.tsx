import { ProductCardSkeleton } from "@/components/product/ProductCard";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-12 bg-[#FAF8F4] min-h-screen">
      <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row gap-12">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Skeleton */}
        <div className="flex-1">
          <header className="mb-12 flex justify-between items-end border-b border-[#ECE8E2] pb-6">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </header>

          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
