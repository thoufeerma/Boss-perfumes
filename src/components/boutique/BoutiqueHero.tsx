import React from "react";
import Image from "next/image";

export function BoutiqueHero() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-brand-surface overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 animate-fade-in-up">
        
        {/* Left: Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          {/* Eyebrow text */}
          <span className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-brand-text/60 font-medium mb-16 md:mb-24 block">
            Curated Works
          </span>

          <div className="flex flex-col mb-8 relative">
            <span className="text-6xl md:text-8xl lg:text-9xl font-serif text-brand-text/10 leading-none -mb-4 md:-mb-8">
              Nº 01
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text leading-tight uppercase relative z-10">
              Our Store
            </h1>
          </div>

          {/* Minimal Copy */}
          <p className="text-sm md:text-base text-brand-text-muted max-w-sm font-light leading-relaxed">
            A selection of spaces defined by their quiet presence and meticulous material application.
          </p>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 relative h-[50vh] md:h-[60vh] lg:h-[70vh] rounded-[20px] overflow-hidden shadow-xl">
          <Image
            src="/shop images/shop image (8).webp"
            alt="Our Store Showcase"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

      </div>
    </section>
  );
}
