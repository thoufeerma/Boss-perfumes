import { getBrands } from "@/api/brands";
import { generatePageMetadata } from "@/lib/metadata";
import { BrandsDirectory } from "@/components/brands/BrandsDirectory";
import { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Our Brands",
  description: "Explore the world's most luxurious perfume brands at Boss Perfumes.",
  slug: "brands"
});

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="bg-brand-bg-secondary min-h-screen">
      <div className="pt-32 lg:pt-[128px]" />
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <header className="mb-10 border-b border-brand-border pb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-text mb-4">Our Brands</h1>
          <p className="text-brand-text-muted max-w-2xl text-lg">
            Discover our curated collection of the world's most prestigious fragrance houses and luxury brands.
          </p>
        </header>

        <BrandsDirectory initialBrands={brands} />
      </div>
    </div>
  );
}
