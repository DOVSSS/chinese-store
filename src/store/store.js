import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Хранилище корзины
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => set((state) => {
        const existing = state.items.find(item => item.id === product.id);
        if (existing) {
          return {
            items: state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage', // имя для localStorage
    }
  )
);

// Хранилище избранного
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      
      toggleFavorite: (productId) => set((state) => {
        if (state.favorites.includes(productId)) {
          return { favorites: state.favorites.filter(id => id !== productId) };
        }
        return { favorites: [...state.favorites, productId] };
      }),
      
      isFavorite: (productId) => get().favorites.includes(productId)
    }),
    {
      name: 'favorites-storage',
    }
  )
);

// Хранилище пользователя
export const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  
  setUser: (user) => set({ 
    user,
    isAdmin: user?.email === 'admin@example.com' // Пример проверки админа
  }),
  
  clearUser: () => set({ user: null, isAdmin: false })
}));