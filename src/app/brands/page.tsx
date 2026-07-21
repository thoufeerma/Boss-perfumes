import { getBrands } from "@/api/brands";
import { generatePageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
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
        <header className="mb-12 border-b border-brand-border pb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-text mb-4">Our Brands</h1>
          <p className="text-brand-text-muted max-w-2xl text-lg">
            Discover our curated collection of the world's most prestigious fragrance houses and luxury brands.
          </p>
        </header>

        {brands.length === 0 ? (
          <div className="py-24 text-center text-brand-text-muted">
            No brands available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/brands/${brand.slug}`}
                className="group flex flex-col bg-white rounded-[18px] border border-[#ECE8E2] hover:border-[#D0C9C0] overflow-hidden p-[18px] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="aspect-[4/3] w-full bg-[#FAF8F4] rounded-t-[17px] mb-4 flex items-center justify-center p-6 relative overflow-hidden">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-brand-text/30 group-hover:text-brand-text/50 transition-colors">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-[16px] font-serif font-medium text-[#111111] line-clamp-1">
                    {brand.name}
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-brand-text-muted mt-1">
                    {brand.count} Products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
