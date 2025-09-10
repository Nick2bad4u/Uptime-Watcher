/**
 * Retry utility for handling transient failures in database and network
 * operations.
 *
 * @remarks
 * Provides configurable retry logic with exponential backoff for robust error
 * handling in backend operations. Useful for dealing with temporary network
 * issues, database locks, or other transient failures.
 *
 * @example
 *
 * ```typescript
 * // Simple retry with defaults
 * const result = await withRetry(() => fetchData());
 *
 * // Retry with custom configuration
 * const result = await withRetry(() => database.query(sql), {
 *     maxRetries: 3,
 *     delayMs: 1000,
 *     operationName: "database query",
 *     onError: (error, attempt) =>
 *         logger.warn(`Attempt ${attempt} failed`),
 * });
 * ```
 *
 * @packageDocumentation
 */

import { dbLogger } from "./logger";

/**
 * Generic retry utility with configurable parameters.
 *
 * @remarks
 * Executes the provided operation with automatic retry logic on failure. Uses a
 * simple delay between retries (not exponential backoff) for predictable
 * timing. Collects all errors and reports them if all retries fail.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 *
 * @returns Promise that resolves with the operation result
 *
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
    const {
        delayMs = 300,
        maxRetries = 5,
        onError,
        operationName = "operation",
    } = options;

    const errors: unknown[] = [];

    for (const attempt of Array.from({ length: maxRetries }, (_, i) => i)) {
        try {
            // eslint-disable-next-line no-await-in-loop -- retry operations require sequential awaits
            return await operation();
        } catch (error) {
            errors.push(error);

            if (onError) {
                onError(error, attempt + 1);
            } else {
                dbLogger.error(
                    `${operationName} failed (attempt ${attempt + 1}/${maxRetries})`,
                    error
                );
            }

            if (attempt < maxRetries - 1) {
                // eslint-disable-next-line no-await-in-loop -- retry delay requires sequential awaits
                await new Promise<void>((resolve) => {
                    // eslint-disable-next-line clean-timer/assign-timer-id -- Timer completes with Promise resolution
                    setTimeout(() => {
                        resolve();
                    }, delayMs);
                });
            }
        }
    }

    const lastError = errors.at(-1);
    dbLogger.error(
        `Persistent failure after ${maxRetries} retries for ${operationName}`,
        lastError
    );
    throw lastError;
}

/**
 * Database-specific retry wrapper with optimized settings for database
 * operations.
 *
 * @typeParam T - The return type of the database operation
 *
 * @param operation - Database operation to retry
 * @param operationName - Name of the operation for logging
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 *
 * @returns Promise that resolves with the operation result
 */
export async function withDbRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 5
): Promise<T> {
    return withRetry(operation, {
        delayMs: 300,
        maxRetries,
        operationName,
    });
}
