"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BrandsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Brands API Error:", error);
  }, [error]);

  return (
    <div className="bg-brand-bg-secondary min-h-screen">
      <div className="pt-32 lg:pt-[128px]" />
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24 text-center">
        <h2 className="text-3xl font-serif text-brand-text mb-4">Something went wrong</h2>
        <p className="text-brand-text-muted mb-8 max-w-lg mx-auto">
          We encountered an error while loading our brands. Please try again or return to the homepage.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-[#111111] text-white py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#111111] text-[#111111] py-3 px-8 text-sm font-medium tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
