import { useState } from 'react';
import { useCartContext } from '@/components/cart/CartProvider';
import { useUIStore } from '@/store/ui-store';
import { addToCart as apiAddToCart, removeItem as apiRemoveItem, updateItemQuantity as apiUpdate } from '@/api/cart';
import { toast } from 'sonner';

export function useCart() {
  const { cart, cartCount, refreshCart, setCart } = useCartContext();
  const { setCartOpen } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const add = async (productId: number, quantity: number = 1) => {
    setIsAdding(true);
    try {
      const newCart = await apiAddToCart(productId, quantity);
      setCart(newCart);
      toast.success('Added to bag');
      setCartOpen(true);
    } catch (error) {
      toast.error('Failed to add item to bag');
    } finally {
      setIsAdding(false);
    }
  };

  const remove = async (key: string) => {
    setIsUpdating(true);
    try {
      const newCart = await apiRemoveItem(key);
      setCart(newCart);
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const update = async (key: string, quantity: number) => {
    setIsUpdating(true);
    try {
      const newCart = await apiUpdate(key, quantity);
      setCart(newCart);
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  return { cart, cartCount, isAdding, isUpdating, add, remove, update, refreshCart };
}
