"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/components/product/ProductCard";
import { type WCProduct } from "@/api/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: WCProduct[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!products || products.length === 0) {
    return (
      <div className="py-8 md:py-12 text-center text-brand-text-muted">
        No products available at this time.
      </div>
    );
  }
  
  const totalSlides = scrollSnaps.length || 1;
  const currentSlide = Math.min(selectedIndex + 1, totalSlides);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-8 lg:-ml-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-1/2 lg:w-1/4 pl-4 md:pl-8 lg:pl-8"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        className={cn(
          "absolute left-0 md:-left-6 lg:-left-12 top-1/2 -translate-y-1/2 z-10",
          "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white text-brand-text shadow-md shadow-black/5",
          "opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 disabled:opacity-0",
          "hover:bg-brand-bg hover:scale-105"
        )}
        aria-label="Previous slide"
        disabled={!emblaApi?.canScrollPrev()}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={scrollNext}
        className={cn(
          "absolute right-0 md:-right-6 lg:-right-12 top-1/2 -translate-y-1/2 z-10",
          "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white text-brand-text shadow-md shadow-black/5",
          "opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 disabled:opacity-0",
          "hover:bg-brand-bg hover:scale-105"
        )}
        aria-label="Next slide"
        disabled={!emblaApi?.canScrollNext()}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      </button>
    </div>
  );
}
