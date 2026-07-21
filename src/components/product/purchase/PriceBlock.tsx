import { formatPrice } from "@/lib/utils";

interface PriceBlockProps {
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  currency?: string;
}

export function PriceBlock({ price, regularPrice, salePrice, onSale, currency = 'AED' }: PriceBlockProps) {
  const hasSale = onSale && regularPrice && salePrice;
  const regular = parseFloat(regularPrice || "0");
  const sale = parseFloat(salePrice || "0");
  const discountPercent = hasSale && regular > 0 ? Math.round(((regular - sale) / regular) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-3">
        {hasSale ? (
          <>
            <span className="text-2xl font-bold text-[#111111] tracking-tight">{formatPrice(salePrice, currency)}</span>
            <span className="text-lg font-medium text-gray-400 line-through decoration-1">{formatPrice(regularPrice, currency)}</span>
          </>
        ) : (
          <span className="text-2xl font-bold text-[#111111] tracking-tight">{formatPrice(price, currency)}</span>
        )}
      </div>
      {hasSale && (
        <span className="text-sm font-medium text-emerald-600 tracking-wide">
          Save {discountPercent}% ({formatPrice((regular - sale).toString(), currency)})
        </span>
      )}
    </div>
  );
}
