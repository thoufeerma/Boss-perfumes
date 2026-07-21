"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function EditorialStatement() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`
        w-full bg-brand-bg px-4 md:px-8
        flex justify-center items-center overflow-visible
        py-6 md:py-9
      `}
    >
      <div 
        className={`
          max-w-[900px] md:max-w-[1000px] w-full text-center overflow-visible
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `}
      >
        <h2 
          className="
            font-serif text-brand-text 
            text-[clamp(2.5rem,3.5vw,4.25rem)] font-light
            leading-[0.95] tracking-[-0.03em] uppercase
            mx-auto
            flex flex-col items-center gap-y-1 md:gap-y-2
          "
        >
          <div className="flex items-center justify-center flex-wrap">
            <span>WHERE EVERY</span>
            <span className="inline-block relative w-[1.6em] h-[0.75em] mx-[0.15em] align-middle rounded-full overflow-hidden group">
              <Image
                src="/images/campaign-hero.png"
                alt="Landscape"
                fill
                sizes="(max-width: 768px) 90px, 120px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </span>
            <span>DROP IS A</span>
          </div>
          <div className="flex items-center justify-center flex-wrap">
            <span>PORTAL</span>
            <span className="inline-block relative w-[0.75em] h-[0.75em] mx-[0.15em] align-middle rounded-full overflow-hidden group">
              <Image
                src="/images/campaign-hero.png"
                alt="Portrait"
                fill
                sizes="(max-width: 768px) 40px, 60px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 object-center"
              />
            </span>
            <span>TO A HIDDEN</span>
            <span className="inline-block relative w-[0.75em] h-[0.75em] mx-[0.15em] align-middle rounded-full overflow-hidden group">
              <Image
                src="/images/product-placeholder.png"
                alt="Bottle"
                fill
                sizes="(max-width: 768px) 40px, 60px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </span>
            <span>WORLD</span>
          </div>
        </h2>
      </div>
    </section>
  );
}
