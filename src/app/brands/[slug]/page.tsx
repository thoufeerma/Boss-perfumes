import { getCategories } from "@/api/categories";
import { getSizes, getScentProfiles } from "@/api/attributes";
import { getBrands, getBrandBySlug } from "@/api/brands";
import { generatePageMetadata } from "@/lib/metadata";
import { CollectionLayout } from "@/components/collection/CollectionLayout";
import { FilteredProductLoader } from "@/components/collection/FilteredProductLoader";
import { ProductGridSkeleton } from "@/components/collection/CollectionSkeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  
  if (!brand) return { title: "Brand Not Found | Boss Perfumes" };

  return generatePageMetadata({
    title: `${brand.name} Perfumes`,
    description: brand.description || brand.seoMetadata?.description || `Explore the exclusive ${brand.name} collection at Boss Perfumes.`,
    slug: `brands/${slug}`
  });
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const resolvedParams = await searchParams as Record<string, string | undefined>;
  
  // Verify brand exists
  const brand = await getBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  // Fetch filter metadata (cached aggressively)
  const [categories, allBrands, sizes, scents] = await Promise.all([
    getCategories({ hide_empty: "false", per_page: "100" }),
    getBrands(),
    getSizes(),
    getScentProfiles()
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
    { label: brand.name, href: `/brands/${slug}` }
  ];

  return (
    <CollectionLayout 
      title={brand.name}
      categories={categories}
      brands={allBrands}
      sizes={sizes}
      scents={scents}
      breadcrumbs={breadcrumbs}
    >
      <Suspense key={`brand-${brand.id}-${JSON.stringify(resolvedParams)}`} fallback={<ProductGridSkeleton />}>
        <FilteredProductLoader baseFilters={{ brand: brand.id }} searchParams={resolvedParams} />
      </Suspense>
    </CollectionLayout>
  );
}
