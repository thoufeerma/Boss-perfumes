"use client";

import Link from "next/link";
import Image from "next/image";
import { fragranceFamilies } from "@/data/fragranceFamilies";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ShopByFragrance() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="pt-14 pb-14 md:pt-16 md:pb-16 bg-brand-bg-secondary relative">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 relative">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text mb-3">Shop by Fragrance</h2>
          <p className="text-brand-text-muted text-lg max-w-2xl mx-auto">
            Discover your signature scent by fragrance family.
          </p>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-2 lg:left-8 top-[60%] -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm border border-brand-border rounded-full flex items-center justify-center text-brand-text hover:bg-brand-surface hover:text-brand-accent transition-all shadow-sm lg:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => scroll("right")}
          className="absolute right-2 lg:right-8 top-[60%] -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm border border-brand-border rounded-full flex items-center justify-center text-brand-text hover:bg-brand-surface hover:text-brand-accent transition-all shadow-sm lg:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Container for Mobile/Tablet, Centered Flex on Desktop */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 -mt-4 lg:pb-0 lg:justify-center lg:flex-wrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
          
          <div className="flex gap-6 md:gap-10 lg:gap-12 min-w-max lg:min-w-0 px-4 lg:px-0 mx-auto">
            {fragranceFamilies.map((family) => (
              <Link 
                href={`/collections?scent=${family.slug}`} 
                key={family.id}
                className="group flex flex-col items-center snap-center cursor-pointer shrink-0"
              >
                {/* Circular Image Container */}
                <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] rounded-full overflow-hidden mb-6 border-2 border-transparent transition-all duration-300 ease-in-out group-hover:border-[#D4AF37] group-hover:-translate-y-[6px]">
                  <Image
                    src={family.image}
                    alt={family.name}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 120px, (max-width: 1024px) 140px, 160px"
                  />
                  {/* Subtle darkening overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 ease-in-out z-10" />
                </div>

                {/* Category Title */}
                <h3 className="font-serif text-brand-text text-base md:text-lg transition-colors duration-300 ease-in-out group-hover:text-[#D4AF37]">
                  {family.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}
