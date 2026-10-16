import { getCategories } from "@/api/categories";
import { getBrands, getSizes, getScentProfiles } from "@/api/attributes";
import { CollectionLayout } from "@/components/collection/CollectionLayout";
import { FilteredProductLoader } from "@/components/collection/FilteredProductLoader";
import { ProductGridSkeleton } from "@/components/collection/CollectionSkeleton";
import { Suspense } from "react";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "ar") {
    return {
      title: "جميع المجموعات | Boss Perfumes",
      description: "استكشف مجموعتنا الكاملة من العطور الفاخرة.",
    };
  }
  return {
    title: "All Collections | Boss Perfumes",
    description: "Explore our complete collection of luxury fragrances.",
  };
}

interface CollectionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const resolvedParams = await searchParams as Record<string, string | undefined>;
  const locale = await getLocale();
  const t = getDictionary(locale);
  
  // Fetch filter metadata (cached aggressively)
  const [categories, brands, sizes, scents] = await Promise.all([
    getCategories({ hide_empty: "false", per_page: "100" }),
    getBrands(),
    getSizes(),
    getScentProfiles()
  ]);

  return (
    <CollectionLayout 
      title={t.product.allCollections} 
      categories={categories}
      brands={brands}
      sizes={sizes}
      scents={scents}
    >
      <Suspense key={JSON.stringify(resolvedParams)} fallback={<ProductGridSkeleton />}>
        <FilteredProductLoader searchParams={resolvedParams} />
      </Suspense>
    </CollectionLayout>
  );
}
