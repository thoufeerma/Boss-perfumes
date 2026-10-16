"use client";

import { useT } from "@/components/i18n/I18nProvider";

interface StockIndicatorProps {
  status?: string;
  quantity?: number;
}

export function StockIndicator({ status, quantity }: StockIndicatorProps) {
  const t = useT();

  if (!status) return null;

  if (status === "outofstock") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        {t.product.outOfStock}
      </div>
    );
  }

  if (status === "onbackorder") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {t.product.onBackorder}
      </div>
    );
  }

  if (quantity && quantity > 0 && quantity <= 5) {
    const lowStockText = t.product.lowStock.replace("{quantity}", quantity.toString());
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {lowStockText}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {t.product.inStock}
    </div>
  );
}
