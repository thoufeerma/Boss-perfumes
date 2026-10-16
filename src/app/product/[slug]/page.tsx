import { Metadata } from "next";
import { notFound } from "next/navigation";
import { 
  getProductBySlug, 
  getRelatedProducts, 
  getUpsellProducts, 
  getCrossSellProducts 
} from "@/api/products";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { 
  translateProductName, 
  translateCategoryName, 
  translateAttributeName, 
  translateAttributeOption, 
  translateProductDescription 
} from "@/lib/i18n/products";

import { Breadcrumb } from "@/components/product/navigation/Breadcrumb";
import { ProductGallery } from "@/components/product/gallery/ProductGallery";
import { ReviewSummary } from "@/components/product/reviews/ReviewSummary";
import { PriceBlock } from "@/components/product/purchase/PriceBlock";
import { StockIndicator } from "@/components/product/purchase/StockIndicator";
import { ProductAccordion } from "@/components/product/accordion/ProductAccordion";
import { FragrancePyramid } from "@/components/product/accordion/FragrancePyramid";
import { ShippingInfo } from "@/components/product/shipping/ShippingInfo";
import { RelatedProducts } from "@/components/product/related/RelatedProducts";
import { RecentlyViewed } from "@/components/product/related/RecentlyViewed";
import { PurchaseBlock } from "@/components/product/purchase/PurchaseBlock";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const locale = await getLocale();

  if (!product) {
    return { title: locale === "ar" ? "المنتج غير موجود | Boss Perfumes" : "Product Not Found | Boss Perfumes" };
  }

  const localizedName = translateProductName(product.name, locale);
  const plainTextDesc = translateProductDescription(
    product.short_description?.replace(/<[^>]+>/g, ''), 
    locale, 
    product.name
  ).replace(/<[^>]+>/g, '') || localizedName;

  return {
    title: `${localizedName} | Boss Perfumes`,
    description: plainTextDesc,
    openGraph: {
      title: localizedName,
      description: plainTextDesc,
      images: product.images?.[0] ? [{ url: product.images[0].src }] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const locale = await getLocale();
  const t = getDictionary(locale);
  const localizedName = translateProductName(product.name, locale);

  // Fetch recommendations with fallback chain
  let recommendations = await getRelatedProducts(product.id);
  let recTitle = t.product.youMayAlsoLike;

  if (!recommendations || recommendations.length === 0) {
    recommendations = await getUpsellProducts(product.id);
    if (!recommendations || recommendations.length === 0) {
      recommendations = await getCrossSellProducts(product.id);
      if (recommendations && recommendations.length > 0) {
        recTitle = t.product.frequentlyBoughtTogether;
      }
    }
  }

  const primaryCategory = product.categories?.[0] ? {
    ...product.categories[0],
    name: translateCategoryName(product.categories[0].name, locale)
  } : undefined;

  // Extract attributes
  const topNotes = product.attributes?.find(a => a.name.toLowerCase().includes("top"))?.options?.join(", ");
  const middleNotes = product.attributes?.find(a => a.name.toLowerCase().includes("middle") || a.name.toLowerCase().includes("heart"))?.options?.join(", ");
  const baseNotes = product.attributes?.find(a => a.name.toLowerCase().includes("base"))?.options?.join(", ");

  const otherAttributes = product.attributes?.filter(a => 
    !a.name.toLowerCase().includes("top") && 
    !a.name.toLowerCase().includes("middle") && 
    !a.name.toLowerCase().includes("heart") &&
    !a.name.toLowerCase().includes("base")
  );

  const localizedShortDesc = product.short_description 
    ? translateProductDescription(product.short_description, locale, product.name)
    : null;

  const localizedFullDesc = product.description 
    ? translateProductDescription(product.description, locale, product.name)
    : null;

  return (
    <div className="bg-white min-h-screen pt-32 pb-12">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <Breadcrumb category={primaryCategory} productName={localizedName} />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-[65%]">
            <ProductGallery images={product.images} productName={localizedName} />
          </div>

          {/* Right Column: Sticky Product Info */}
          <div className="w-full lg:w-[35%]">
            <div className="lg:sticky lg:top-32 pb-12">
              <div className="mb-2 text-sm font-bold tracking-widest text-gray-500 uppercase">
                {product.categories?.map(c => translateCategoryName(c.name, locale)).join(" • ")}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-[#111111] mb-6 leading-[1.1]">
                {localizedName}
              </h1>

              <ReviewSummary rating={product.average_rating} count={product.review_count} />

              <PriceBlock 
                price={product.price}
                regularPrice={product.regular_price}
                salePrice={product.sale_price}
                onSale={product.on_sale}
                currency={product.currency}
              />

              <div className="mb-8">
                <StockIndicator status={product.stock_status} quantity={product.stock_quantity} />
              </div>

              {localizedShortDesc && (
                <div 
                  className="text-gray-600 mb-8 prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: localizedShortDesc }}
                />
              )}

              {otherAttributes && otherAttributes.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-8 pt-6 border-t border-[#ECE8E2]">
                  {otherAttributes.map(attr => (
                    <div key={attr.id} className="text-sm">
                      <span className="text-gray-500 uppercase tracking-wider text-xs me-2">
                        {translateAttributeName(attr.name, locale)}:
                      </span>
                      <span className="font-medium text-[#111111]">
                        {attr.options.map(o => translateAttributeOption(o, locale)).join("، ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Client Component wrapper for interactive purchase logic */}
              <PurchaseBlock product={product} />

              <ProductAccordion 
                items={[
                  ...(localizedFullDesc ? [{
                    id: "description",
                    title: t.product.description,
                    content: <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: localizedFullDesc }} />
                  }] : []),
                  ...(topNotes || middleNotes || baseNotes ? [{
                    id: "notes",
                    title: t.product.fragranceNotes,
                    content: <FragrancePyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
                  }] : []),
                  {
                    id: "shipping",
                    title: t.product.shippingReturns,
                    content: <ShippingInfo />
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts products={recommendations} title={recTitle} />
      <RecentlyViewed currentProduct={product} />
    </div>
  );
}
