import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setCartOpen: (isOpen: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen, isSearchOpen: false, isCartOpen: false }),
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen, isMobileMenuOpen: false, isCartOpen: false }),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen, isMobileMenuOpen: false, isSearchOpen: false }),
  closeAll: () => set({ isMobileMenuOpen: false, isSearchOpen: false, isCartOpen: false }),
}));
