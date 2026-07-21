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

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Check Virtual Collection
  const virtualCollection = virtualCollections[slug];
  if (virtualCollection) {
    return generatePageMetadata({
      title: virtualCollection.title,
      description: virtualCollection.seoDescription || virtualCollection.description,
      slug: `collections/${slug}`
    });
  }

  // 2. Check WooCommerce Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    return generatePageMetadata({
      title: `${category.name} Collection`,
      description: (category as any).description || `Browse our ${category.name} collection.`,
      slug: `collections/${slug}`
    });
  }

  return { title: "Collection Not Found | Boss Perfumes" };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams as Record<string, string | undefined>;
  
  let title = "";
  let baseFilters: Record<string, any> = {};
  let breadcrumbLabel = "";

  // 1. Resolve Collection (Virtual or Category)
  const virtualCollection = virtualCollections[slug];
  if (virtualCollection) {
    title = virtualCollection.title;
    breadcrumbLabel = virtualCollection.breadcrumbLabel;
    baseFilters = virtualCollection.baseFilters;
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      notFound();
    }
    title = category.name;
    breadcrumbLabel = category.name;
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
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
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
