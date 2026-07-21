"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function FilterGroup({ title, children, defaultExpanded = true }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-[#ECE8E2] py-5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-text">
          {title}
        </h3>
        <ChevronDown 
          className={cn("h-4 w-4 text-brand-text-muted transition-transform duration-300", isExpanded ? "rotate-180" : "")} 
        />
      </button>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[1000px] opacity-100 pt-5" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
