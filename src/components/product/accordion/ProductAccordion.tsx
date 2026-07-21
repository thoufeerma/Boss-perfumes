"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export function ProductAccordion({ items }: ProductAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-[#ECE8E2] border-t border-b border-[#ECE8E2] mt-12">
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div key={item.id} className="py-4">
            <button
              onClick={() => toggle(item.id)}
              className="flex items-center justify-between w-full text-left focus:outline-none group"
              aria-expanded={isOpen}
            >
              <span className="text-[13px] font-bold text-[#111111] tracking-[0.1em] uppercase">
                {item.title}
              </span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#111111]",
                  isOpen && "transform rotate-180 text-[#111111]"
                )} 
              />
            </button>
            <div 
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="text-sm text-gray-600 leading-relaxed max-w-none prose prose-sm prose-p:mb-4 last:prose-p:mb-0">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
