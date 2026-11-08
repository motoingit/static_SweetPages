import { z } from 'zod';
import { productSchema } from './product.schema';

export const selectedUnitSchema = z.enum(['g', 'kg', '₹']);

export type SelectedUnit = z.infer<typeof selectedUnitSchema>;

/**
 * Schema for an active item in the customer's cart.
 * Extends product information with cart-specific quantity and unit data.
 */
export const cartItemSchema = productSchema.extend({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
  grams: z.number().positive('Grams must be a positive number'),
  unitGrams: z.number().positive('Unit grams must be a positive number'),
  selectedQuantity: z.number().positive('Selected quantity must be positive'),
  selectedUnit: selectedUnitSchema,
});

export const cartItemListSchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartItemSchema>;

