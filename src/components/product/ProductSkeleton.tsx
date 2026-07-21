export function GallerySkeleton() {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 w-full animate-pulse">
      <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-20 h-24 lg:w-24 lg:h-28 bg-gray-200 rounded-lg flex-shrink-0" />
        ))}
      </div>
      <div className="flex-1 aspect-[4/5] lg:aspect-auto lg:h-[80vh] bg-gray-200 rounded-xl" />
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Title & Brand */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Price */}
      <div className="h-8 w-32 bg-gray-200 rounded" />

      {/* Short Description */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-4/6 bg-gray-200 rounded" />
      </div>

      {/* Attributes */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="h-12 w-full bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
      </div>

      {/* Purchase block */}
      <div className="pt-6 space-y-4">
        <div className="flex gap-4">
          <div className="h-14 w-32 bg-gray-200 rounded-lg" />
          <div className="h-14 flex-1 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-14 w-full bg-gray-200 rounded-lg" />
      </div>

      {/* Accordions */}
      <div className="space-y-2 pt-6">
        <div className="h-12 w-full bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
        <div className="h-12 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="w-full lg:w-[60%]">
          <GallerySkeleton />
        </div>
        <div className="w-full lg:w-[40%]">
          <ProductInfoSkeleton />
        </div>
      </div>
    </div>
  );
}
