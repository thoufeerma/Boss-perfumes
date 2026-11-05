import { fetchWC } from "./client";
import { getScentProfiles } from "./attributes";

const SCENT_SLUG_TO_ID: Record<string, string> = {
  oriental: "81",
  floral: "82",
  fruity: "83",
  woody: "84",
  fresh: "85",
};

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
  price_html?: string;
  tax_status?: string;
  tax_class?: string;
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

/**
 * Normalizes WooCommerce product prices so that customer-facing prices
 * are displayed inclusive of the UAE standard 5% VAT.
 *
 * When WooCommerce has 'woocommerce_prices_include_tax' = 'no', the REST API
 * returns raw ex-tax prices in `price`, `regular_price`, and `sale_price`.
 * Under UAE Federal Tax Authority rules (and matching WooCommerce setting
 * 'woocommerce_tax_display_shop' = 'incl'), retail shop prices must be displayed
 * inclusive of 5% VAT.
 */
export function normalizeProduct(product: any): WCProduct {
  if (!product || typeof product !== "object") return product;

  const isTaxable = product.tax_status === "taxable";
  if (!isTaxable) {
    return product as WCProduct;
  }

  const addTax = (val: string | number | undefined): string => {
    if (!val) return "";
    const num = parseFloat(String(val));
    if (isNaN(num) || num <= 0) return "";
    return (Math.round(num * 1.05 * 100) / 100).toFixed(2);
  };

  // If WooCommerce pre-rendered price_html is present, extract the exact inclusive shop price
  let displayPrice = "";
  if (product.price_html) {
    const insMatch = product.price_html.match(/<ins[^>]*>.*?<bdi>(?:<span[^>]*>[^<]*<\/span>)?([\d,.]+)/);
    if (insMatch) {
      displayPrice = insMatch[1].replace(/,/g, "");
    } else {
      const match = product.price_html.match(/<bdi>(?:<span[^>]*>[^<]*<\/span>)?([\d,.]+)/);
      if (match) {
        displayPrice = match[1].replace(/,/g, "");
      }
    }
  }

  if (!displayPrice) {
    displayPrice = addTax(product.price);
  }

  const displayRegularPrice = addTax(product.regular_price) || displayPrice;
  const displaySalePrice = product.sale_price ? addTax(product.sale_price) : "";

  return {
    ...product,
    price: displayPrice,
    regular_price: displayRegularPrice,
    sale_price: displaySalePrice,
  };
}

export function normalizeProducts(products: any): WCProduct[] {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct);
}

export async function getProducts(params?: Record<string, string>): Promise<WCProduct[]> {
  const products = await fetchWC("products", { params });
  return normalizeProducts(products);
}

export async function getFeaturedProducts(limit = 6): Promise<WCProduct[]> {
  // Try to get actual featured products. If none are set as featured in WC, we can just get the latest products.
  const featured = await fetchWC("products", { params: { featured: "true", per_page: limit.toString() } });
  
  if (featured && featured.length > 0) {
    return normalizeProducts(featured);
  }
  
  // Fallback: just return the latest products if no featured products exist
  const fallback = await fetchWC("products", { params: { per_page: limit.toString() } });
  return normalizeProducts(fallback);
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const products = await fetchWC("products", { params: { slug } });
  return products && products.length > 0 ? normalizeProduct(products[0]) : null;
}

export async function getProductsByCategory(categoryId: number, params?: Record<string, string>): Promise<WCProduct[]> {
  const products = await fetchWC("products", { params: { category: categoryId.toString(), ...params } });
  return normalizeProducts(products);
}

export async function getFilteredProducts(filters: Record<string, any>): Promise<WCProduct[]> {
  const params: Record<string, string> = { per_page: filters.perPage || "20", status: "publish" };
  
  if (filters.page) params.page = filters.page.toString();
  if (filters.category) params.category = filters.category.toString();
  if (filters.minPrice) {
    // Convert tax-inclusive filter bound back to base net price for WooCommerce database query
    const netMin = Math.floor(parseFloat(filters.minPrice) / 1.05);
    params.min_price = netMin.toString();
  }
  if (filters.maxPrice) {
    const netMax = Math.ceil(parseFloat(filters.maxPrice) / 1.05);
    params.max_price = netMax.toString();
  }
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

  if (filters.scent) {
    const rawTerms = filters.scent.toString().split(",").map((s: string) => s.trim().toLowerCase());
    const termIds: string[] = [];

    for (const term of rawTerms) {
      if (/^\d+$/.test(term)) {
        termIds.push(term);
      } else if (SCENT_SLUG_TO_ID[term]) {
        termIds.push(SCENT_SLUG_TO_ID[term]);
      }
    }

    if (termIds.length === 0) {
      try {
        const profiles = await getScentProfiles();
        for (const term of rawTerms) {
          const match = profiles.find(p => p.slug.toLowerCase() === term || p.name.toLowerCase() === term);
          if (match) termIds.push(match.id.toString());
        }
      } catch (e) {
        console.error("Error resolving scent profiles:", e);
      }
    }

    if (termIds.length > 0) {
      params.attribute = "pa_scent";
      params.attribute_term = termIds.join(",");
    }
  }

  const products = await fetchWC("products", { params });
  return normalizeProducts(products);
}

export async function getProductsByIds(ids: number[]): Promise<WCProduct[]> {
  if (!ids || ids.length === 0) return [];
  const products = await fetchWC("products", { params: { include: ids.join(","), per_page: ids.length.toString() } });
  return normalizeProducts(products);
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
