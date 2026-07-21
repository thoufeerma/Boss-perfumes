"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BUDGET_OPTIONS = [
  { label: "Under AED 99", max: "99" },
  { label: "Under AED 149", max: "149" },
  { label: "Under AED 199", max: "199" },
  { label: "Under AED 299", max: "299" },
  { label: "Under AED 499", max: "499" },
  { label: "Above AED 500", min: "500" },
];

export function BudgetFilter({ baseFilters = {} }: { baseFilters?: Record<string, any> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMin = searchParams.get("minPrice");
  const currentMax = searchParams.get("maxPrice");

  const handleSelect = (min?: string, max?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Toggle off if already selected
    if (min === currentMin && max === currentMax) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {BUDGET_OPTIONS.map((opt, i) => {
        const isSelected = opt.min === currentMin && opt.max === currentMax;
        return (
          <button
            key={i}
            onClick={() => handleSelect(opt.min, opt.max)}
            className={cn(
              "px-3 py-1.5 text-[11px] font-medium tracking-wide border rounded-full transition-colors",
              isSelected 
                ? "bg-[#111111] text-white border-[#111111]" 
                : "bg-white text-gray-600 border-[#ECE8E2] hover:border-[#111111] hover:text-[#111111]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
