import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeHtmlEntities(str: string | undefined | null): string {
  if (!str) return "";
  let decoded = String(str);

  // Decode double encoding first (e.g. &amp;#8217; -> &#8217;)
  decoded = decoded.replace(/&amp;(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, "&$1;");

  // Numeric entities (decimal)
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code, 10);
    if (num === 8217 || num === 8216 || num === 39) return "'";
    if (num === 8220 || num === 8221 || num === 34) return '"';
    return String.fromCharCode(num);
  });

  // Numeric entities (hex)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const num = parseInt(hex, 16);
    if (num === 0x2019 || num === 0x2018 || num === 0x27) return "'";
    if (num === 0x201c || num === 0x201d || num === 0x22) return '"';
    return String.fromCharCode(num);
  });

  // Common named entities
  const named: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&ndash;": "–",
    "&mdash;": "—",
    "&nbsp;": " ",
    "&hellip;": "…",
  };

  for (const [key, value] of Object.entries(named)) {
    decoded = decoded.split(key).join(value);
  }

  return decoded;
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
