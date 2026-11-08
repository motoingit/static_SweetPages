export type {
  CartItem,
  SelectedUnit,
} from '../../../schemas/cart.schema';

export type {
  Order,
  OrderItem,
} from '../../../schemas/order.schema';

export interface CartContextValue {
  items: import('../../../schemas/cart.schema').CartItem[];
  totalItems: number;
  addItem: (
    product: import('../../../schemas/product.schema').Product,
    grams: number,
    selectedQuantity?: number,
    selectedUnit?: import('../../../schemas/cart.schema').SelectedUnit,
  ) => string;
  updateItemUnits: (cartItemId: string, units: number) => void;
  updateGrams: (cartItemId: string, grams: number) => void;
  adjustByUnit: (cartItemId: string, multiplier: 1 | -1) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

