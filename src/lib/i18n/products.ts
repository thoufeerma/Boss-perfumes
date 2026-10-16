import { type Locale } from "./config";

/**
 * Product Name:
 * Preserves the original product name as set in WooCommerce (e.g. brand names, luxury titles).
 */
export function translateProductName(name: string | undefined | null, _locale?: Locale): string {
  return name || "";
}

/**
 * Product Description:
 * Preserves the original product description as authored in WooCommerce.
 */
export function translateProductDescription(
  desc: string | undefined | null,
  _locale?: Locale,
  _fallbackName?: string
): string {
  return desc || "";
}

/**
 * Category names mapping to Arabic
 */
const CATEGORY_MAP_AR: Record<string, string> = {
  "men": "رجالي",
  "mens": "رجالي",
  "men's": "رجالي",
  "women": "نسائي",
  "womens": "نسائي",
  "women's": "نسائي",
  "luxury": "مجموعة الفخامة",
  "luxury collection": "مجموعة الفخامة",
  "offers": "العروض",
  "unisex": "للجنسين",
  "perfumes": "العطور",
  "all perfumes": "جميع العطور",
  "collections": "المجموعات",
  "all collections": "جميع المجموعات",
  "brands": "العلامات التجارية",
  "fragrances": "العطور",
  "best sellers": "الأكثر مبيعاً",
  "new arrivals": "وصل حديثاً",
  "featured": "منتجات مميزة",
};

/**
 * Common attribute names mapping (e.g. Top Notes, Heart Notes)
 */
const ATTRIBUTE_NAME_MAP_AR: Record<string, string> = {
  "brand": "العلامة التجارية",
  "size": "الحجم",
  "volume": "السعة",
  "scent": "طابع العطر",
  "scent profile": "طابع العطر",
  "gender": "الجنس",
  "concentration": "التركيز",
  "type": "النوع",
  "top notes": "النفحات العليا",
  "top": "النفحات العليا",
  "heart notes": "قلب العطر",
  "middle notes": "قلب العطر",
  "middle": "قلب العطر",
  "heart": "قلب العطر",
  "base notes": "قاعدة العطر",
  "base": "قاعدة العطر",
};

/**
 * Translates a category name into the target locale.
 */
export function translateCategoryName(name: string | undefined | null, locale: Locale): string {
  if (!name) return "";
  if (locale !== "ar") return name;

  const key = name.trim().toLowerCase();
  if (CATEGORY_MAP_AR[key]) {
    return CATEGORY_MAP_AR[key];
  }

  return name;
}

/**
 * Translates an attribute name (e.g. Brand, Size, Scent Profile, Fragrance Notes).
 */
export function translateAttributeName(name: string | undefined | null, locale: Locale): string {
  if (!name) return "";
  if (locale !== "ar") return name;

  const key = name.trim().toLowerCase();
  if (ATTRIBUTE_NAME_MAP_AR[key]) {
    return ATTRIBUTE_NAME_MAP_AR[key];
  }

  return name;
}

/**
 * Translates attribute options like volume/sizes if desired.
 */
export function translateAttributeOption(option: string | undefined | null, locale: Locale): string {
  if (!option) return "";
  if (locale !== "ar") return option;

  const key = option.trim().toLowerCase();
  if (key === "men") return "رجالي";
  if (key === "women") return "نسائي";
  if (key === "unisex") return "للجنسين";

  return option;
}
