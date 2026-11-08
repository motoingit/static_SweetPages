import { describe, expect, it } from 'vitest';
import {
  calculatePriceForWeight,
  calculateWeightForPrice,
  roundToTwo,
  safePositiveNumber,
} from './math';

describe('Math & Precision Utilities', () => {
  it('correctly rounds decimal numbers to 2 places avoiding float drift', () => {
    expect(roundToTwo(10.005)).toBe(10.01);
    expect(roundToTwo(1.004)).toBe(1);
    expect(roundToTwo(0.1 + 0.2)).toBe(0.3);
    expect(roundToTwo(NaN)).toBe(0);
    expect(roundToTwo(Infinity)).toBe(0);
  });

  it('safely extracts positive numbers and falls back appropriately', () => {
    expect(safePositiveNumber('15.5', 0)).toBe(15.5);
    expect(safePositiveNumber('-5', 10)).toBe(10);
    expect(safePositiveNumber('invalid', 20)).toBe(20);
    expect(safePositiveNumber(0, 10)).toBe(10);
  });

  it('calculates price for weight accurately', () => {
    // ₹220 / kg for 250g = ₹55.00
    expect(calculatePriceForWeight(220, 250)).toBe(55);
    // ₹240 / kg for 10g = ₹2.40
    expect(calculatePriceForWeight(240, 10)).toBe(2.4);
    // ₹240 / kg for 1g = ₹0.24
    expect(calculatePriceForWeight(240, 1)).toBe(0.24);
    // ₹350 / kg for 1250g = ₹437.50
    expect(calculatePriceForWeight(350, 1250)).toBe(437.5);
    // Null or invalid prices return 0
    expect(calculatePriceForWeight(null, 500)).toBe(0);
    expect(calculatePriceForWeight(200, -10)).toBe(0);
  });

  it('calculates weight in grams for given money amount accurately', () => {
    // ₹220 / kg, spend ₹55 -> exactly 250g
    expect(calculateWeightForPrice(220, 55)).toBe(250);
    // ₹240 / kg, spend ₹20 -> 83.33g
    expect(calculateWeightForPrice(240, 20)).toBe(83.33);
    // Null price or 0 amount returns 0
    expect(calculateWeightForPrice(null, 100)).toBe(0);
    expect(calculateWeightForPrice(200, 0)).toBe(0);
  });
});

