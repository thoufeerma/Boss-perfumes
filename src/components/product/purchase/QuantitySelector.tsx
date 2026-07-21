"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (q: number) => void;
  max?: number;
}

export function QuantitySelector({ quantity, setQuantity, max = 99 }: QuantitySelectorProps) {
  const handleDecrement = () => setQuantity(Math.max(1, quantity - 1));
  const handleIncrement = () => setQuantity(Math.min(max, quantity + 1));

  return (
    <div className="flex items-center border border-[#ECE8E2] rounded-full overflow-hidden h-[52px] bg-white">
      <button 
        onClick={handleDecrement}
        className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-[3rem] h-full flex items-center justify-center text-sm font-medium text-[#111111]">
        {quantity}
      </div>
      <button 
        onClick={handleIncrement}
        className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
