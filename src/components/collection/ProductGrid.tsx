import { type WCProduct } from "@/api/products";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductGridProps {
  products: WCProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
