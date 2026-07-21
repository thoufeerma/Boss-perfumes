"use server";

import { fetchWC } from "@/api/client";

export async function getProductsByIds(ids: number[]) {
  if (!ids || ids.length === 0) return [];
  
  try {
    const products = await fetchWC(`products?include=${ids.join(",")}`);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error("Failed to fetch products for wishlist:", error);
    return [];
  }
}
