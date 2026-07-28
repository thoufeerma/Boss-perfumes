import Image from "next/image";

interface GalleryImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function GalleryImage({ src, alt, priority = false }: GalleryImageProps) {
  return (
    <div className="shrink-0 w-[85vw] md:w-[60vw] lg:w-[50vw] h-[65vh] md:h-[70vh] lg:h-[75vh] relative rounded-[20px] md:rounded-[24px] overflow-hidden shadow-2xl">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover object-center"
        sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 50vw"
      />
    </div>
  );
}
