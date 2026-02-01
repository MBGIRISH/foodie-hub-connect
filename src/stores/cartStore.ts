import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item) => {
        const { items, restaurantId } = get();

        // If cart has items from different restaurant, ask to clear
        if (restaurantId && restaurantId !== item.restaurantId) {
          if (!window.confirm('Your cart contains items from another restaurant. Clear cart and add this item?')) {
            return;
          }
          set({ items: [], restaurantId: null, restaurantName: null });
        }

        const existingItem = items.find((i) => i.menuItemId === item.menuItemId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                id: crypto.randomUUID(),
                quantity: 1,
              },
            ],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
        }
      },

      removeItem: (menuItemId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.menuItemId !== menuItemId);
        set({
          items: newItems,
          restaurantId: newItems.length > 0 ? get().restaurantId : null,
          restaurantName: newItems.length > 0 ? get().restaurantName : null,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'foodiehub-cart',
    }
  )
);
