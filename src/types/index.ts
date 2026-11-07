export type Product = {
  id: string;
  name: string;
  perKgPrice: number | null;
  ingredients: string[];
  category: string;
};

export type CartItem = Product & {
  cartItemId: string;
  grams: number;
  unitGrams: number;
  selectedQuantity: number;
  selectedUnit: 'g' | 'kg' | '₹';
};

export type OrderItem = {
  orderItemId: string;
  cartItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  quantityUnit: CartItem['selectedUnit'];
  quantityInGrams: number;
  baseUnit: 'kg';
  baseUnitPrice: number;
  unitGrams: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
};

export type Order = {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};
