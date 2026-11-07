export const roundToTwo = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const priceForWeight = (price: number | null, grams: number) =>
  price === null ? 0 : roundToTwo((roundToTwo(price) * roundToTwo(grams)) / 1000);

export const formatCurrency = (amount: number) =>
  `₹${roundToTwo(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatNumber = (amount: number) =>
  roundToTwo(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
