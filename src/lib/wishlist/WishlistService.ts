import { GuestWishlistProvider } from "./GuestWishlistProvider";
import { YithWishlistProvider } from "./YithWishlistProvider";
import { toast } from "sonner";

export const WishlistService = {
  getWishlist: async (isAuthenticated: boolean): Promise<number[]> => {
    if (isAuthenticated) {
      return await YithWishlistProvider.getWishlist();
    }
    return GuestWishlistProvider.getWishlist();
  },

  toggle: async (productId: number, isAuthenticated: boolean, currentIds: number[]): Promise<{ success: boolean, newIds: number[] }> => {
    const isWishlisted = currentIds.includes(productId);
    const newIds = isWishlisted 
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];

    if (!isAuthenticated) {
      GuestWishlistProvider.setWishlist(newIds);
      return { success: true, newIds };
    }

    // Authenticated Mode: hit YITH
    const success = isWishlisted 
      ? await YithWishlistProvider.remove(productId)
      : await YithWishlistProvider.add(productId);

    if (!success) {
      return { success: false, newIds: currentIds }; // Rollback
    }
    
    return { success: true, newIds };
  },

  syncOnLogin: async (): Promise<void> => {
    console.log("[WishlistService] Starting syncOnLogin...");
    const guestIds = GuestWishlistProvider.getWishlist();
    console.log(`[WishlistService] Guest Wishlist IDs:`, guestIds);
    
    // Skip if guest wishlist is empty
    if (guestIds.length === 0) {
      console.log("[WishlistService] Guest wishlist is empty. Sync complete.");
      return;
    }

    console.log(`[WishlistService] Authenticated: true (Assuming because syncOnLogin was called)`);
    console.log("[WishlistService] Fetching current YITH wishlist...");
    // Fetch current YITH wishlist
    const yithIds = await YithWishlistProvider.getWishlist();
    console.log(`[WishlistService] Current YITH IDs:`, yithIds);

    // Find missing items
    const missingIds = guestIds.filter(id => !yithIds.includes(id));
    console.log(`[WishlistService] Missing IDs to upload:`, missingIds);

    // Upload missing items
    if (missingIds.length > 0) {
      console.log(`[WishlistService] Uploading ${missingIds.length} missing products...`);
      const results = await Promise.allSettled(
        missingIds.map(async (id) => {
          console.log(`[WishlistService] Uploading Product: ${id}`);
          const res = await YithWishlistProvider.add(id);
          console.log(`[WishlistService] Upload ${res ? 'Success' : 'Failed'} for Product: ${id}`);
          return res;
        })
      );

      // Verify all uploads succeeded
      const hasFailures = results.some(
        result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)
      );

      // If any upload fails, preserve the guest storage so nothing is lost
      if (hasFailures) {
        console.error("[WishlistService] Wishlist sync failed partially. Preserving localStorage for future recovery.");
        toast.error("Failed to sync some wishlist items. They will be saved for later.");
        return;
      }
    }

    console.log("[WishlistService] Fetching latest YITH wishlist for verification...");
    const verifyYithIds = await YithWishlistProvider.getWishlist();
    console.log(`[WishlistService] Latest YITH IDs after upload:`, verifyYithIds);

    console.log("[WishlistService] Clearing Guest Wishlist...");
    // Synchronization fully successful, safely clear local guest cache
    GuestWishlistProvider.clearWishlist();
    console.log("[WishlistService] Sync Complete.");
  }
};
