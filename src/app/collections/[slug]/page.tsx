import { getCategoryBySlug, getCategories } from "@/api/categories";
import { getBrands, getSizes, getScentProfiles } from "@/api/attributes";
import { virtualCollections } from "@/config/collectionMetadata";
import { generatePageMetadata } from "@/lib/metadata";
import { CollectionLayout } from "@/components/collection/CollectionLayout";
import { FilteredProductLoader } from "@/components/collection/FilteredProductLoader";
import { ProductGridSkeleton } from "@/components/collection/CollectionSkeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translateCategoryName } from "@/lib/i18n/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  
  // 1. Check Virtual Collection
  const virtualCollection = virtualCollections[slug];
  if (virtualCollection) {
    const title = locale === "ar" ? translateCategoryName(virtualCollection.title, locale) : virtualCollection.title;
    return generatePageMetadata({
      title: title,
      description: virtualCollection.seoDescription || virtualCollection.description,
      slug: `collections/${slug}`
    });
  }

  // 2. Check WooCommerce Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    const categoryName = locale === "ar" ? translateCategoryName(category.name, locale) : category.name;
    const title = locale === "ar" ? `مجموعة ${categoryName}` : `${categoryName} Collection`;
    return generatePageMetadata({
      title,
      description: (category as any).description || `Browse our ${categoryName} collection.`,
      slug: `collections/${slug}`
    });
  }

  return { title: locale === "ar" ? "المجموعة غير موجودة | Boss Perfumes" : "Collection Not Found | Boss Perfumes" };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams as Record<string, string | undefined>;
  const locale = await getLocale();
  const t = getDictionary(locale);
  
  let title = "";
  let baseFilters: Record<string, any> = {};
  let breadcrumbLabel = "";

  // 1. Resolve Collection (Virtual or Category)
  const virtualCollection = virtualCollections[slug];
  if (virtualCollection) {
    title = locale === "ar" ? translateCategoryName(virtualCollection.title, locale) : virtualCollection.title;
    breadcrumbLabel = locale === "ar" ? translateCategoryName(virtualCollection.breadcrumbLabel, locale) : virtualCollection.breadcrumbLabel;
    baseFilters = virtualCollection.baseFilters;
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      notFound();
    }
    title = locale === "ar" ? translateCategoryName(category.name, locale) : category.name;
    breadcrumbLabel = title;
    baseFilters = { category: category.id };
  }

  // 2. Fetch Sidebar metadata (cached aggressively)
  const [categories, brands, sizes, scents] = await Promise.all([
    getCategories({ hide_empty: "false", per_page: "100" }),
    getBrands(),
    getSizes(),
    getScentProfiles()
  ]);

  const breadcrumbs = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.collections, href: "/collections" },
    { label: breadcrumbLabel, href: `/collections/${slug}` }
  ];

  return (
    <CollectionLayout 
      title={title}
      categories={categories}
      brands={brands}
      sizes={sizes}
      scents={scents}
      selectedCategorySlug={!virtualCollection ? slug : undefined}
      breadcrumbs={breadcrumbs}
      baseFilters={baseFilters}
    >
      <Suspense key={`${slug}-${JSON.stringify(resolvedParams)}`} fallback={<ProductGridSkeleton />}>
        <FilteredProductLoader baseFilters={baseFilters} searchParams={resolvedParams} />
      </Suspense>
    </CollectionLayout>
  );
}
