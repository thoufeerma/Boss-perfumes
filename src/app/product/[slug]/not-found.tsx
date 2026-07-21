import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center py-24">
      <div className="w-16 h-16 bg-[#FAF8F4] rounded-full flex items-center justify-center mb-6 border border-[#ECE8E2]">
        <AlertCircle className="w-8 h-8 text-[#111111]" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-serif text-[#111111] mb-4">Product Not Found</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        We couldn't find the fragrance you're looking for. It may have been removed, or the URL might be incorrect.
      </p>
      <Link 
        href="/collections" 
        className="px-8 py-4 bg-[#111111] text-white rounded-full text-sm font-medium hover:bg-[#222222] transition-colors"
      >
        Explore Collections
      </Link>
    </div>
  );
}
