/**
 * Mathematical precision utilities for sweet pricing and weight calculations.
 */

/**
 * Rounds a number to two decimal places avoiding floating point representation issues.
 */
export const roundToTwo = (amount: number): number => {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Safely parses an unknown value into a positive finite number, or returns fallback.
 */
export const safePositiveNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? roundToTwo(parsed) : fallback;
};

/**
 * Calculates total price for a given weight in grams based on per-kg price.
 * Formula: (perKgPrice * grams) / 1000
 */
export const calculatePriceForWeight = (
  price: number | null,
  grams: number,
): number => {
  if (price === null || !Number.isFinite(price) || !Number.isFinite(grams) || grams <= 0) {
    return 0;
  }
  return roundToTwo((roundToTwo(price) * roundToTwo(grams)) / 1000);
};

/**
 * Calculates weight in grams for a given amount in rupees based on per-kg price.
 * Formula: (rupees * 1000) / perKgPrice
 */
export const calculateWeightForPrice = (
  price: number | null,
  rupees: number,
): number => {
  if (price === null || !Number.isFinite(price) || price <= 0 || !Number.isFinite(rupees) || rupees <= 0) {
    return 0;
  }
  return roundToTwo((roundToTwo(rupees) * 1000) / roundToTwo(price));
};

// Aliases for backward compatibility
export const priceForWeight = calculatePriceForWeight;

