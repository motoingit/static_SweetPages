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
