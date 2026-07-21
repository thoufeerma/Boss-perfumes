"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ACFHomepageData } from "@/lib/wordpress";

interface LuxuryCampaignBannerProps {
  data?: ACFHomepageData | null;
}

export function LuxuryCampaignBanner({ data }: LuxuryCampaignBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const heading = data?.combo_heading || "Combos They'll Love";
  const description = data?.combo_description || "Curated fragrance combos featuring timeless classics and modern favorites—more value, more variety, perfect for every occasion.";
  const buttonText = data?.combo_button_text || "Shop Combo Collection";
  const buttonLink = data?.combo_button_link || "/collections/combos";
  const imageUrl = data?.combo_background_image?.url || "/images/luxury-gifting-banner.png";
  const imageAlt = data?.combo_background_image?.alt || "Luxury Perfume Gifting";

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current || !bgRef.current) {
            ticking = false;
            return;
          }
          
          // Disable parallax on mobile where we don't pin
          if (window.innerWidth < 768) {
            bgRef.current.style.transform = `translateY(0)`;
            ticking = false;
            return;
          }
          
          const rect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Pinning happens when rect.top <= 0 and rect.bottom >= viewportHeight (which is 200vh total)
          if (rect.top <= 0 && rect.top >= -viewportHeight) {
            const progress = Math.abs(rect.top) / viewportHeight; // 0 to 1
            // Move background extremely slowly (10vh over 100vh of scroll)
            bgRef.current.style.transform = `translateY(-${progress * 10}vh)`;
          } else if (rect.top > 0) {
            bgRef.current.style.transform = `translateY(0)`;
          } else {
            bgRef.current.style.transform = `translateY(-10vh)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-[100vh] md:h-[200vh] md:mb-[-100vh] md:-z-10 bg-[#111]"
    >
      {/* Pinned Container */}
      <div className="relative md:sticky top-0 w-full h-[100vh] flex items-center justify-center overflow-hidden">
        
        {/* Background Image Container with extra height for parallax */}
        <div 
          ref={bgRef}
          className="absolute top-0 left-0 w-full h-[100vh] md:h-[110vh] z-0 will-change-transform"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          {/* Overlay reduced opacity */}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-[700px] mx-auto flex flex-col items-center">
          <h2 className="text-[36px] md:text-[48px] lg:text-[68px] font-serif text-white mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
            {heading}
          </h2>
          <p className="text-white/95 text-lg md:text-xl mb-9 font-light leading-relaxed drop-shadow-sm">
            {description}
          </p>
          <Link
            href={buttonLink}
            className="bg-[#111111] text-white px-10 py-4 text-[13px] font-medium tracking-widest uppercase border border-transparent hover:bg-[rgba(255,255,255,0.1)] hover:border-white hover:-translate-y-[2px] transition-all duration-[250ms] ease-out"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
