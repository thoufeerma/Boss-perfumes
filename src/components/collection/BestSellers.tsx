import React from "react";
import { getProducts } from "@/api/products";
import { getCategoryBySlug } from "@/api/categories";
import { ProductCard } from "../product/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { ACFHomepageData } from "@/lib/wordpress";

interface BestSellersProps {
  data?: ACFHomepageData | null;
}

export async function BestSellers({ data }: BestSellersProps = {}) {
  // Fetch "combos" category products dynamically
  const category = await getCategoryBySlug("combos");
  let products = [];
  
  if (category) {
    products = await getProducts({ category: category.id.toString(), per_page: "4" });
  } else {
    // Fallback if category doesn't exist locally
    products = await getProducts({ per_page: "4" });
  }

  // Ensure exactly 4 products for the 2x2 grid
  products = products.slice(0, 4);

  if (!products || products.length === 0) return null;

  const leftLabel = data?.combo_left_label || "Combo Collection";
  const leftHeading = data?.combo_left_heading || "More Scents,\nBetter Value";
  const leftDescription = data?.combo_left_description || "Explore exclusive perfume combos featuring your favorite fragrances, thoughtfully paired to give you more for less.";
  const leftButtonText = data?.combo_left_button_text || "Shop Combos →";
  const leftButtonLink = data?.combo_left_button_link || "/collections/combos";
  const leftImageUrl = data?.combo_left_background_image?.url || "/images/luxury-gifting-banner.png";
  const leftImageAlt = data?.combo_left_background_image?.alt || "Luxury Gifts";

  return (
    <section className="py-20 bg-brand-bg-secondary px-6 lg:px-12 border-y border-brand-border">
      <div className="mx-auto max-w-[1600px]">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text mb-6">Our Gift Collection</h2>
          <p className="text-brand-text-muted text-lg max-w-2xl mx-auto">
            Curated luxury gift sets for every celebration and special occasion.
          </p>
        </div>

        {/* Split Editorial Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[32px]">
          
          {/* Left: Editorial Campaign Card (55%) */}
          <div className="w-full lg:w-[55%] flex flex-col">
            <Link 
              href={leftButtonLink} 
              className="group relative w-full h-full min-h-[500px] lg:min-h-[600px] flex flex-col justify-end p-8 md:p-12 rounded-[24px] md:rounded-[28px] overflow-hidden shadow-xl"
            >
              {/* Background Image with Hover Zoom */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={leftImageUrl}
                  alt={leftImageAlt}
                  fill
                  className="object-cover object-center transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                {/* Dark Luxury Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 mix-blend-multiply" />
              </div>

              {/* Content */}
              <div className="relative z-10 text-left">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] text-white/80 uppercase mb-4 drop-shadow-md">
                  {leftLabel}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-4 leading-tight drop-shadow-md">
                  {leftHeading.split("\n").map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <p className="text-white/90 text-sm md:text-base font-light max-w-md mb-8 leading-relaxed drop-shadow-md">
                  {leftDescription}
                </p>
                
                <span className="inline-flex items-center text-sm font-medium tracking-widest uppercase text-white hover:text-[#D4AF37] transition-colors duration-300">
                  <span className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-white group-hover:after:bg-[#D4AF37] transition-colors duration-300">
                    {leftButtonText}
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Products Grid (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center mt-6 lg:mt-0">
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
