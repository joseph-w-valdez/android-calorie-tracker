/**
 * Validation utilities for form inputs
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validatePositiveNumber(value: string, fieldName: string = 'value'): { valid: boolean; error?: string } {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `Please enter a valid ${fieldName}` };
  }
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string = 'field'): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: `Please enter a ${fieldName}` };
  }
  return { valid: true };
}

export function validateDate(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Please enter a date' };
  }
  if (!DATE_REGEX.test(value)) {
    return { valid: false, error: 'Please enter a valid date in YYYY-MM-DD format' };
  }
  return { valid: true };
}

export function validateTargetWeight(weight: string, date: string): { valid: boolean; error?: string } {
  const weightValidation = validatePositiveNumber(weight, 'target weight');
  if (!weightValidation.valid) {
    return weightValidation;
  }
  return validateDate(date);
}

