/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  originalError?: unknown;
}

/**
 * Create a user-friendly error message from an error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Log error with context
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}] ${message}`, error);
}

