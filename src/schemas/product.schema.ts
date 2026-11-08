import { z } from 'zod';

/**
 * Schema for a Sweet / Product in the catalog.
 */
export const productSchema = z.object({
  id: z.string().min(1, 'Product ID cannot be empty'),
  name: z.string().min(1, 'Product name cannot be empty'),
  perKgPrice: z
    .number()
    .nonnegative('Price per kg must be non-negative')
    .nullable(),
  ingredients: z.array(z.string()).default([]),
  category: z.string().default('Sweets'),
  imageUrl: z.string().optional(),
  popularityIndex: z.number().min(0).max(5).optional(),
});

export const productListSchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;
