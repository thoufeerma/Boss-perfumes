export interface ACFHomepageData {
  hero_heading?: string;
  hero_description?: string;
  hero_primary_button_text?: string;
  hero_primary_button_link?: string;
  hero_secondary_button_text?: string;
  hero_secondary_button_link?: string;
  hero_image?: {
    url: string;
    alt?: string;
  };
  combo_heading?: string;
  combo_description?: string;
  combo_button_text?: string;
  combo_button_link?: string;
  combo_background_image?: {
    url: string;
    alt?: string;
  };
  combo_left_label?: string;
  combo_left_heading?: string;
  combo_left_description?: string;
  combo_left_button_text?: string;
  combo_left_button_link?: string;
  combo_left_background_image?: {
    url: string;
    alt?: string;
  };
}

export interface WPPage {
  id: number;
  slug: string;
  acf: ACFHomepageData;
}

export async function getHomepageACF(): Promise<ACFHomepageData | null> {
  const wpApiUrl = process.env.WORDPRESS_API_URL;
  
  if (!wpApiUrl) {
    console.error("Missing WORDPRESS_API_URL in environment variables.");
    return null;
  }

  try {
    const res = await fetch(`${wpApiUrl}/wp/v2/pages?slug=homepage&acf_format=standard`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`WordPress API Error: ${res.status}`);
      return null;
    }

    const data: WPPage[] = await res.json();
    const page = data[0];

    return page?.acf ?? null;
  } catch (error) {
    console.error("Failed to fetch homepage ACF data:", error);
    return null;
  }
}
