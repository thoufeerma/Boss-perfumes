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
  const currentValues = searchParams.get(paramKey)?.split(",").map(v => v.trim()) || [];

  const isOptionSelected = (opt: WCAttributeTerm) => {
    const idStr = opt.id.toString();
    const slugStr = opt.slug?.toLowerCase();
    return currentValues.some(val => {
      const v = val.toLowerCase();
      return v === idStr || (Boolean(slugStr) && v === slugStr);
    });
  };

  const handleToggle = (opt: WCAttributeTerm) => {
    const params = new URLSearchParams(searchParams.toString());
    const idStr = opt.id.toString();
    const slugStr = opt.slug?.toLowerCase();

    const isSelected = isOptionSelected(opt);
    let newValues: string[];

    if (isSelected) {
      newValues = currentValues.filter(val => {
        const v = val.toLowerCase();
        return v !== idStr && v !== slugStr;
      });
    } else {
      const valueToAdd = (paramKey === "scent" && slugStr) ? slugStr : idStr;
      newValues = [...currentValues, valueToAdd];
    }

    if (newValues.length > 0) {
      params.set(paramKey, newValues.join(","));
    } else {
      params.delete(paramKey);
    }
    
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = isOptionSelected(option);
        return (
          <label 
            key={option.id} 
            onClick={(e) => {
              e.preventDefault();
              handleToggle(option);
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
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
            {option.count > 0 && (
              <span className="text-[11px] text-gray-400">({option.count})</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
