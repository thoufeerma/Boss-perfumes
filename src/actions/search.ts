"use server";

import { getFilteredProducts, getFeaturedProducts } from "@/api/products";

export async function searchProductsAction(query: string) {
  try {
    if (!query || query.trim().length === 0) return [];
    const products = await getFilteredProducts({ search: query, perPage: "5" });
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getFeaturedProductsAction(limit: number = 4) {
  try {
    const products = await getFeaturedProducts(limit);
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}
