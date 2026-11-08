import { describe, expect, it } from 'vitest';
import { productService } from './productService';
import type { Product } from '../../../schemas/product.schema';

describe('Product Service', () => {
  const sampleProducts: Product[] = [
    {
      id: 'SWT-001',
      name: 'Bundi Laddu',
      perKgPrice: 220,
      ingredients: [],
      category: 'Sweets',
      popularityIndex: 5,
    },
    {
      id: 'SWT-002',
      name: 'Besan Laddu',
      perKgPrice: 240,
      ingredients: [],
      category: 'Sweets',
      popularityIndex: 4,
    },
    {
      id: 'SWT-003',
      name: 'Kaju Katli',
      perKgPrice: 800,
      ingredients: [],
      category: 'Sweets',
      popularityIndex: 5,
    },
  ];

  const dummyHindiResolver = (name: string) => {
    if (name === 'Bundi Laddu') return 'बूंदी लड्डू';
    return name;
  };

  it('filters products by English query', () => {
    const result = productService.filterAndSortProducts(
      sampleProducts,
      'bundi',
      'popularity-high',
      dummyHindiResolver,
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bundi Laddu');
  });

  it('filters products by Hindi query', () => {
    const result = productService.filterAndSortProducts(
      sampleProducts,
      'बूंदी',
      'popularity-high',
      dummyHindiResolver,
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bundi Laddu');
  });

  it('filters products by Product ID', () => {
    const result = productService.filterAndSortProducts(
      sampleProducts,
      'swt-003',
      'popularity-high',
      dummyHindiResolver,
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Kaju Katli');
  });

  it('sorts products by price low to high', () => {
    const result = productService.filterAndSortProducts(
      sampleProducts,
      '',
      'price-low',
      dummyHindiResolver,
    );
    expect(result[0].perKgPrice).toBe(220);
    expect(result[2].perKgPrice).toBe(800);
  });

  it('sorts products by price high to low', () => {
    const result = productService.filterAndSortProducts(
      sampleProducts,
      '',
      'price-high',
      dummyHindiResolver,
    );
    expect(result[0].perKgPrice).toBe(800);
    expect(result[2].perKgPrice).toBe(220);
  });
});

