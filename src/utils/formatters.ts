import { roundToTwo } from './math';

/**
 * Formats a numeric monetary value in Indian Rupee format with ₹ prefix.
 * e.g., 1250.5 -> "₹1,250.50"
 */
export const formatCurrency = (amount: number): string => {
  const safeAmount = roundToTwo(amount);
  return `₹${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a display number according to the Indian numbering system.
 * NOTE: For display only! Never use as value in HTML5 <input type="number">.
 * e.g., 1250.5 -> "1,250.50"
 */
export const formatNumber = (amount: number): string => {
  const safeAmount = roundToTwo(amount);
  return safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formats a number for HTML5 <input type="number"> elements.
 * Produces standard decimal format without locale commas, preventing parsing errors.
 * e.g., 1250.5 -> "1250.50" or "1250"
 */
export const formatInputNumber = (amount: number, decimals = 2): string => {
  if (!Number.isFinite(amount)) return '0';
  const safeAmount = roundToTwo(amount);
  return safeAmount.toFixed(decimals);
};

