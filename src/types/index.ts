export type Product = {
  id: string;
  name: string;
  perKgPrice: number | null;
  ingredients: string[];
  category: string;
};

export type CartItem = Product & { grams: number };
