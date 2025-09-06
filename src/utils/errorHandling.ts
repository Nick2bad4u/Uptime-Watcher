/**
 * Utility-specific error handling wrapper for frontend utilities.
 *
 * @remarks
 * Provides consistent error handling for utility functions that don't need
 * store management. Focused on pure utility error handling patterns.
 */

import type { Simplify } from "type-fest";

import { logger } from "../services/logger";

/**
 * Type-safe error conversion result with enhanced type information.
 */
type ErrorConversionResult = Simplify<{
    /** The resulting Error instance */
    error: Error;
    /** The original input type information */
    originalType: string;
    /** Whether the input was already an Error instance */
    wasError: boolean;
}>;

/**
 * Enhanced error conversion that provides detailed type information.
 *
 * @param error - Unknown error value from catch blocks
 *
 * @returns Detailed error conversion result
 */
export function convertError(error: unknown): ErrorConversionResult {
    if (error instanceof Error) {
        return {
            error,
            originalType: "Error",
            wasError: true,
        };
    }

    // Safely convert to string with fallback for problematic objects
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let errorMessage: string;
    try {
        errorMessage = String(error);
    } catch {
        // Fallback for objects that can't be converted to string
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = "[object cannot be converted to string]";
        }
    }

    return {
        error: new Error(errorMessage),
        originalType: typeof error,
        wasError: false,
    };
}

/**
 * Ensures an error object is properly typed and formatted. Converts unknown
 * error types to proper Error instances.
 *
 * @param error - Unknown error value from catch blocks
 *
 * @returns Properly typed Error instance
 */
export function ensureError(error: unknown): Error {
    return convertError(error).error;
}

/**
 * Simple error handling wrapper for utility functions. Provides consistent
 * error logging and error response formatting.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @param fallbackValue - Value to return if operation fails (required if
 *   shouldThrow is false)
 * @param shouldThrow - Whether to throw on error or return fallback value
 *
 * @returns Promise resolving to operation result or fallback value
 *
 * @throws When shouldThrow is true or when shouldThrow is false but no
 *   fallbackValue is provided
 */
export async function withUtilityErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T,
    shouldThrow = false
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const wrappedError = ensureError(error);
        logger.error(`${operationName} failed`, wrappedError);

        if (shouldThrow) {
            throw wrappedError;
        }

        if (fallbackValue === undefined) {
            throw new Error(
                `${operationName} failed and no fallback value provided`
            );
        }

        return fallbackValue;
    }
}
