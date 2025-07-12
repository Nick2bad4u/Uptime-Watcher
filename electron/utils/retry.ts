/**
 * Retry utility for handling transient failures in database and network operations.
 * Provides configurable retry logic with exponential backoff for robust error handling.
 */

import { dbLogger } from "./logger";

/**
 * Generic retry utility with configurable parameters
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the operation result
 * @throws Error if all retry attempts fail
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        delayMs?: number;
        maxRetries?: number;
        onError?: (error: unknown, attempt: number) => void;
        operationName?: string;
    } = {}
): Promise<T> {
    const { delayMs = 300, maxRetries = 5, onError, operationName = "operation" } = options;

    const errors: unknown[] = [];

    for (const attempt of Array.from({ length: maxRetries }, (_, i) => i)) {
        try {
            return await operation();
        } catch (error) {
            errors.push(error);

            if (onError) {
                onError(error, attempt + 1);
            } else {
                dbLogger.error(`${operationName} failed (attempt ${attempt + 1}/${maxRetries})`, error);
            }

            if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }

    const lastError = errors.at(-1);
    dbLogger.error(`Persistent failure after ${maxRetries} retries for ${operationName}`, lastError);
    throw lastError;
}

/**
 * Database-specific retry wrapper with optimized settings for database operations.
 *
 * @param operation - Database operation to retry
 * @param operationName - Name of the operation for logging
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @returns Promise that resolves with the operation result
 */
export async function withDbRetry<T>(operation: () => Promise<T>, operationName: string, maxRetries = 5): Promise<T> {
    return withRetry(operation, {
        delayMs: 300,
        maxRetries,
        operationName,
    });
}
