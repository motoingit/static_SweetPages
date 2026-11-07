import type { CartItem, Order } from '../types';

export const roundToTwo = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const priceForWeight = (price: number | null, grams: number) =>
  price === null ? 0 : roundToTwo((roundToTwo(price) * roundToTwo(grams)) / 1000);

export const formatCurrency = (amount: number) =>
  `₹${roundToTwo(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatNumber = (amount: number) =>
  roundToTwo(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function createOrderSnapshot(items: CartItem[], note = ''): Order {
  const orderItems = items.map(item => {
    const subtotal = priceForWeight(item.perKgPrice, item.grams);
    return {
      orderItemId: createId(),
      cartItemId: item.cartItemId,
      productId: item.id,
      productName: item.name,
      quantity: roundToTwo(item.selectedQuantity),
      quantityUnit: item.selectedUnit,
      quantityInGrams: roundToTwo(item.grams),
      baseUnit: 'kg' as const,
      baseUnitPrice: roundToTwo(item.perKgPrice ?? 0),
      unitGrams: roundToTwo(item.unitGrams),
      subtotal,
      discountAmount: 0,
      totalPrice: subtotal,
    };
  });
  const subtotal = roundToTwo(orderItems.reduce((sum, item) => sum + item.subtotal, 0));
  return {
    orderId: createId(),
    items: orderItems,
    subtotal,
    discountAmount: 0,
    totalPrice: subtotal,
    note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
