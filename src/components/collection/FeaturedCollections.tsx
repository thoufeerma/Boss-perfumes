import Image from "next/image";
import Link from "next/link";

const COLLECTIONS = [
  {
    id: 1,
    title: "Gold Dust & Cracked Perfumes",
    description: "One of the most defining fragrance notes of Gold Dust is cinnamon.",
    image: "/images/product-placeholder.png",
    link: "/category/gold-dust",
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: 2,
    title: "Women's Fragrances",
    description: "Women's fragrances - 100ml Eau de Parfum, 100ml Aftershave Balm & a Pouch.",
    image: "/images/product-placeholder.png",
    link: "/category/women",
    aspectRatio: "aspect-[3/4]",
  }
];

export function FeaturedCollections() {
  return (
    <section className="py-8 md:py-12 bg-brand-bg px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-brand-text mb-8 tracking-tight leading-tight">
            WHERE EVERY DROP IS A PORTAL TO A HIDDEN WORLD
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          {COLLECTIONS.map((collection, index) => (
            <div 
              key={collection.id} 
              className={`group flex flex-col ${index % 2 !== 0 ? 'md:mt-24' : ''}`}
            >
              <Link href={collection.link} className="block overflow-hidden bg-brand-surface mb-8">
                <div className={`relative w-full ${collection.aspectRatio} overflow-hidden`}>
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </Link>
              <div className="text-center px-4">
                <h3 className="text-2xl font-serif text-brand-text mb-3">{collection.title}</h3>
                <p className="text-brand-text-muted text-sm mb-6 max-w-sm mx-auto">{collection.description}</p>
                <Link 
                  href={collection.link}
                  className="inline-block text-xs font-medium tracking-widest uppercase text-brand-text relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-text hover:text-brand-accent hover:after:bg-brand-accent transition-colors duration-300"
                >
                  Shop Selection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
