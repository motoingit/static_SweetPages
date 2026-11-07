export const priceForWeight = (price: number | null, grams: number) =>
  price === null ? 0 : (price * grams) / 1000;

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatNumber = (amount: number) =>
  amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
