import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";

export async function FeaturedCollections() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  const collections = [
    {
      id: 1,
      title: isAr ? "عطور فاخرة بلمسات شرقية" : "Gold Dust & Cracked Perfumes",
      description: isAr 
        ? "توليفة ساحرة تجمع بين نفحات القرفة الفاخرة والأخشاب العطرية النادرة."
        : "One of the most defining fragrance notes of Gold Dust is cinnamon.",
      image: "/images/product-placeholder.png",
      link: "/collections/luxury",
      aspectRatio: "aspect-[4/3]",
    },
    {
      id: 2,
      title: isAr ? "عطور نسائية ساحرة" : "Women's Fragrances",
      description: isAr 
        ? "مجموعة العطور النسائية - ماء عطر 100 مل، مع كريم مرطب وحقيبة أنيقة."
        : "Women's fragrances - 100ml Eau de Parfum, 100ml Aftershave Balm & a Pouch.",
      image: "/images/product-placeholder.png",
      link: "/collections/women",
      aspectRatio: "aspect-[3/4]",
    }
  ];

  const headline = isAr 
    ? "حيث كل قطرة تأخذك إلى عالم ساحر من الفخامة" 
    : "WHERE EVERY DROP IS A PORTAL TO A HIDDEN WORLD";

  const shopSelectionText = isAr ? "تسوق التشكيلة" : "Shop Selection";

  return (
    <section className="py-8 md:py-12 bg-brand-bg px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-brand-text mb-8 tracking-tight leading-tight">
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          {collections.map((collection, index) => (
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
                <p className="text-brand-text-muted text-sm mb-6 max-w-sm mx-auto leading-relaxed">{collection.description}</p>
                <Link 
                  href={collection.link}
                  className="inline-block text-xs font-medium tracking-widest uppercase text-brand-text relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-brand-text hover:text-brand-accent hover:after:bg-brand-accent transition-colors duration-300"
                >
                  {shopSelectionText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
