import type { CartItem } from '../../../schemas/cart.schema';
import { calculatePriceForWeight, roundToTwo } from '../../../utils/math';

/**
 * Calculates total bill amount for an array of cart items.
 */
export function calculateCartTotal(items: CartItem[]): number {
  const sum = items.reduce(
    (acc, item) => acc + calculatePriceForWeight(item.perKgPrice, item.grams),
    0,
  );
  return roundToTwo(sum);
}

/**
 * Calculates total net weight in grams for an array of cart items.
 */
export function calculateCartTotalWeight(items: CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + item.grams, 0);
  return roundToTwo(sum);
}

