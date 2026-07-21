import { fetchWC } from "./client";

export interface WCAttributeTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export async function getAttributeBySlug(slug: string) {
  const attributes = await fetchWC("products/attributes", { next: { revalidate: 3600 } });
  return attributes.find((attr: any) => attr.slug === slug);
}

export async function getAttributeTerms(attributeId: string | number): Promise<WCAttributeTerm[]> {
  return fetchWC(`products/attributes/${attributeId}/terms`, { params: { per_page: "100", hide_empty: "true" }, next: { revalidate: 3600 } });
}

export async function getBrands(): Promise<WCAttributeTerm[]> {
  const attr = await getAttributeBySlug("pa_brand");
  if (!attr) return [];
  return getAttributeTerms(attr.id);
}

export async function getSizes(): Promise<WCAttributeTerm[]> {
  const attr = await getAttributeBySlug("pa_size");
  if (!attr) return [];
  return getAttributeTerms(attr.id);
}

export async function getScentProfiles(): Promise<WCAttributeTerm[]> {
  // Try pa_scent-profile or pa_scent depending on WC setup
  let attr = await getAttributeBySlug("pa_scent-profile");
  if (!attr) {
    attr = await getAttributeBySlug("pa_scent");
  }
  if (!attr) return [];
  return getAttributeTerms(attr.id);
}
