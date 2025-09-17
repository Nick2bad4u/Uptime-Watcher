/**
 * Common form validation utilities for reducing duplication across form
 * components.
 *
 * @remarks
 * This module provides standardized validation functions for common form
 * patterns found across the application, including required field validation,
 * string validation, URL validation, and custom validation helpers.
 *
 * @packageDocumentation
 */

import { isValidUrl } from "../validation/validatorUtils";

/**
 * Validates that a string field is not empty after trimming.
 *
 * @remarks
 * Common pattern for required text field validation that appears throughout the
 * application.
 *
 * @param value - The string value to validate
 * @param fieldName - Optional field name for error messages
 *
 * @returns Validation result with success status and optional error message
 */
export function validateRequiredString(
    value: null | string | undefined,
    fieldName = "Field"
): { error?: string; isValid: boolean } {
    if (!value || value.trim().length === 0) {
        return {
            error: `${fieldName} is required`,
            isValid: false,
        };
    }
    return { isValid: true };
}

/**
 * Validates that a field has a non-empty, non-null value.
 *
 * @remarks
 * Generic required field validation that works with any type.
 *
 * @param value - The value to validate
 * @param fieldName - Optional field name for error messages
 *
 * @returns Validation result with success status and optional error message
 */
export function validateRequired(
    value: unknown,
    fieldName = "Field"
): { error?: string; isValid: boolean } {
    if (value === null || value === undefined) {
        return {
            error: `${fieldName} is required`,
            isValid: false,
        };
    }
    return { isValid: true };
}

/**
 * Validates URL format using shared validation utilities.
 *
 * @remarks
 * Standardizes URL validation across form components.
 *
 * @param url - The URL string to validate
 * @param fieldName - Optional field name for error messages
 *
 * @returns Validation result with success status and optional error message
 */
export function validateUrl(
    url: string,
    fieldName = "URL"
): { error?: string; isValid: boolean } {
    if (!url.trim()) {
        return {
            error: `${fieldName} is required`,
            isValid: false,
        };
    }

    if (!isValidUrl(url)) {
        return {
            error: `${fieldName} must be a valid URL`,
            isValid: false,
        };
    }

    return { isValid: true };
}

/**
 * Validates port number format and range.
 *
 * @remarks
 * Common validation for port fields in monitoring forms.
 *
 * @param port - The port value to validate (string or number)
 * @param fieldName - Optional field name for error messages
 *
 * @returns Validation result with success status and optional error message
 */
export function validatePort(
    port: number | string,
    fieldName = "Port"
): { error?: string; isValid: boolean } {
    const portStr = String(port).trim();

    if (!portStr) {
        return {
            error: `${fieldName} is required`,
            isValid: false,
        };
    }

    const portNum = Number.parseInt(portStr, 10);

    if (Number.isNaN(portNum)) {
        return {
            error: `${fieldName} must be a number`,
            isValid: false,
        };
    }

    if (portNum < 1 || portNum > 65_535) {
        return {
            error: `${fieldName} must be between 1 and 65535`,
            isValid: false,
        };
    }

    return { isValid: true };
}

/**
 * Validates timeout value for monitor configuration.
 *
 * @remarks
 * Standardizes timeout validation across monitoring forms.
 *
 * @param timeout - The timeout value to validate (in seconds)
 * @param fieldName - Optional field name for error messages
 * @param minSeconds - Minimum allowed timeout (default: 1)
 * @param maxSeconds - Maximum allowed timeout (default: 300)
 *
 * @returns Validation result with success status and optional error message
 */
export function validateTimeout(
    timeout: number | string,
    fieldName = "Timeout",
    minSeconds = 1,
    maxSeconds = 300
): { error?: string; isValid: boolean } {
    const timeoutNum =
        typeof timeout === "string" ? Number.parseFloat(timeout) : timeout;

    if (Number.isNaN(timeoutNum)) {
        return {
            error: `${fieldName} must be a valid number`,
            isValid: false,
        };
    }

    if (timeoutNum < minSeconds) {
        return {
            error: `${fieldName} must be at least ${minSeconds} second${minSeconds === 1 ? "" : "s"}`,
            isValid: false,
        };
    }

    if (timeoutNum > maxSeconds) {
        return {
            error: `${fieldName} must be no more than ${maxSeconds} seconds`,
            isValid: false,
        };
    }

    return { isValid: true };
}

/**
 * Validates a collection of form fields and returns all validation errors.
 *
 * @remarks
 * Utility for batch validation of multiple fields in a form.
 *
 * @param validations - Array of validation functions to execute
 *
 * @returns Array of validation error messages (empty if all valid)
 */
export function validateFormFields(
    validations: Array<() => { error?: string; isValid: boolean }>
): string[] {
    const errors: string[] = [];

    for (const validation of validations) {
        const result = validation();
        if (!result.isValid && result.error) {
            errors.push(result.error);
        }
    }

    return errors;
}

/**
 * Helper to check if a string is empty after trimming.
 *
 * @remarks
 * Common pattern used throughout validation logic.
 *
 * @param value - The string to check
 *
 * @returns True if the string is empty or only whitespace
 */
export function isEmptyString(value: null | string | undefined): boolean {
    return !value || value.trim().length === 0;
}

/**
 * Validates that a field matches a specific pattern (regex).
 *
 * @remarks
 * Generic pattern validation utility for custom validation rules.
 *
 * @param value - The value to validate
 * @param pattern - The regex pattern to match against
 * @param fieldName - Optional field name for error messages
 * @param patternDescription - Human-readable description of the pattern
 *
 * @returns Validation result with success status and optional error message
 */
export function validatePattern(
    value: string,
    pattern: RegExp,
    fieldName = "Field",
    patternDescription = "the required format"
): { error?: string; isValid: boolean } {
    if (!value.trim()) {
        return {
            error: `${fieldName} is required`,
            isValid: false,
        };
    }

    if (!pattern.test(value)) {
        return {
            error: `${fieldName} must match ${patternDescription}`,
            isValid: false,
        };
    }

    return { isValid: true };
}
