"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

interface BrandMarqueeProps {
  brands: Brand[];
  speed?: number; // duration in seconds
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

export function BrandMarquee({
  brands,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
}: BrandMarqueeProps) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="w-full bg-brand-surface py-8 md:py-12 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-8">
        <h2 className="text-center font-serif text-3xl md:text-[40px] text-brand-text font-light tracking-wide">
          Our Brands
        </h2>
      </div>

      <div 
        className="flex overflow-hidden w-full group/marquee"
        style={
          {
            "--marquee-duration": `${speed}s`,
            "--marquee-gap": "5rem",
          } as React.CSSProperties
        }
      >
        <div 
          className={cn(
            "flex shrink-0 min-w-full items-center justify-around gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]",
            direction === "left" ? "animate-marquee" : "animate-marquee [animation-direction:reverse]",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
          )}
        >
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="relative shrink-0 transition-all duration-300 ease-out hover:opacity-100 opacity-70 hover:scale-[1.03] grayscale mix-blend-multiply"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={200}
                height={80}
                className="object-contain h-[40px] md:h-[60px] lg:h-[75px] w-auto max-w-[140px] md:max-w-[220px]"
                unoptimized
              />
            </div>
          ))}
        </div>
        
        <div 
          className={cn(
            "flex shrink-0 min-w-full items-center justify-around gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]",
            direction === "left" ? "animate-marquee" : "animate-marquee [animation-direction:reverse]",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
          )}
          aria-hidden="true"
        >
          {brands.map((brand) => (
            <div 
              key={`${brand.id}-dup`} 
              className="relative shrink-0 transition-all duration-300 ease-out hover:opacity-100 opacity-70 hover:scale-[1.03] grayscale mix-blend-multiply"
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={200}
                height={80}
                className="object-contain h-[40px] md:h-[60px] lg:h-[75px] w-auto max-w-[140px] md:max-w-[220px]"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
