interface StockIndicatorProps {
  status?: string;
  quantity?: number;
}

export function StockIndicator({ status, quantity }: StockIndicatorProps) {
  if (!status) return null;

  if (status === "outofstock") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        Out of Stock
      </div>
    );
  }

  if (status === "onbackorder") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Available on Backorder
      </div>
    );
  }

  if (quantity && quantity > 0 && quantity <= 5) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Low Stock - Only {quantity} left
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      In Stock
    </div>
  );
}
