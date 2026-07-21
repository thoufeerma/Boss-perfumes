import { getProducts } from "@/api/products";
import { ProductCarousel } from "./ProductCarousel";
import Link from "next/link";

export async function NewArrivals() {
  // Fetch latest products
  const products = await getProducts({ per_page: "8" });

  return (
    <section className="py-8 md:py-12 bg-brand-surface px-6 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-text mb-4">Best Sellers</h2>
            <p className="text-brand-text-muted text-lg max-w-xl">
              Experience the best-selling masterpieces crafted by our master perfumers.
            </p>
          </div>
          <Link 
            href="/collections"
            className="group inline-flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-brand-text hover:text-brand-accent transition-colors duration-300"
          >
            <span className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-text group-hover:after:bg-brand-accent transition-colors duration-300">
              View All
            </span>
          </Link>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
