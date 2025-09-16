/**
 * Frontend utility error handling helpers.
 *
 * @remarks
 * This module provides utility error handling functions for frontend use cases.
 */

/**
 * Convert unknown error to Error instance.
 *
 * @param error - Unknown error value
 *
 * @returns Error instance
 */
export function convertError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
}

/**
 * Ensure unknown value is an Error instance.
 *
 * @param error - Unknown error value
 *
 * @returns Error instance
 */
export function ensureError(error: unknown): Error {
    return convertError(error);
}

/**
 * Utility error handling wrapper for frontend operations.
 *
 * @param operation - Async operation to execute
 * @param operationName - Name of the operation for logging
 * @param fallbackValue - Optional fallback value on error
 * @param shouldThrow - Whether to throw on error
 *
 * @returns Promise resolving to operation result or fallback
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

        // Use console logging for utilities to avoid logger dependencies
        console.error(`${operationName} failed`, wrappedError);

        if (shouldThrow) {
            throw wrappedError;
        }

        if (fallbackValue === undefined) {
            throw new Error(
                `${operationName} failed and no fallback value provided`,
                { cause: error }
            );
        }

        return fallbackValue;
    }
}
