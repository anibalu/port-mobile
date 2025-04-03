/**
 * Validation utils to validate simple objects.
 * Since our storage layer only stores simple objects, we don't need to spend too much time on complex validation logic.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
}

export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_VALUE = 'INVALID_VALUE',
  INVALID_LENGTH = 'INVALID_LENGTH',
}

// Define types for validator functions
export type Validator<T> = (value: T, field: string) => ValidationError[];

// Required field validator
export const required = <T>(value: T, field: string): ValidationError[] => {
  if (value === undefined || value === null || value === '') {
    return [
      {
        field,
        message: `${field} is required`,
        code: ValidationErrorCode.REQUIRED,
      },
    ];
  }
  return [];
};

// Type validator
export const isType =
  <T>(type: string) =>
  (value: T, field: string): ValidationError[] => {
    if (value !== undefined && value !== null && typeof value !== type) {
      return [
        {
          field,
          message: `${field} must be a ${type}`,
          code: ValidationErrorCode.INVALID_TYPE,
        },
      ];
    }
    return [];
  };

// String length validator
export const hasLength =
  (min: number, max?: number) =>
  (value: string, field: string): ValidationError[] => {
    if (typeof value !== 'string') {
      return [];
    }

    const errors: ValidationError[] = [];

    if (min !== undefined && value.length < min) {
      errors.push({
        field,
        message: `${field} must be at least ${min} characters`,
        code: ValidationErrorCode.INVALID_LENGTH,
      });
    }

    if (max !== undefined && value.length > max) {
      errors.push({
        field,
        message: `${field} must be at most ${max} characters`,
        code: ValidationErrorCode.INVALID_LENGTH,
      });
    }

    return errors;
  };

// Format validator (for emails, phone numbers, etc.)
export const matchesPattern =
  (pattern: RegExp, errorMessage?: string) =>
  (value: string, field: string): ValidationError[] => {
    if (!value || typeof value !== 'string') {
      return [];
    }

    if (!pattern.test(value)) {
      return [
        {
          field,
          message: errorMessage || `${field} has an invalid format`,
          code: ValidationErrorCode.INVALID_FORMAT,
        },
      ];
    }

    return [];
  };

// Value range validator (for numbers)
export const isInRange =
  (min?: number, max?: number) =>
  (value: number, field: string): ValidationError[] => {
    if (value === undefined || value === null) {
      return [];
    }

    const errors: ValidationError[] = [];

    if (min !== undefined && value < min) {
      errors.push({
        field,
        message: `${field} must be at least ${min}`,
        code: ValidationErrorCode.INVALID_VALUE,
      });
    }

    if (max !== undefined && value > max) {
      errors.push({
        field,
        message: `${field} must be at most ${max}`,
        code: ValidationErrorCode.INVALID_VALUE,
      });
    }

    return errors;
  };

// Schema validator
export interface SchemaDefinition {
  [key: string]: Validator<any>[];
}

export const validateObject = <T extends object>(
  obj: T,
  schema: SchemaDefinition,
): ValidationResult => {
  let errors: ValidationError[] = [];

  for (const [field, validators] of Object.entries(schema)) {
    const value = obj[field as keyof T];

    for (const validator of validators) {
      const fieldErrors = validator(value, field);
      errors = [...errors, ...fieldErrors];
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
