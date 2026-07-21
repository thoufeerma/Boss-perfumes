import { type WCProduct } from "@/api/products";
import { formatPrice } from "@/lib/utils";

export function ProductPrice({ product }: { product: WCProduct }) {
  const currency = 'AED';

  const hasSale = product.on_sale && product.regular_price && product.sale_price;
  const regular = parseFloat(product.regular_price || "0");
  const sale = parseFloat(product.sale_price || "0");
  const discountPercent = hasSale && regular > 0 ? Math.round(((regular - sale) / regular) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 mt-3">
      {hasSale ? (
        <>
          <span className="text-[1.15rem] font-bold text-[#111111] tracking-tight">{formatPrice(product.sale_price, currency)}</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-400 opacity-70 line-through decoration-1">{formatPrice(product.regular_price, currency)}</span>
            <span className="text-[11px] font-medium text-emerald-600 tracking-wide">{discountPercent}% OFF</span>
          </div>
        </>
      ) : (
        <span className="text-[1.15rem] font-bold text-[#111111] tracking-tight">{formatPrice(product.price, currency)}</span>
      )}
    </div>
  );
}
