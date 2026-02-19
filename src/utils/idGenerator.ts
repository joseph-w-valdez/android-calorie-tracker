/**
 * Utility functions for generating unique IDs
 */

/**
 * Generate a unique ID with timestamp and random suffix
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

