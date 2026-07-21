import { fetchWC } from "./client";

export interface WCImage {
  id: number;
  src: string;
  alt: string;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  currency?: string;
  stock_status?: string;
  average_rating?: string;
  review_count?: number;
  description?: string;
  short_description?: string;
  images: WCImage[];
  featured: boolean;
  categories: { id: number; name: string; slug: string }[];
  stock_quantity?: number;
  attributes: {
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[];
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
}

export async function getProducts(params?: Record<string, string>): Promise<WCProduct[]> {
  return fetchWC("products", { params });
}

export async function getFeaturedProducts(limit = 6): Promise<WCProduct[]> {
  // Try to get actual featured products. If none are set as featured in WC, we can just get the latest products.
  const featured = await fetchWC("products", { params: { featured: "true", per_page: limit.toString() } });
  
  if (featured && featured.length > 0) {
    return featured;
  }
  
  // Fallback: just return the latest products if no featured products exist
  return fetchWC("products", { params: { per_page: limit.toString() } });
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const products = await fetchWC("products", { params: { slug } });
  return products.length > 0 ? products[0] : null;
}

export async function getProductsByCategory(categoryId: number, params?: Record<string, string>): Promise<WCProduct[]> {
  return fetchWC("products", { params: { category: categoryId.toString(), ...params } });
}

export async function getFilteredProducts(filters: Record<string, any>): Promise<WCProduct[]> {
  const params: Record<string, string> = { per_page: filters.perPage || "24", status: "publish" };
  
  if (filters.page) params.page = filters.page.toString();
  if (filters.category) params.category = filters.category.toString();
  if (filters.minPrice) params.min_price = filters.minPrice.toString();
  if (filters.maxPrice) params.max_price = filters.maxPrice.toString();
  if (filters.onSale) params.on_sale = "true";
  if (filters.featured) params.featured = "true";
  if (filters.search) params.search = filters.search.toString();
  
  // Sort mapping
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        params.orderby = 'price';
        params.order = 'asc';
        break;
      case 'price-desc':
        params.orderby = 'price';
        params.order = 'desc';
        break;
      case 'date':
        params.orderby = 'date';
        params.order = 'desc';
        break;
      case 'popularity':
        params.orderby = 'popularity';
        params.order = 'desc';
        break;
      case 'rating':
        params.orderby = 'rating';
        params.order = 'desc';
        break;
    }
  }

  if (filters.brand) {
    // Since the site uses the "Brands for WooCommerce" plugin,
    // the REST API expects the 'brand' parameter directly.
    params.brand = filters.brand.toString();
  }

  return fetchWC("products", { params });
}

export async function getProductsByIds(ids: number[]): Promise<WCProduct[]> {
  if (!ids || ids.length === 0) return [];
  return fetchWC("products", { params: { include: ids.join(","), per_page: ids.length.toString() } });
}

export async function getRelatedProducts(productId: number): Promise<WCProduct[]> {
  const product = await fetchWC(`products/${productId}`);
  if (!product || !product.related_ids || product.related_ids.length === 0) return [];
  return getProductsByIds(product.related_ids);
}

export async function getUpsellProducts(productId: number): Promise<WCProduct[]> {
  const product = await fetchWC(`products/${productId}`);
  if (!product || !product.upsell_ids || product.upsell_ids.length === 0) return [];
  return getProductsByIds(product.upsell_ids);
}

export async function getCrossSellProducts(productId: number): Promise<WCProduct[]> {
  const product = await fetchWC(`products/${productId}`);
  if (!product || !product.cross_sell_ids || product.cross_sell_ids.length === 0) return [];
  return getProductsByIds(product.cross_sell_ids);
}
