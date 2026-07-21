import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: string | number, 
  currencyCode: string = "AED", 
  minorUnitDivisor: number = 1
): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "";

  const finalPrice = numericPrice / minorUnitDivisor;

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: finalPrice % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(finalPrice);

  return `${currencyCode} ${formattedNumber}`;
}
