import { z } from 'zod';
import { selectedUnitSchema } from './cart.schema';

/**
 * Schema for an individual line item in an Order receipt.
 */
export const orderItemSchema = z.object({
  orderItemId: z.string().min(1),
  cartItemId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  quantityUnit: selectedUnitSchema,
  quantityInGrams: z.number().positive(),
  baseUnit: z.literal('kg'),
  baseUnitPrice: z.number().nonnegative(),
  unitGrams: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  totalPrice: z.number().nonnegative(),
});

/**
 * Schema for a generated Order / Bill.
 */
export const orderSchema = z.object({
  orderId: z.string().min(1),
  items: z.array(orderItemSchema),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  totalPrice: z.number().nonnegative(),
  note: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;

