import rawProductsData from '../../../data/sweetlist.json';
import { productListSchema, type Product } from '../../../schemas/product.schema';

/**
 * Service to load, validate, filter, and sort products from catalog data.
 */
class ProductService {
  private validatedProducts: Product[] = [];
  private loadError: string | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    const result = productListSchema.safeParse(rawProductsData);
    if (result.success) {
      this.validatedProducts = result.data;
      this.loadError = null;
    } else {
      console.error('[ProductService] Catalog data validation failed:', result.error);
      this.validatedProducts = [];
      this.loadError = 'Failed to load valid product catalog data.';
    }
  }

  public getProducts(): { products: Product[]; error: string | null } {
    return {
      products: this.validatedProducts,
      error: this.loadError,
    };
  }

  public getProductById(id: string): Product | undefined {
    return this.validatedProducts.find((product) => product.id === id);
  }

  public filterAndSortProducts(
    products: Product[],
    query: string,
    sortType: string,
    resolveHindiName: (name: string) => string,
  ): Product[] {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (!normalizedQuery) return true;
      const englishName = product.name.toLowerCase();
      const hindiName = resolveHindiName(product.name).toLowerCase();
      const id = product.id.toLowerCase();
      return (
        englishName.includes(normalizedQuery) ||
        hindiName.includes(normalizedQuery) ||
        id.includes(normalizedQuery)
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return (a.perKgPrice ?? 0) - (b.perKgPrice ?? 0);
        case 'price-high':
          return (b.perKgPrice ?? 0) - (a.perKgPrice ?? 0);
        case 'popularity-high':
        default:
          return (b.popularityIndex ?? 0) - (a.popularityIndex ?? 0);
      }
    });
  }
}

export const productService = new ProductService();

