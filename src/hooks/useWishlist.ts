import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';

export function useWishlist(productId: number) {
  const { wishlistIds, initialize, hasProduct, toggle: toggleStore } = useWishlistStore();
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isWishlisted = hasProduct(productId);

  const toggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    await toggleStore(productId);
    setIsToggling(false);
  };

  return { isWishlisted, isToggling, toggle };
}
