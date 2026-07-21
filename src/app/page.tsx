import { Hero } from "@/components/hero/Hero";
import { EditorialStatement } from "@/components/hero/EditorialStatement";
import { FeaturedProducts } from "@/components/collection/FeaturedProducts";
import { ShopByCategory } from "@/components/categories/ShopByCategory";
import { NewArrivals } from "@/components/collection/NewArrivals";
import { LuxuryCampaignBanner } from "@/components/hero/LuxuryCampaignBanner";
import { BestSellers } from "@/components/collection/BestSellers";
import { ShopByFragrance } from "@/components/home/ShopByFragrance";
import { BrandStory } from "@/components/hero/BrandStory";
import { InstagramGallery } from "@/components/collection/InstagramGallery";
import { BrandMarquee } from "@/components/brands/BrandMarquee";

import { getHomepageACF } from "@/lib/wordpress";

const BRANDS = [
  { id: "guerlain", name: "Guerlain", logo: "/brands/Guerlain.avif" },
  { id: "amouage", name: "Amouage", logo: "/brands/amouage_edited.avif" },
  { id: "creed", name: "Creed", logo: "/brands/creed.avif" },
  { id: "dunhill", name: "Dunhill", logo: "/brands/dunhill.avif" },
  { id: "armani", name: "Giorgio Armani", logo: "/brands/giorgio armani.avif" },
  { id: "gucci", name: "Gucci", logo: "/brands/gucci.avif" },
  { id: "guess", name: "Guess", logo: "/brands/guess.avif" },
  { id: "jeanpaul", name: "Jean Paul", logo: "/brands/jean paul.avif" },
  { id: "lancome", name: "Lancome", logo: "/brands/lancome.avif" },
  { id: "nishane", name: "Nishane", logo: "/brands/nishane.avif" },
  { id: "pacorabanne", name: "Paco Rabanne", logo: "/brands/paco rabanne.avif" },
];

export default async function Home() {
  const acfData = await getHomepageACF();

  return (
    <div className="flex flex-col">
      <Hero data={acfData} />
      <EditorialStatement />
      <FeaturedProducts />
      <BrandMarquee brands={BRANDS} />
      <ShopByCategory />
      <NewArrivals />
      <ShopByFragrance />
      <LuxuryCampaignBanner data={acfData} />
      <BestSellers data={acfData} />
      <BrandStory />
      <InstagramGallery />
    </div>
  );
}
