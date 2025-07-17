/**
 * Utility-specific error handling wrapper for frontend utilities.
 * Provides consistent error handling for utility functions that don't need store management.
 */

import { logger } from "../services";

/**
 * Simple error handling wrapper for utility functions.
 * Provides consistent error logging and error response formatting.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @param fallbackValue - Value to return if operation fails
 * @returns Promise resolving to operation result or fallback value
 */
export async function withUtilityErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue: T
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        logger.error(`${operationName} failed`, error instanceof Error ? error : new Error(String(error)));
        return fallbackValue;
    }
}

/**
 * Error handling wrapper for utility functions that should throw on error.
 * Provides consistent error logging while preserving the error for caller handling.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @returns Promise resolving to operation result
 * @throws The original error after logging
 */
export async function withUtilityErrorHandlingThrow<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const wrappedError = error instanceof Error ? error : new Error(String(error));
        logger.error(`${operationName} failed`, wrappedError);
        throw wrappedError;
    }
}
