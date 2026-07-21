const GUEST_STORAGE_KEY = 'boss_perfumes_guest_wishlist';

export const GuestWishlistProvider = {
  getWishlist: (): number[] => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(id => parseInt(id, 10)).filter(id => !isNaN(id)); // sanitize and parse
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  setWishlist: (ids: number[]): void => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn("localStorage unavailable for wishlist", e);
    }
  },

  clearWishlist: (): void => {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear guest wishlist from localStorage", e);
    }
  }
};
