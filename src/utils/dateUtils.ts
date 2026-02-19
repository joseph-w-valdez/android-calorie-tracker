/**
 * Format a date as YYYY-MM-DD in local timezone (not UTC)
 * This prevents timezone issues where dates can be off by one day
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format in local timezone
 */
export function getTodayLocal(): string {
  return formatDateLocal(new Date());
}

/**
 * Create a date from YYYY-MM-DD string in local timezone
 */
export function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

