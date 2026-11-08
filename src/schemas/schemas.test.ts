import { describe, expect, it } from 'vitest';
import { productSchema } from './product.schema';
import { cartItemSchema } from './cart.schema';
import { orderSchema } from './order.schema';

describe('Data Schemas & Validation', () => {
  it('validates correct product structure', () => {
    const validProduct = {
      id: 'SWT-001',
      name: 'Bundi Laddu',
      perKgPrice: 220,
      ingredients: ['Gram flour', 'Sugar', 'Ghee'],
      category: 'Sweets',
      popularityIndex: 5,
    };

    const parsed = productSchema.safeParse(validProduct);
    expect(parsed.success).toBe(true);
  });

  it('rejects product with negative price or empty id', () => {
    expect(productSchema.safeParse({ id: '', name: 'Test', perKgPrice: 100 }).success).toBe(false);
    expect(productSchema.safeParse({ id: '1', name: 'Test', perKgPrice: -50 }).success).toBe(false);
  });

  it('validates cart item with positive grams and unit type', () => {
    const validCartItem = {
      id: 'SWT-001',
      name: 'Bundi Laddu',
      perKgPrice: 220,
      ingredients: [],
      category: 'Sweets',
      cartItemId: 'cart-1234',
      grams: 250,
      unitGrams: 250,
      selectedQuantity: 0.25,
      selectedUnit: 'kg' as const,
    };

    const parsed = cartItemSchema.safeParse(validCartItem);
    expect(parsed.success).toBe(true);
  });

  it('rejects cart item with non-positive weight', () => {
    const invalidCartItem = {
      id: 'SWT-001',
      name: 'Bundi Laddu',
      perKgPrice: 220,
      ingredients: [],
      category: 'Sweets',
      cartItemId: 'cart-1234',
      grams: 0,
      unitGrams: 250,
      selectedQuantity: 0.25,
      selectedUnit: 'kg' as const,
    };

    expect(cartItemSchema.safeParse(invalidCartItem).success).toBe(false);
  });

  it('validates completed order structure', () => {
    const validOrder = {
      orderId: 'ord-1234',
      items: [
        {
          orderItemId: 'item-1',
          cartItemId: 'cart-1',
          productId: 'SWT-001',
          productName: 'Bundi Laddu',
          quantity: 1,
          quantityUnit: 'kg' as const,
          quantityInGrams: 1000,
          baseUnit: 'kg' as const,
          baseUnitPrice: 220,
          unitGrams: 1000,
          subtotal: 220,
          discountAmount: 0,
          totalPrice: 220,
        },
      ],
      subtotal: 220,
      discountAmount: 0,
      totalPrice: 220,
      note: 'Deliver before 5 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(orderSchema.safeParse(validOrder).success).toBe(true);
  });
});

