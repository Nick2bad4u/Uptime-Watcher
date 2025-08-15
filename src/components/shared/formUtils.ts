/**
 * Shared form utility functions for consistent form behavior
 */

import type React from "react";

// ============================================================================
// Form Utility Functions
// ============================================================================

/**
 * Creates a standardized handler for input changes with validation
 *
 * @example
 *
 * ```tsx
 * const handleNameChange = createInputChangeHandler(
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
export function createInputChangeHandler<T>(
    setValue: (value: T) => void,
    validator?: (value: T) => boolean
): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as T;

        if (!validator || validator(value)) {
            setValue(value);
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
 * @param converter - Optional value converter function
 *
 * @returns Select change handler
 */
export function createSelectChangeHandler<T>(
    setValue: (value: T) => void,
    converter?: (value: string) => T
): (event: React.ChangeEvent<HTMLSelectElement>) => void {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
        const rawValue = event.target.value;
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
