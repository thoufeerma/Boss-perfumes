"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type WCAttributeTerm } from "@/api/attributes";

interface CheckboxFilterProps {
  paramKey: string;
  options: WCAttributeTerm[];
}

export function CheckboxFilter({ paramKey, options }: CheckboxFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Read current values from URL
  const currentValues = searchParams.get(paramKey)?.split(",") || [];

  const handleToggle = (termId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newValues = currentValues.includes(termId)
      ? currentValues.filter(id => id !== termId)
      : [...currentValues, termId];

    if (newValues.length > 0) {
      params.set(paramKey, newValues.join(","));
    } else {
      params.delete(paramKey);
    }
    
    // Push new state to URL
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = currentValues.includes(option.id.toString());
        return (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
            <div 
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isChecked ? "bg-[#111111] border-[#111111]" : "border-[#D1CFC9] group-hover:border-[#111111]"
              }`}
            >
              {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-gray-600 group-hover:text-[#111111] transition-colors flex-1">
              {option.name}
            </span>
            <span className="text-[11px] text-gray-400">({option.count})</span>
          </label>
        );
      })}
    </div>
  );
}
