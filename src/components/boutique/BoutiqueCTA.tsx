import Link from "next/link";
import Image from "next/image";

export function BoutiqueCTA() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/insta/insta (1).webp" 
          alt="Boss Perfumes Boutique"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for text readability */}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
          Experience True Luxury
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-light">
          Step inside our flagship boutique. A curated space designed to immerse you in the art of fine fragrance.
        </p>
        
        <Link 
          href="/our-boutique"
          className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-brand-text font-medium tracking-[0.2em] uppercase text-sm overflow-hidden transition-transform hover:scale-105 duration-300"
        >
          <span className="relative z-10">Explore Our Boutique</span>
          <div className="absolute inset-0 bg-brand-surface translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </Link>
      </div>
    </section>
  );
}
