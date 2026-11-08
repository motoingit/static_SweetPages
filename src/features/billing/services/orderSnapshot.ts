import type { CartItem } from '../../../schemas/cart.schema';
import type { Order, OrderItem } from '../../../schemas/order.schema';
import { calculatePriceForWeight, roundToTwo } from '../../../utils/math';
import { generateUniqueId } from '../../../utils/id';

/**
 * Creates an immutable snapshot of an order from active cart items.
 * Preserves monetary calculations up to two decimal places.
 */
export function createOrderSnapshot(items: CartItem[], note = ''): Order {
  const orderItems: OrderItem[] = items.map((item) => {
    const subtotal = calculatePriceForWeight(item.perKgPrice, item.grams);
    return {
      orderItemId: generateUniqueId('item'),
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

  const subtotal = roundToTwo(
    orderItems.reduce((sum, item) => sum + item.subtotal, 0),
  );

  const timestamp = new Date().toISOString();

  return {
    orderId: generateUniqueId('ord'),
    items: orderItems,
    subtotal,
    discountAmount: 0,
    totalPrice: subtotal,
    note,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

