import { fetchWC } from "./client";

export interface WCAttributeTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export const DEFAULT_SCENT_TERMS: WCAttributeTerm[] = [
  { id: 81, name: "Oriental", slug: "oriental", count: 7 },
  { id: 82, name: "Floral", slug: "floral", count: 11 },
  { id: 83, name: "Fruity", slug: "fruity", count: 4 },
  { id: 84, name: "Woody", slug: "woody", count: 6 },
  { id: 85, name: "Fresh", slug: "fresh", count: 8 },
];

export async function getAttributeBySlug(slug: string) {
  const attributes = await fetchWC("products/attributes", { next: { revalidate: 60 } });
  if (!Array.isArray(attributes)) return undefined;
  return attributes.find((attr: any) => attr.slug === slug || attr.name?.toLowerCase() === slug.toLowerCase());
}

export async function getAttributeTerms(attributeId: string | number, params?: Record<string, string>): Promise<WCAttributeTerm[]> {
  const terms = await fetchWC(`products/attributes/${attributeId}/terms`, { 
    params: { per_page: "100", hide_empty: "false", ...params }, 
    next: { revalidate: 60 } 
  });
  return Array.isArray(terms) ? terms : [];
}

export async function getBrands(): Promise<WCAttributeTerm[]> {
  const attr = await getAttributeBySlug("pa_brand");
  if (!attr) return [];
  return getAttributeTerms(attr.id, { hide_empty: "true" });
}

export async function getSizes(): Promise<WCAttributeTerm[]> {
  const attr = await getAttributeBySlug("pa_size");
  if (!attr) return [];
  return getAttributeTerms(attr.id, { hide_empty: "true" });
}

export async function getScentProfiles(): Promise<WCAttributeTerm[]> {
  try {
    let attr = await getAttributeBySlug("pa_scent");
    if (!attr) {
      attr = await getAttributeBySlug("pa_scent-profile");
    }
    if (!attr) {
      attr = await getAttributeBySlug("scent");
    }
    
    const attrId = attr?.id || 1;
    const terms = await getAttributeTerms(attrId, { hide_empty: "false" });
    if (terms && terms.length > 0) {
      return terms;
    }
  } catch (err) {
    console.error("Error fetching scent profiles:", err);
  }

  return DEFAULT_SCENT_TERMS;
}
