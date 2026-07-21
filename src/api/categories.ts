import { fetchWC } from "./client";

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: {
    id: number;
    src: string;
    alt: string;
  } | null;
}

export async function getCategories(params?: Record<string, string>): Promise<WCCategory[]> {
  return fetchWC("products/categories", { params, next: { revalidate: 3600 } });
}

export async function getCategoryBySlug(slug: string): Promise<WCCategory | null> {
  const categories = await fetchWC("products/categories", { params: { slug }, next: { revalidate: 3600 } });
  return categories.length > 0 ? categories[0] : null;
}
