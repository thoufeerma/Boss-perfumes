export interface VirtualCollectionConfig {
  title: string;
  subtitle?: string;
  description?: string;
  seoDescription?: string;
  breadcrumbLabel: string;
  baseFilters: {
    minPrice?: string;
    maxPrice?: string;
    onSale?: boolean;
    featured?: boolean;
    brand?: string;
    [key: string]: any;
  };
}

export const virtualCollections: Record<string, VirtualCollectionConfig> = {
  luxury: {
    title: "Luxury Collection",
    subtitle: "Exquisite fragrances above AED 299",
    description: "Discover our premium selection of luxury perfumes crafted with the finest ingredients.",
    seoDescription: "Shop the luxury perfume collection at Boss Perfumes. Premium fragrances above AED 299.",
    breadcrumbLabel: "Luxury",
    baseFilters: { minPrice: "299" }
  },
  offers: {
    title: "Special Offers",
    subtitle: "Premium fragrances on sale",
    description: "Explore our curated selection of discounted luxury perfumes.",
    seoDescription: "Shop special offers and discounted perfumes at Boss Perfumes.",
    breadcrumbLabel: "Offers",
    baseFilters: { onSale: true }
  }
};
