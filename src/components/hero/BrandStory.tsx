import Image from "next/image";
import Link from "next/link";

export function BrandStory() {
  return (
    <section className="py-8 md:py-12 bg-brand-surface px-6 lg:px-12">
      <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left: Image */}
        <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-square overflow-hidden bg-brand-bg-secondary">
          <Image
            src="/images/campaign-hero.png"
            alt="Boss Perfumes Craftsmanship"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <span className="text-sm font-medium tracking-widest uppercase text-brand-text-muted mb-6">Our Legacy</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-text mb-8 leading-tight">
            Crafting Memories <br /> Through Scent
          </h2>
          <div className="space-y-6 text-lg text-brand-text-muted font-light mb-12 max-w-xl">
            <p>
              Founded on the principles of uncompromising quality and visionary artistry, Boss Perfumes represents the pinnacle of modern luxury fragrance. Each bottle is a testament to our dedication to sourcing the world's most precious and rare ingredients.
            </p>
            <p>
              Our master perfumers blend traditional techniques with contemporary innovation, resulting in olfactory masterpieces that transcend time and trends, becoming an intimate part of your personal narrative.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center text-sm font-medium tracking-widest uppercase text-brand-text hover:text-brand-accent transition-colors duration-300"
          >
            <span className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-text group-hover:after:bg-brand-accent transition-colors duration-300">
              Speak with us
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
