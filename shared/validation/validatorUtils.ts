/**
 * Shared validation utilities using the validator package.
 *
 * @remarks
 * This module provides validation functions that can be used by both
 * frontend and backend to ensure consistent validation behavior.
 * Uses the well-tested validator.js package for reliable validation.
 *
 * The functions in this module replace manual validation patterns throughout
 * the codebase, providing consistent validation behavior and better security.
 *
 * @example
 * ```typescript
 * // Replace manual string validation
 * // Old: typeof value === "string" && value.trim().length > 0
 * // New: isNonEmptyString(value)
 *
 * // Replace manual URL validation
 * // Old: /^https?:\/\//.test(url)
 * // New: isValidUrl(url)
 *
 * // Replace manual array validation
 * // Old: Array.isArray(arr) && arr.every(item => typeof item === "string")
 * // New: isValidIdentifierArray(arr)
 * ```
 *
 * @see {@link https://github.com/validatorjs/validator.js} - Validator.js documentation
 *
 * @public
 */

import validator from "validator";

/**
 * Validates that a value is a non-empty string.
 *
 * @param value - Value to validate
 * @returns True if value is a non-empty string
 *
 * @example
 * ```typescript
 * isNonEmptyString("hello") // true
 * isNonEmptyString("") // false
 * isNonEmptyString(null) // false
 * ```
 *
 * @public
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && !validator.isEmpty(value.trim());
}

/**
 * Validates that a value is a valid FQDN (Fully Qualified Domain Name).
 *
 * @param value - Value to validate
 * @param options - FQDN validation options
 * @returns True if value is a valid FQDN
 *
 * @example
 * ```typescript
 * isValidFQDN("example.com") // true
 * isValidFQDN("localhost") // false (no TLD by default)
 * ```
 *
 * @public
 */
export function isValidFQDN(value: unknown, options?: Parameters<typeof validator.isFQDN>[1]): value is string {
    return typeof value === "string" && validator.isFQDN(value, options);
}

/**
 * Validates that a value is a valid identifier (alphanumeric with hyphens/underscores).
 *
 * @param value - Value to validate
 * @returns True if value is a valid identifier
 *
 * @example
 * ```typescript
 * isValidIdentifier("abc123") // true
 * isValidIdentifier("abc-123_def") // true
 * isValidIdentifier("abc@123") // false
 * ```
 *
 * @public
 */
export function isValidIdentifier(value: unknown): value is string {
    if (typeof value !== "string" || validator.isEmpty(value.trim())) {
        return false;
    }

    // Allow alphanumeric characters, hyphens, and underscores
    return validator.isAlphanumeric(value.replaceAll(/[_-]/g, ""));
}

/**
 * Validates that an array contains only valid string identifiers.
 *
 * @param value - Array to validate
 * @returns True if array contains only valid identifiers
 *
 * @example
 * ```typescript
 * isValidIdentifierArray(["abc", "def-123"]) // true
 * isValidIdentifierArray(["abc", 123]) // false
 * isValidIdentifierArray(["abc", ""]) // false
 * ```
 *
 * @public
 */
export function isValidIdentifierArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((item) => isValidIdentifier(item));
}

/**
 * Validates that a value is a valid integer within optional bounds.
 *
 * @param value - Value to validate
 * @param options - Integer validation options
 * @returns True if value is a valid integer
 *
 * @example
 * ```typescript
 * isValidInteger("123") // true
 * isValidInteger("123.45") // false
 * isValidInteger("123", { min: 100, max: 200 }) // true
 * ```
 *
 * @public
 */
export function isValidInteger(value: unknown, options?: Parameters<typeof validator.isInt>[1]): value is string {
    return typeof value === "string" && validator.isInt(value, options);
}

/**
 * Validates that a value is a valid numeric string within optional bounds.
 *
 * @param value - Value to validate
 * @param options - Numeric validation options
 * @returns True if value is a valid number
 *
 * @example
 * ```typescript
 * isValidNumeric("123.45") // true
 * isValidNumeric("abc") // false
 * ```
 *
 * @public
 */
export function isValidNumeric(value: unknown, options?: Parameters<typeof validator.isFloat>[1]): value is string {
    return typeof value === "string" && validator.isFloat(value, options);
}

/**
 * Validates that a value is a valid URL.
 *
 * @param value - Value to validate
 * @param options - URL validation options
 * @returns True if value is a valid URL
 *
 * @example
 * ```typescript
 * isValidUrl("https://example.com") // true
 * isValidUrl("not-a-url") // false
 * ```
 *
 * @public
 */
export function isValidUrl(value: unknown, options?: Parameters<typeof validator.isURL>[1]): value is string {
    return typeof value === "string" && validator.isURL(value, options);
}

/**
 * Safely converts a value to a positive integer with bounds checking.
 *
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Converted integer or default value
 *
 * @example
 * ```typescript
 * safeInteger("123", 0, 1, 1000) // 123
 * safeInteger("abc", 0, 1, 1000) // 0
 * safeInteger("2000", 0, 1, 1000) // 1000 (clamped)
 * ```
 *
 * @public
 */
export function safeInteger(value: unknown, defaultValue: number, min?: number, max?: number): number {
    const str = String(value);

    if (!isValidInteger(str)) {
        return defaultValue;
    }

    let num = Number.parseInt(str, 10);

    if (min !== undefined && num < min) {
        num = min;
    }

    if (max !== undefined && num > max) {
        num = max;
    }

    return num;
}
