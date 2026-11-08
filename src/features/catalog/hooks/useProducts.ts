import { useMemo } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../../../schemas/product.schema';

export interface UseProductsResult {
  products: Product[];
  error: string | null;
}

export function useProducts(): UseProductsResult {
  return useMemo(() => productService.getProducts(), []);
}

