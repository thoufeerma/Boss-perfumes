import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductNavProps {
  prevProduct?: { name: string; slug: string } | null;
  nextProduct?: { name: string; slug: string } | null;
}

export function ProductNavigation({ prevProduct, nextProduct }: ProductNavProps) {
  if (!prevProduct && !nextProduct) return null;

  return (
    <div className="flex items-center justify-between py-12 mt-24 border-t border-[#ECE8E2]">
      {prevProduct ? (
        <Link 
          href={`/product/${prevProduct.slug}`}
          className="group flex flex-col items-start gap-2"
        >
          <span className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#111111] transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </span>
          <span className="text-sm font-serif text-[#111111]">{prevProduct.name}</span>
        </Link>
      ) : <div />}

      {nextProduct ? (
        <Link 
          href={`/product/${nextProduct.slug}`}
          className="group flex flex-col items-end gap-2 text-right"
        >
          <span className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#111111] transition-colors">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
          <span className="text-sm font-serif text-[#111111]">{nextProduct.name}</span>
        </Link>
      ) : <div />}
    </div>
  );
}
