"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryImage } from "./GalleryImage";

const BOUTIQUE_IMAGES = [
  "/shop images/shop image (8).webp",
  "/shop images/shop image (1).webp",
  "/shop images/shop image (2).webp",
  "/shop images/shop image (3).webp",
  "/shop images/shop image (4).webp",
  "/shop images/shop image (5).webp",
  "/shop images/shop image (6).webp",
  "/shop images/shop image (7).webp",
];

export function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current) {
        // Calculate the total scrollable width of the track (total width - viewport width)
        const totalWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        setTrackWidth(totalWidth - viewportWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    // A small delay to ensure images/layout have painted
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let currentTranslate = 0;
    let targetTranslate = 0;
    
    // Easing factor for smoothness (0.1 to 1) - closer to 1 is less smooth/more rigid
    const ease = 0.04;

    const updateScroll = () => {
      if (containerRef.current && trackRef.current) {
        const { top, height } = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how far we've scrolled into the container
        // When top === 0, we've just started pinning.
        // When top === -(height - viewportHeight), we are at the end.
        
        const scrollDistance = height - viewportHeight;
        
        let progress = 0;
        if (top <= 0) {
          progress = Math.min(1, Math.max(0, -top / scrollDistance));
        }

        // Map progress to the exact horizontal translation needed
        targetTranslate = progress * trackWidth;
      }

      // Smooth interpolation
      currentTranslate += (targetTranslate - currentTranslate) * ease;
      
      // Prevent microscopic updates
      if (Math.abs(targetTranslate - currentTranslate) > 0.01) {
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${currentTranslate}px, 0, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(updateScroll);
    };

    animationFrameId = requestAnimationFrame(updateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [trackWidth]);

  // We set the container height to 400vh to give the user enough scroll space 
  // to slowly move through the horizontal track.
  return (
    <div ref={containerRef} className="relative w-full h-[800vh] bg-brand-surface">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center">
        
        <div 
          ref={trackRef} 
          className="flex items-center gap-12 md:gap-16 lg:gap-24 px-[10vw] md:px-[20vw] will-change-transform"
        >
          {/* Intro Text Block */}
          <div className="shrink-0 w-[85vw] md:w-[40vw] lg:w-[30vw] flex flex-col items-start text-left">
            <span className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-brand-text/60 font-medium mb-16 md:mb-24 block">
              Curated Works
            </span>
            <div className="flex flex-col mb-8 relative">
              <span className="text-6xl md:text-8xl lg:text-9xl font-serif text-brand-text/10 leading-none -mb-4 md:-mb-8">
                Nº 01
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text leading-tight uppercase relative z-10 whitespace-nowrap">
                Our Store
              </h1>
            </div>
            <p className="text-sm md:text-base text-brand-text-muted max-w-sm font-light leading-relaxed">
              A selection of spaces defined by their quiet presence and meticulous material application.
            </p>
          </div>

          {BOUTIQUE_IMAGES.map((src, index) => (
            <GalleryImage 
              key={index} 
              src={src} 
              alt={`Boutique view ${index + 1}`} 
              priority={index === 0} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
