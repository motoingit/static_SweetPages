import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (product: Product, grams?: number) => void;
  updateGrams: (id: string, grams: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sweetshop-cart') ?? '[]') as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('sweetshop-cart', JSON.stringify(items)), [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.length,
    addItem: (product, grams = 10) => setItems(current => {
      const existing = current.find(item => item.id === product.id);
      return existing
        ? current.map(item => item.id === product.id ? { ...item, grams: item.grams + grams } : item)
        : [...current, { ...product, grams }];
    }),
    updateGrams: (id, grams) => setItems(current => current.map(item =>
      item.id === id ? { ...item, grams: Math.max(10, grams || 10) } : item)),
    removeItem: id => setItems(current => current.filter(item => item.id !== id)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
