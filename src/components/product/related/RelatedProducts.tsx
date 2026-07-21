import { type WCProduct } from "@/api/products";
import { ProductCarousel } from "@/components/collection/ProductCarousel";

interface RelatedProductsProps {
  products: WCProduct[];
  title?: string;
}

export function RelatedProducts({ products, title = "You May Also Like" }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 border-t border-[#ECE8E2]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <h2 className="text-3xl lg:text-4xl font-serif text-center mb-12 text-[#111111]">
          {title}
        </h2>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
