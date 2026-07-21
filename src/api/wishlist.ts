"use client";

// YITH Wishlist API Client
// Securely communicates with the Next.js API route proxy

export async function fetchWishlistIds(): Promise<number[]> {
  try {
    const res = await fetch("/api/wishlist", { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    // Assuming YITH returns an array of items with a product_id field
    if (Array.isArray(data)) {
      return data.map((item: any) => item.product_id);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return [];
  }
}

export async function addToWishlist(productId: number): Promise<boolean> {
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    return false;
  }
}

export async function removeFromWishlist(productId: number): Promise<boolean> {
  try {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    return false;
  }
}

export async function toggleWishlist(productId: number): Promise<{ success: boolean, ids: number[], unauthenticated?: boolean }> {
  try {
    const currentIds = await fetchWishlistIds();
    const exists = currentIds.includes(productId);
    
    let res;
    if (exists) {
      res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.status === 401) return { success: false, ids: currentIds, unauthenticated: true };
      return { success: res.ok, ids: currentIds.filter(id => id !== productId) };
    } else {
      res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.status === 401) return { success: false, ids: currentIds, unauthenticated: true };
      return { success: res.ok, ids: [...currentIds, productId] };
    }
  } catch (error) {
    return { success: false, ids: [] };
  }
}
