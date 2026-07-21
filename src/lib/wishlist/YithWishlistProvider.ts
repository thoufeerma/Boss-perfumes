export const YithWishlistProvider = {
  getWishlist: async (): Promise<number[]> => {
    try {
      const res = await fetch("/api/wishlist", { method: "GET" });
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => item.product_id);
      }
      return [];
    } catch (error) {
      console.error("YITH Get Wishlist Failed:", error);
      return [];
    }
  },

  add: async (productId: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      return res.ok;
    } catch (error) {
      console.error("YITH Add Wishlist Failed:", error);
      return false;
    }
  },

  remove: async (productId: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      return res.ok;
    } catch (error) {
      console.error("YITH Remove Wishlist Failed:", error);
      return false;
    }
  }
};
