/**
 * Utility-specific error handling wrapper for frontend utilities. Provides
 * consistent error handling for utility functions that don't need store
 * management.
 */

import logger from "../services/logger";

/**
 * Ensures an error object is properly typed and formatted. Converts unknown
 * error types to proper Error instances.
 *
 * @param error - Unknown error value from catch blocks
 *
 * @returns Properly typed Error instance
 */
export function ensureError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
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
