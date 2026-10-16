"use client";

import { useT, useLocale } from "@/components/i18n/I18nProvider";
import { translateAttributeOption } from "@/lib/i18n/products";

interface FragrancePyramidProps {
  topNotes?: string;
  middleNotes?: string;
  baseNotes?: string;
}

export function FragrancePyramid({ topNotes, middleNotes, baseNotes }: FragrancePyramidProps) {
  const t = useT();
  const locale = useLocale();

  if (!topNotes && !middleNotes && !baseNotes) return null;

  const formatNotes = (notes: string) => {
    if (locale !== "ar") return notes;
    return notes
      .split(",")
      .map((n) => translateAttributeOption(n.trim(), locale))
      .join("، ");
  };

  const renderNote = (title: string, notes: string) => (
    <div className="flex flex-col mb-4 last:mb-0">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{title}</span>
      <span className="text-sm text-[#111111]">{formatNotes(notes)}</span>
    </div>
  );

  return (
    <div className="flex flex-col space-y-2 p-6 bg-[#FAF8F4] rounded-lg border border-[#ECE8E2]">
      {topNotes && renderNote(t.product.topNotes, topNotes)}
      {middleNotes && renderNote(t.product.heartNotes, middleNotes)}
      {baseNotes && renderNote(t.product.baseNotes, baseNotes)}
    </div>
  );
}
