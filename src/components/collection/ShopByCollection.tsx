import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/api/categories";
import { getLocale } from "@/lib/i18n/server";
import { translateCategoryName } from "@/lib/i18n/products";

export async function ShopByCollection() {
  const locale = await getLocale();
  // Fetch categories that actually have products, excluding the "Uncategorized" (usually id 15)
  const categories = await getCategories({ hide_empty: "true", per_page: "5" });

  if (!categories || categories.length === 0) return null;

  const heading = locale === "ar" ? "تسوق حسب عائلة العطور" : "Shop by Fragrance Family";
  const subtitle = locale === "ar" 
    ? "اكتشف طابع العطر المثالي الذي يلائم شخصيتك وأسلوبك الفريد." 
    : "Discover the perfect scent profile tailored to your unique personality and style.";

  return (
    <section className="py-8 md:py-12 bg-brand-surface px-6 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text mb-6">{heading}</h2>
          <p className="text-brand-text-muted max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => {
            const localizedName = translateCategoryName(category.name, locale);
            return (
              <Link 
                key={category.slug} 
                href={`/collections/${category.slug}`}
                className="group relative overflow-hidden aspect-[3/4] block"
              >
                <Image
                  src={category.image?.src || "/images/campaign-hero.png"}
                  alt={localizedName}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-[1500ms] ease-out"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-serif tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    {localizedName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
