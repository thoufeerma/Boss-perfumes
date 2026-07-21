import { Star } from "lucide-react";

interface ReviewSummaryProps {
  rating: string | number | undefined;
  count: number | undefined;
}

export function ReviewSummary({ rating, count }: ReviewSummaryProps) {
  if (!rating || !count || count === 0) return null;

  const numericRating = typeof rating === "string" ? parseFloat(rating) : rating;

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex text-[#111111]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className="w-4 h-4" 
            fill={i < Math.round(numericRating) ? "currentColor" : "none"} 
            strokeWidth={i < Math.round(numericRating) ? 0 : 1}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-[#111111]">{numericRating.toFixed(1)}</span>
      <span className="text-sm text-gray-500">({count} reviews)</span>
    </div>
  );
}
