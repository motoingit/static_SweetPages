import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { roundToTwo } from '../utils';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (product: Product, grams: number, selectedQuantity?: number, selectedUnit?: CartItem['selectedUnit']) => string;
  updateItemUnits: (cartItemId: string, units: number) => void;
  updateGrams: (cartItemId: string, grams: number) => void;
  adjustByUnit: (cartItemId: string, multiplier: 1 | -1) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('sweetshop-cart') ?? '[]') as Array<Partial<CartItem> & Product>;
      return savedItems.map(item => ({
        ...item,
        cartItemId: item.cartItemId ?? createCartItemId(),
        grams: roundToTwo(item.grams ?? 10),
        unitGrams: roundToTwo(item.unitGrams ?? item.grams ?? 10),
        selectedQuantity: roundToTwo(item.selectedQuantity ?? item.grams ?? 10),
        selectedUnit: item.selectedUnit ?? 'g',
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem('sweetshop-cart', JSON.stringify(items)), [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.length,
    addItem: (product, grams, selectedQuantity = grams, selectedUnit = 'g') => {
      const roundedGrams = roundToTwo(grams);
      const cartItemId = createCartItemId();
      setItems(current => [...current, {
        ...product,
        cartItemId,
        grams: roundedGrams,
        unitGrams: roundedGrams,
        selectedQuantity: roundToTwo(selectedQuantity),
        selectedUnit,
      }]);
      return cartItemId;
    },
    updateItemUnits: (cartItemId, units) => setItems(current => current.map(item => {
      if (item.cartItemId !== cartItemId) return item;
      const safeUnits = Math.min(30, Math.max(1, Math.round(units)));
      return {
        ...item,
        grams: roundToTwo(item.unitGrams * safeUnits),
        selectedQuantity: roundToTwo(item.unitGrams * safeUnits / 1000),
        selectedUnit: 'kg',
      };
    })),
    updateGrams: (cartItemId, grams) => setItems(current => current.map(item =>
      item.cartItemId === cartItemId ? { ...item, grams: roundToTwo(Math.max(item.unitGrams, grams || item.unitGrams)) } : item)),
    adjustByUnit: (cartItemId, multiplier) => setItems(current => current.map(item =>
      item.cartItemId === cartItemId
        ? { ...item, grams: roundToTwo(Math.max(item.unitGrams, item.grams + item.unitGrams * multiplier)) }
        : item)),
    removeItem: cartItemId => setItems(current => current.filter(item => item.cartItemId !== cartItemId)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function createCartItemId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
