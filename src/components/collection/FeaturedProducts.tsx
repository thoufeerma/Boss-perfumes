import { getFeaturedProducts } from "@/api/products";
import { ProductCarousel } from "./ProductCarousel";
import Link from "next/link";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8);

  return (
    <section className="py-8 md:py-12 bg-brand-surface px-6 lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-col items-center mb-8 gap-6">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-text mb-2 text-center">Most Popular Perfumes</h2>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
