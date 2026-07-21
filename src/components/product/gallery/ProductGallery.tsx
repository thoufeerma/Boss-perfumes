"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbnailGallery } from "./ThumbnailGallery";
import { type WCImage } from "@/api/products";

interface ProductGalleryProps {
  images: WCImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-[#FAF8F4] rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 w-full">
      {/* Thumbnails */}
      <div className="lg:w-24 flex-shrink-0">
        <ThumbnailGallery 
          images={images} 
          activeIndex={activeIndex} 
          onSelect={setActiveIndex} 
        />
      </div>

      {/* Main Image */}
      <div className="flex-1 relative aspect-[4/5] lg:aspect-auto lg:h-[80vh] rounded-xl overflow-hidden bg-[#FAF8F4] group">
        <Image
          src={activeImage.src}
          alt={activeImage.alt || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-contain p-4 lg:p-12 transition-transform duration-500 ease-out lg:group-hover:scale-105"
        />
      </div>
    </div>
  );
}
