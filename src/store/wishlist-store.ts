import { create } from 'zustand';
import { WishlistService } from '@/lib/wishlist/WishlistService';
import { toast } from 'sonner';

interface WishlistState {
  wishlistIds: number[];
  isInitialized: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  setWishlistIds: (ids: number[]) => void;
  hasProduct: (id: number) => boolean;
  toggle: (productId: number) => Promise<boolean>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  isInitialized: false,
  isAuthenticated: false,

  initialize: async () => {
    // The AuthProvider syncs `isAuthenticated` before calling initialize.
    const { isAuthenticated, isInitialized } = get();
    if (isInitialized) return;
    const ids = await WishlistService.getWishlist(isAuthenticated);
    set({ wishlistIds: ids, isInitialized: true });
  },

  reset: () => set({ wishlistIds: [], isInitialized: false }),

  setWishlistIds: (ids) => set({ wishlistIds: ids }),
  hasProduct: (id) => get().wishlistIds.includes(id),

  toggle: async (productId: number) => {
    const { isAuthenticated, wishlistIds } = get();
    
    // Perform Optimistic UI Update & Background Sync via WishlistService
    const { success, newIds } = await WishlistService.toggle(productId, isAuthenticated, wishlistIds);
    
    if (success) {
      set({ wishlistIds: newIds });
      
      if (newIds.includes(productId)) {
        toast.success('Added to wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
      return true;
    } else {
      toast.error('Failed to update wishlist');
      return false;
    }
  }
}));
