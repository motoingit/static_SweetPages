import { type z } from 'zod';

/**
 * Safely loads and parses data from localStorage with Zod schema validation.
 * Recovers gracefully to fallback if missing or corrupted.
 */
export function loadFromStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.warn(`[storage] Validation failed for key "${key}":`, result.error);
    return fallback;
  } catch (error) {
    console.warn(`[storage] Failed to parse key "${key}" from localStorage:`, error);
    return fallback;
  }
}

/**
 * Safely serializes and saves value to localStorage.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[storage] Failed to save key "${key}" to localStorage:`, error);
    return false;
  }
}

