/**
 * Utility-specific error handling wrapper for frontend utilities.
 * Provides consistent error handling for utility functions that don't need store management.
 */

import logger from "../services/logger";

/**
 * Simple error handling wrapper for utility functions.
 * Provides consistent error logging and error response formatting.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @param fallbackValue - Value to return if operation fails (required if shouldThrow is false)
 * @param shouldThrow - Whether to throw on error or return fallback value
 * @returns Promise resolving to operation result or fallback value
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
        const wrappedError = error instanceof Error ? error : new Error(String(error));
        logger.error(`${operationName} failed`, wrappedError);

        if (shouldThrow) {
            throw wrappedError;
        }

        if (fallbackValue === undefined) {
            throw new Error(`${operationName} failed and no fallback value provided`);
        }

        return fallbackValue;
    }
}

/**
 * @deprecated Use withUtilityErrorHandling with shouldThrow=true instead
 * Error handling wrapper for utility functions that should throw on error.
 * Provides consistent error logging while preserving the error for caller handling.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @returns Promise resolving to operation result
 * @throws The original error after logging
 */
export async function withUtilityErrorHandlingThrow<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    return withUtilityErrorHandling(operation, operationName, undefined, true);
}
