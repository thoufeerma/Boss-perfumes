import "server-only";

export async function fetchWC(endpoint: string, options?: RequestInit & { params?: Record<string, string> }) {
  const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!storeUrl || !consumerKey || !consumerSecret) {
    console.warn('WooCommerce credentials are not set.');
    return [];
  }

  const url = new URL(`wp-json/wc/v3/${endpoint}`, storeUrl);
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Basic ${credentials}`);
  headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`WooCommerce API Error: ${response.statusText}`);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('WooCommerce API Network Error:', error);
    return [];
  }
}
