import { Metadata } from "next";

export interface PageMetadataConfig {
  title: string;
  description?: string;
  slug: string;
  type?: "website" | "article";
  image?: string;
}

export function generatePageMetadata({
  title,
  description,
  slug,
  type = "website",
  image = "/images/og-default.jpg"
}: PageMetadataConfig): Metadata {
  const siteName = "Boss Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bossperfumes.com";
  
  // Clean up title
  const cleanTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const cleanDescription = description || `Shop ${title.toLowerCase()} at ${siteName}.`;

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `${baseUrl}/${slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `${baseUrl}/${slug}`,
      siteName,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: [image],
    }
  };
}
