"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { type WCImage } from "@/api/products";

interface ThumbnailGalleryProps {
  images: WCImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ThumbnailGallery({ images, activeIndex, onSelect }: ThumbnailGalleryProps) {
  if (!images || images.length <= 1) return null;

  return (
    <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
      {images.map((image, index) => (
        <button
          key={`${image.id || 'img'}-${index}`}
          onClick={() => onSelect(index)}
          className={cn(
            "relative w-20 h-24 lg:w-24 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
            activeIndex === index ? "border-[#111111]" : "border-transparent hover:border-gray-300"
          )}
        >
          <div className="absolute inset-0 bg-[#FAF8F4] z-0" />
          <Image
            src={image.src}
            alt={image.alt || `Thumbnail ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 80px, 96px"
            className="object-contain p-1 z-10"
          />
        </button>
      ))}
    </div>
  );
}
