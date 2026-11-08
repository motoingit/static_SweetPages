import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatInputNumber,
  formatNumber,
} from './formatters';

describe('Formatters', () => {
  it('formats currency with ₹ symbol and two decimals', () => {
    expect(formatCurrency(55)).toBe('₹55.00');
    expect(formatCurrency(1250.5)).toBe('₹1,250.50');
  });

  it('formats display numbers using Indian number grouping', () => {
    expect(formatNumber(1000)).toBe('1,000.00');
    expect(formatNumber(100000)).toBe('1,00,000.00');
  });

  it('formats input numbers WITHOUT commas for HTML5 input compatibility', () => {
    // Crucial bug fix test: formatInputNumber must not include commas so HTML5 input[type=number] accepts it
    expect(formatInputNumber(1000)).toBe('1000.00');
    expect(formatInputNumber(1250.75)).toBe('1250.75');
    expect(Number(formatInputNumber(1250.75))).toBe(1250.75);
    expect(isNaN(Number(formatInputNumber(1250.75)))).toBe(false);
  });
});

