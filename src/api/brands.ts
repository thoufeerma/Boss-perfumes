import { fetchWC } from "./client";
import { cache } from "react";

export interface WCBrand {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  logo?: string;
  seoMetadata?: {
    title?: string;
    description?: string;
  };
}

export const getBrands = cache(async (): Promise<WCBrand[]> => {
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
  if (!storeUrl) {
    console.warn("WooCommerce store URL is not set.");
    return [];
  }

  const url = new URL(`wp-json/wc/store/v1/products/brands`, storeUrl);
  
  try {
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`WooCommerce Brands API Error: ${response.statusText}`);
    }
    
    const brands = await response.json();
    
    return brands.map((brand: any) => {
      let logoUrl = undefined;
      if (brand.image) {
        logoUrl = typeof brand.image === 'string' ? brand.image : (brand.image.src || brand.image.url || undefined);
      }
      
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        count: brand.count,
        logo: logoUrl
      };
    });
  } catch (error) {
    console.error("WooCommerce Brands API Network Error:", error);
    throw error;
  }
});

export const getBrandBySlug = cache(async (slug: string): Promise<WCBrand | null> => {
  const brands = await getBrands();
  return brands.find(b => b.slug === slug) || null;
});
