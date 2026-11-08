import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, SelectedUnit } from '../../../schemas/cart.schema';
import type { Product } from '../../../schemas/product.schema';
import { cartItemListSchema } from '../../../schemas/cart.schema';
import { roundToTwo } from '../../../utils/math';
import { generateUniqueId } from '../../../utils/id';
import { saveToStorage } from '../../../utils/storage';
import type { CartContextValue } from '../types/billing.types';

const STORAGE_KEY = 'sweetshop-cart';

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Validate with schema first
      const validation = cartItemListSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
      // If legacy structure exists, safely normalize items
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is Product & Partial<CartItem> => Boolean(item && item.id && item.name))
          .map((item) => {
            const grams = roundToTwo(Number(item.grams) || 10);
            const unitGrams = roundToTwo(Number(item.unitGrams) || grams || 10);
            const selectedQuantity = roundToTwo(Number(item.selectedQuantity) || grams || 10);
            const selectedUnit: SelectedUnit =
              item.selectedUnit === 'kg' || item.selectedUnit === '₹' ? item.selectedUnit : 'g';

            return {
              id: item.id,
              name: item.name,
              perKgPrice: typeof item.perKgPrice === 'number' && item.perKgPrice >= 0 ? item.perKgPrice : null,
              ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
              category: item.category || 'Sweets',
              imageUrl: item.imageUrl,
              popularityIndex: typeof item.popularityIndex === 'number' ? item.popularityIndex : 0,
              cartItemId: item.cartItemId || generateUniqueId('cart'),
              grams: Math.max(1, grams),
              unitGrams: Math.max(1, unitGrams),
              selectedQuantity: Math.max(0.01, selectedQuantity),
              selectedUnit,
            };
          });
      }
      return [];
    } catch (error) {
      console.warn('[CartContext] Failed to load cart from storage:', error);
      return [];
    }
  });

  // Persist cart changes to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEY, items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    totalItems: items.length,

    addItem: (
      product: Product,
      grams: number,
      selectedQuantity = grams,
      selectedUnit: SelectedUnit = 'g',
    ) => {
      const roundedGrams = Math.max(0.01, roundToTwo(grams));
      const cartItemId = generateUniqueId('cart');

      setItems((current) => [
        ...current,
        {
          ...product,
          cartItemId,
          grams: roundedGrams,
          unitGrams: roundedGrams,
          selectedQuantity: Math.max(0.01, roundToTwo(selectedQuantity)),
          selectedUnit,
        },
      ]);

      return cartItemId;
    },

    updateItemUnits: (cartItemId: string, units: number) => {
      setItems((current) =>
        current.map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const safeUnits = Math.min(30, Math.max(1, Math.round(units)));
          const nextGrams = roundToTwo(item.unitGrams * safeUnits);

          // Preserve the original unit selected by user
          let nextSelectedQuantity: number;
          if (item.selectedUnit === 'kg') {
            nextSelectedQuantity = roundToTwo(nextGrams / 1000);
          } else if (item.selectedUnit === '₹' && item.perKgPrice) {
            nextSelectedQuantity = roundToTwo((nextGrams * item.perKgPrice) / 1000);
          } else {
            nextSelectedQuantity = nextGrams;
          }

          return {
            ...item,
            grams: nextGrams,
            selectedQuantity: nextSelectedQuantity,
            selectedUnit: item.selectedUnit,
          };
        }),
      );
    },

    updateGrams: (cartItemId: string, grams: number) => {
      setItems((current) =>
        current.map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const validGrams = Number.isFinite(grams) && grams > 0
            ? roundToTwo(grams)
            : item.unitGrams;
          return {
            ...item,
            grams: Math.max(0.01, validGrams),
          };
        }),
      );
    },

    adjustByUnit: (cartItemId: string, multiplier: 1 | -1) => {
      setItems((current) =>
        current.map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const step = item.unitGrams || 10;
          const nextGrams = roundToTwo(
            Math.max(step, item.grams + step * multiplier),
          );
          return {
            ...item,
            grams: nextGrams,
          };
        }),
      );
    },

    removeItem: (cartItemId: string) => {
      setItems((current) =>
        current.filter((item) => item.cartItemId !== cartItemId),
      );
    },

    clearCart: () => {
      setItems([]);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

