import Link from "next/link";
import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No products found",
  description = "We couldn't find any products in this collection.",
  actionLabel = "Continue Shopping",
  actionHref = "/collections"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center bg-white rounded-3xl border border-[#ECE8E2]">
      <div className="w-16 h-16 mb-6 rounded-full bg-[#FAF8F4] flex items-center justify-center text-brand-text-muted">
        <Search className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl md:text-3xl font-serif text-brand-text mb-4">{title}</h3>
      <p className="text-brand-text-muted text-base max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      <Link
        href={actionHref}
        className="bg-[#111111] text-white px-8 py-4 text-[13px] font-medium tracking-widest uppercase hover:bg-black/80 transition-colors duration-300"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
