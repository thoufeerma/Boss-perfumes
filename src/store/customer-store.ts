import { create } from 'zustand';

export interface CustomerProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

interface CustomerState {
  profile: CustomerProfile | null;
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<boolean>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  profile: null,
  isLoading: true,
  isFetched: false,
  error: null,

  fetchProfile: async () => {
    // Only set loading to true if we don't have a profile yet to prevent UI flash on revisit
    if (!get().profile) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await fetch('/api/customer', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Guest user or session expired, don't throw, just silently stop loading
          set({ profile: null, isLoading: false, isFetched: true });
          return;
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      set({ profile: data.customer, isLoading: false, isFetched: true });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load customer data', isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await fetch('/api/customer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update profile');
      }

      const resData = await response.json();
      set({ profile: resData.customer });
      return true;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return false;
    }
  },
}));
