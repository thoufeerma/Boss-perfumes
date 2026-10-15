"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

interface BreadcrumbProps {
  category?: { id: number; name: string; slug: string };
  productName: string;
}

export function Breadcrumb({ category, productName }: BreadcrumbProps) {
  const t = useT();

  return (
    <nav className="flex items-center text-[11px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-8 whitespace-nowrap overflow-x-auto no-scrollbar">
      <Link href="/" className="hover:text-[#111111] transition-colors">{t.nav.home}</Link>
      <ChevronRight className="w-3 h-3 mx-2 flex-shrink-0" />
      <Link href="/collections" className="hover:text-[#111111] transition-colors">{t.nav.collections}</Link>
      
      {category && (
        <>
          <ChevronRight className="w-3 h-3 mx-2 flex-shrink-0" />
          <Link href={`/collections/${category.slug}`} className="hover:text-[#111111] transition-colors">
            {category.name}
          </Link>
        </>
      )}
      
      <ChevronRight className="w-3 h-3 mx-2 flex-shrink-0" />
      <span className="text-[#111111] truncate">{productName}</span>
    </nav>
  );
}
