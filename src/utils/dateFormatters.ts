import { parseDateLocal } from './dateUtils';

/**
 * Format date as full date string (e.g., "Monday, January 1, 2024")
 */
export function formatDateFull(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date as short date string (e.g., "Jan 1, 2024")
 */
export function formatDateShort(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date as weekday abbreviation (e.g., "Mon")
 */
export function formatDateWeekday(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format date as month/day (e.g., "1/15")
 */
export function formatDateMonthDay(dateString: string): string {
  const date = parseDateLocal(dateString);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

