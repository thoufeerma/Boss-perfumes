import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { 
  getProductBySlug, 
  getRelatedProducts, 
  getUpsellProducts, 
  getCrossSellProducts 
} from "@/api/products";

import { Breadcrumb } from "@/components/product/navigation/Breadcrumb";
import { ProductGallery } from "@/components/product/gallery/ProductGallery";
import { ReviewSummary } from "@/components/product/reviews/ReviewSummary";
import { PriceBlock } from "@/components/product/purchase/PriceBlock";
import { QuantitySelector } from "@/components/product/purchase/QuantitySelector";
import { AddToCartButton } from "@/components/product/purchase/AddToCartButton";
import { WishlistButton } from "@/components/product/purchase/WishlistButton";
import { StockIndicator } from "@/components/product/purchase/StockIndicator";
import { ProductAccordion } from "@/components/product/accordion/ProductAccordion";
import { FragrancePyramid } from "@/components/product/accordion/FragrancePyramid";
import { ShippingInfo } from "@/components/product/shipping/ShippingInfo";
import { RelatedProducts } from "@/components/product/related/RelatedProducts";
import { RecentlyViewed } from "@/components/product/related/RecentlyViewed";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";

// Add temporary mock Quantity state wrapper since QuantitySelector is a client component
// that requires state. In a real app, the purchase block might be its own Client Component
import { PurchaseBlock } from "@/components/product/purchase/PurchaseBlock";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Boss Perfumes" };
  }

  // Strip HTML from short description for SEO
  const plainTextDesc = product.short_description?.replace(/<[^>]+>/g, '') || product.name;

  return {
    title: `${product.name} | Boss Perfumes`,
    description: plainTextDesc,
    openGraph: {
      title: product.name,
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

  // Fetch recommendations with fallback chain
  let recommendations = await getRelatedProducts(product.id);
  let recTitle = "You May Also Like";

  if (!recommendations || recommendations.length === 0) {
    recommendations = await getUpsellProducts(product.id);
    if (!recommendations || recommendations.length === 0) {
      recommendations = await getCrossSellProducts(product.id);
      if (recommendations && recommendations.length > 0) recTitle = "Frequently Bought Together";
    }
  }

  const primaryCategory = product.categories?.[0];

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

  return (
    <div className="bg-white min-h-screen pt-32 pb-12">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <Breadcrumb category={primaryCategory} productName={product.name} />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-[65%]">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Sticky Product Info */}
          <div className="w-full lg:w-[35%]">
            <div className="lg:sticky lg:top-32 pb-12">
              <div className="mb-2 text-sm font-bold tracking-widest text-gray-500 uppercase">
                {product.categories?.map(c => c.name).join(", ")}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-[#111111] mb-6 leading-[1.1]">
                {product.name}
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

              {product.short_description && (
                <div 
                  className="text-gray-600 mb-8 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {otherAttributes && otherAttributes.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-8 pt-6 border-t border-[#ECE8E2]">
                  {otherAttributes.map(attr => (
                    <div key={attr.id} className="text-sm">
                      <span className="text-gray-500 uppercase tracking-wider text-xs mr-2">{attr.name}:</span>
                      <span className="font-medium text-[#111111]">{attr.options.join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Client Component wrapper for interactive purchase logic */}
              <PurchaseBlock product={product} />

              <ProductAccordion 
                items={[
                  ...(product.description ? [{
                    id: "description",
                    title: "Product Description",
                    content: <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  }] : []),
                  ...(topNotes || middleNotes || baseNotes ? [{
                    id: "notes",
                    title: "Fragrance Notes",
                    content: <FragrancePyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
                  }] : []),
                  {
                    id: "shipping",
                    title: "Shipping & Returns",
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
