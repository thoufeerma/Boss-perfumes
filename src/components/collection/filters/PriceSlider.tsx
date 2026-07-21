"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PriceSliderProps {
  maxProductPrice?: number;
  baseFilters?: Record<string, any>;
}

export function PriceSlider({ maxProductPrice = 1000, baseFilters = {} }: PriceSliderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultMin = baseFilters?.minPrice ? parseInt(baseFilters.minPrice) : 0;
  const defaultMax = baseFilters?.maxPrice ? parseInt(baseFilters.maxPrice) : maxProductPrice;

  const currentMin = searchParams.has("minPrice") ? parseInt(searchParams.get("minPrice") as string) : defaultMin;
  const currentMax = searchParams.has("maxPrice") ? parseInt(searchParams.get("maxPrice") as string) : defaultMax;

  const [minVal, setMinVal] = useState(currentMin);
  const [maxVal, setMaxVal] = useState(currentMax);

  // Sync state with URL changes
  useEffect(() => {
    setMinVal(searchParams.has("minPrice") ? parseInt(searchParams.get("minPrice") as string) : defaultMin);
    setMaxVal(searchParams.has("maxPrice") ? parseInt(searchParams.get("maxPrice") as string) : defaultMax);
  }, [searchParams, defaultMin, defaultMax]);

  const applyFilters = (newMin: number, newMax: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // If the user wants 0 but the default is higher, we MUST put 0 in the URL to override the base filter
    if (newMin > 0 || (newMin === 0 && defaultMin > 0)) {
      params.set("minPrice", newMin.toString());
    } else {
      params.delete("minPrice");
    }
    
    // If the user wants maxProductPrice but the default is lower, we MUST put maxProductPrice in the URL
    if (newMax < maxProductPrice || (newMax === maxProductPrice && defaultMax < maxProductPrice)) {
      params.set("maxPrice", newMax.toString());
    } else {
      params.delete("maxPrice");
    }

    // Clean up if it matches the base filters exactly
    if (newMin === defaultMin && newMax === defaultMax) {
       params.delete("minPrice");
       params.delete("maxPrice");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value), maxVal - 1);
    setMinVal(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseInt(e.target.value), minVal + 1);
    setMaxVal(value);
  };

  return (
    <div className="space-y-6">
      {/* Slider Visuals */}
      <div className="relative h-1 bg-gray-200 rounded-full mt-2">
        <style dangerouslySetInnerHTML={{__html: `
          .range-slider-input {
            pointer-events: none;
          }
          .range-slider-input::-webkit-slider-thumb {
            pointer-events: auto;
            cursor: pointer;
          }
          .range-slider-input::-moz-range-thumb {
            pointer-events: auto;
            cursor: pointer;
          }
        `}} />
        
        {/* Active Track */}
        <div 
          className="absolute h-1 bg-[#111111] rounded-full"
          style={{ 
            left: `${(minVal / maxProductPrice) * 100}%`,
            right: `${100 - (maxVal / maxProductPrice) * 100}%` 
          }}
        />
        
        {/* Min Range Input */}
        <input
          type="range"
          min={0}
          max={maxProductPrice}
          value={minVal}
          onChange={handleMinChange}
          onMouseUp={() => applyFilters(minVal, maxVal)}
          onTouchEnd={() => applyFilters(minVal, maxVal)}
          className="range-slider-input absolute w-full -top-1.5 h-4 opacity-0"
          style={{ zIndex: minVal > maxProductPrice - 100 ? 5 : 3 }}
        />
        
        {/* Max Range Input */}
        <input
          type="range"
          min={0}
          max={maxProductPrice}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseUp={() => applyFilters(minVal, maxVal)}
          onTouchEnd={() => applyFilters(minVal, maxVal)}
          className="range-slider-input absolute w-full -top-1.5 h-4 opacity-0"
          style={{ zIndex: 4 }}
        />
        
        {/* Custom Thumbs */}
        <div 
          className="absolute w-3 h-3 bg-white border-2 border-[#111111] rounded-full top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${(minVal / maxProductPrice) * 100}% - 6px)` }}
        />
        <div 
          className="absolute w-3 h-3 bg-white border-2 border-[#111111] rounded-full top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${(maxVal / maxProductPrice) * 100}% - 6px)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Min</span>
          <div className="flex items-center gap-1 border border-[#ECE8E2] rounded px-2 py-1.5">
            <span className="text-xs text-gray-500">AED</span>
            <input 
              type="number" 
              value={minVal} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setMinVal(isNaN(val) ? 0 : val);
              }}
              onBlur={(e) => applyFilters(parseInt(e.target.value) || 0, maxVal)}
              className="w-full text-xs text-[#111111] focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Max</span>
          <div className="flex items-center gap-1 border border-[#ECE8E2] rounded px-2 py-1.5">
            <span className="text-xs text-gray-500">AED</span>
            <input 
              type="number" 
              value={maxVal} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setMaxVal(isNaN(val) ? maxProductPrice : val);
              }}
              onBlur={(e) => applyFilters(minVal, parseInt(e.target.value) || maxProductPrice)}
              className="w-full text-xs text-[#111111] focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

