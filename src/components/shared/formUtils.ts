/**
 * Shared form utility functions and validation patterns for consistent form
 * behavior across components.
 *
 * @remarks
 * This module provides standardized form handling utilities, input change
 * handlers, validation patterns, and common form operations. It ensures
 * consistent behavior and reduces code duplication across form components in
 * the application.
 *
 * Key features:
 *
 * - Input change handler creators with optional validation
 * - Select change handler creators with type conversion
 * - Common validation patterns for URLs, ports, and text fields
 * - Standardized form event handling patterns
 *
 * @example
 *
 * ```tsx
 * import { createInputChangeHandler, validationPatterns } from './formUtils';
 *
 * function MyForm() {
 *   const [url, setUrl] = useState('');
 *   const handleUrlChange = createInputChangeHandler(setUrl);
 *
 *   return (
 *     <input
 *       pattern={validationPatterns.url}
 *       onChange={handleUrlChange}
 *       value={url}
 *     />
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

import type React from "react";

// ============================================================================
// Form Utility Functions
// ============================================================================

/**
 * Creates a standardized handler for string input changes with validation
 *
 * @example
 *
 * ```tsx
 * const handleNameChange = createStringInputHandler(
 *     setName,
 *     (value) => value.length > 0
 * );
 * ```
 *
 * @param setValue - State setter function
 * @param validator - Optional validation function
 *
 * @returns Input change handler
 */
export function createStringInputHandler(
    setValue: (value: string) => void,
    validator?: (value: string) => boolean
): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (!validator || validator(value)) {
            setValue(value);
        }
    };
}

/**
 * Creates a standardized handler for input changes with type conversion
 *
 * @example
 *
 * ```tsx
 * const handleAgeChange = createTypedInputHandler(
 *     setAge,
 *     (value) => parseInt(value, 10),
 *     (age) => age >= 0
 * );
 * ```
 *
 * @param setValue - State setter function
 * @param converter - Function to convert string to target type
 * @param validator - Optional validation function
 *
 * @returns Input change handler
 */
export function createTypedInputHandler<T>(
    setValue: (value: T) => void,
    converter: (value: string) => T,
    validator?: (value: T) => boolean
): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const stringValue = event.target.value;
        const convertedValue = converter(stringValue);

        if (!validator || validator(convertedValue)) {
            setValue(convertedValue);
        }
    };
}

/**
 * Creates a standardized handler for select changes
 *
 * @example
 *
 * ```tsx
 * const handleTimeoutChange = createSelectChangeHandler(
 *     setTimeout,
 *     (value) => parseInt(value, 10)
 * );
 * ```
 *
 * @param setValue - State setter function
 * @param converter - Optional value converter function (defaults to identity)
 *
 * @returns Select change handler
 */
export function createSelectChangeHandler<T = string>(
    setValue: (value: T) => void,
    converter?: (value: string) => T
): (event: React.ChangeEvent<HTMLSelectElement>) => void {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
        const rawValue = event.target.value;

        // If no converter provided, assume T is string and use identity
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const finalValue = converter ? converter(rawValue) : (rawValue as T);
        setValue(finalValue);
    };
}

/**
 * Creates a standardized handler for checkbox changes
 *
 * @example
 *
 * ```tsx
 * const handleNotificationsChange =
 *     createCheckboxChangeHandler(setNotifications);
 * ```
 *
 * @param setValue - State setter function
 *
 * @returns Checkbox change handler
 */
export function createCheckboxChangeHandler(
    setValue: (value: boolean) => void
): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.checked);
    };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Common validation patterns for form fields
 */
export const validationPatterns = {
    /**
     * Validates that a string is not empty after trimming
     */
    nonEmptyString: (value: string): boolean => value.trim().length > 0,

    /**
     * Validates that a number is within a specified range
     */
    numberInRange:
        (min: number, max: number): ((value: number) => boolean) =>
        (value: number): boolean =>
            value >= min && value <= max,

    /**
     * Validates that a value is one of the allowed numbers
     */
    oneOfNumbers:
        (allowedValues: number[]): ((value: number) => boolean) =>
        (value: number): boolean =>
            allowedValues.includes(value),

    /**
     * Validates that a value is one of the allowed options
     */
    oneOfStrings:
        (allowedValues: string[]): ((value: string) => boolean) =>
        (value: string): boolean =>
            allowedValues.includes(value),
} as const;

// ============================================================================
// Backward Compatibility Functions
// ============================================================================

/**
 * Legacy function for backward compatibility with existing tests and
 * components. Creates a standardized input change handler for strings.
 *
 * @deprecated Use createStringInputHandler or createTypedInputHandler instead
 *
 * @param setValue - State setter function
 * @param validator - Optional validation function
 *
 * @returns Input change handler
 */
export function createInputChangeHandler<T = string>(
    setValue: (value: T) => void,
    validator?: (value: T) => boolean
): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        // For string types (default), pass the value directly
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const finalValue = value as T;

        if (!validator || validator(finalValue)) {
            setValue(finalValue);
        }
    };
}
