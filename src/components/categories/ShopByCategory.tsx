import Image from "next/image";
import Link from "next/link";
import { getCategories, type WCCategory } from "@/api/categories";

const CATEGORY_IMAGES: Record<string, string> = {
  men: "/category/men1.webp",
  women: "/category/women1.webp",
  unisex: "/category/unisex1.webp",
  combos: "/category/combos1.webp",
};

interface CategoryCardProps {
  category: WCCategory;
  fallbackImage: string;
}

function CategoryCard({ category, fallbackImage }: CategoryCardProps) {
  // Prioritize local hardcoded images, then WC images, then fallback
  const imageSrc = CATEGORY_IMAGES[category.slug] || category.image?.src || fallbackImage;
  
  return (
    <Link 
      href={`/collections/${category.slug}`} 
      className="group flex flex-col bg-white rounded-[18px] border border-[#ECE8E2] overflow-hidden transition-all duration-300 hover:shadow-sm"
    >
      {/* ~80% Image Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F4]">
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          className="object-cover object-center transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Dark overlay on hover (10-15%) */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
      </div>

      {/* ~20% Text Area */}
      <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white shrink-0">
        <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-[#111111] mb-2 tracking-wide text-center">
          {category.name}
        </h3>
        
        <span className="text-[10px] md:text-xs font-medium tracking-widest uppercase text-gray-500 relative after:absolute after:-bottom-[2px] after:left-0 after:w-full after:h-[1px] after:bg-brand-text after:scale-x-0 after:origin-left group-hover:after:scale-x-100 after:transition-transform after:duration-300 group-hover:text-brand-text transition-colors duration-300">
          Shop Now
        </span>
      </div>
    </Link>
  );
}

export async function ShopByCategory() {
  const categories = await getCategories({ hide_empty: "false", per_page: "100" });
  
  const targetSlugs = ["men", "women", "unisex", "combos"];
  const displayCategories = targetSlugs.map(slug => {
    const found = categories.find(c => c.slug === slug || c.name.toLowerCase() === slug);
    return found || {
      id: Math.random(),
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      count: 0,
      image: null
    };
  });

  return (
    <section className="py-8 md:py-12 bg-brand-surface px-6 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-serif text-brand-text mb-4">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayCategories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category as WCCategory} 
              fallbackImage={CATEGORY_IMAGES[category.slug] || "/images/product-placeholder.png"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
