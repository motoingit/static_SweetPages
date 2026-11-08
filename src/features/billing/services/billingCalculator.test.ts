import { describe, expect, it } from 'vitest';
import {
  calculateCartTotal,
  calculateCartTotalWeight,
} from './billingCalculator';
import type { CartItem } from '../../../schemas/cart.schema';

describe('Billing Calculator', () => {
  const sampleItems: CartItem[] = [
    {
      id: 'SWT-001',
      name: 'Bundi Laddu',
      perKgPrice: 220,
      ingredients: [],
      category: 'Sweets',
      cartItemId: 'item-1',
      grams: 500, // 500g at ₹220/kg = ₹110
      unitGrams: 500,
      selectedQuantity: 0.5,
      selectedUnit: 'kg',
    },
    {
      id: 'SWT-002',
      name: 'Besan Laddu',
      perKgPrice: 240,
      ingredients: [],
      category: 'Sweets',
      cartItemId: 'item-2',
      grams: 250, // 250g at ₹240/kg = ₹60
      unitGrams: 250,
      selectedQuantity: 0.25,
      selectedUnit: 'kg',
    },
  ];

  it('accurately sums the total bill amount', () => {
    // ₹110 + ₹60 = ₹170.00
    expect(calculateCartTotal(sampleItems)).toBe(170);
  });

  it('accurately sums total weight in grams', () => {
    // 500g + 250g = 750g
    expect(calculateCartTotalWeight(sampleItems)).toBe(750);
  });

  it('returns 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateCartTotalWeight([])).toBe(0);
  });
});

