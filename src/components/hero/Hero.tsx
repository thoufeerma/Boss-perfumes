import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ACFHomepageData } from "@/lib/wordpress";

interface HeroProps {
  data?: ACFHomepageData | null;
}

export function Hero({ data }: HeroProps) {
  const headingText = data?.hero_heading || "Luxury\nCaptured In\nEvery Drop";
  const description = data?.hero_description || "Immerse yourself in a world of refined elegance and timeless fragrances crafted for the modern individual.";
  const primaryButtonText = data?.hero_primary_button_text || "Explore Collection";
  const primaryButtonLink = data?.hero_primary_button_link || "/collections";
  const secondaryButtonText = data?.hero_secondary_button_text || "Discover Signature Fragrances";
  const secondaryButtonLink = data?.hero_secondary_button_link || "/signature";
  const imageUrl = data?.hero_image?.url || "/images/campaign-hero.png";
  const imageAlt = data?.hero_image?.alt || "Boss Perfumes Luxury Campaign";

  return (
    <section className="relative w-full min-h-[100dvh] h-auto md:h-[100dvh] bg-brand-bg-secondary flex flex-col md:flex-row overflow-hidden">
      {/* Left Content */}
      <div className="w-full md:w-1/2 flex-1 md:h-full flex flex-col justify-center px-6 lg:px-16 xl:px-24 z-10 pt-32 pb-12 md:py-0">
        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] leading-[1.1] font-serif tracking-tight text-brand-text mb-6 mt-4 md:mt-0">
          {headingText.split("\n").map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <p className="text-lg md:text-xl text-brand-text-muted max-w-md mb-10 font-light">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <Link
            href={primaryButtonLink}
            className="group relative inline-flex items-center justify-center bg-brand-text text-white px-8 py-4 overflow-hidden transition-all duration-300 hover:bg-brand-accent hover:shadow-lg w-full sm:w-auto text-center"
          >
            <span className="relative z-10 text-sm font-medium tracking-widest uppercase">{primaryButtonText}</span>
          </Link>
          <Link
            href={secondaryButtonLink}
            className="group relative inline-flex items-center justify-center text-brand-text transition-colors duration-300 w-full sm:w-auto text-center py-2"
          >
            <span className="text-sm font-medium tracking-widest uppercase hover:text-brand-accent">{secondaryButtonText}</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-brand-border group-hover:bg-brand-accent transition-colors duration-300"></span>
          </Link>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 h-[50vh] sm:h-[60vh] md:h-full relative overflow-hidden shrink-0 mt-8 md:mt-0">
        <div className="absolute inset-0 bg-brand-bg-secondary mix-blend-multiply opacity-20 z-10 pointer-events-none" />
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}
