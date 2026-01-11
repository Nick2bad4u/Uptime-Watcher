/**
 * Retry utility for handling transient failures in database and network
 * operations.
 *
 * @remarks
 * Provides configurable retry logic with a fixed delay between attempts for robust error
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

import { sleep } from "@shared/utils/abortUtils";

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
    const operationName = options.operationName ?? "operation";
    const {onError} = options;

    // Treat negative delays as 0 to avoid scheduling oddities.
    const delayMs = Math.max(0, options.delayMs ?? 300);

    // `maxRetries` is actually the maximum number of attempts (including the
    // first attempt). A value <= 0 would otherwise result in a silent
    // `throw undefined` and makes the retry contract nonsensical.
    const maxRetries = options.maxRetries ?? 5;
    if (!Number.isFinite(maxRetries) || maxRetries <= 0) {
        throw new Error(
            `[withRetry] maxRetries must be a positive number (received ${String(maxRetries)})`
        );
    }

    const errors: unknown[] = [];

    for (const attempt of Array.from({ length: maxRetries }, (_, i) => i)) {
        try {
            // eslint-disable-next-line no-await-in-loop -- retry operations require sequential awaits
            return await operation();
        } catch (error) {
            errors.push(error);

            if (onError) {
                try {
                    onError(error, attempt + 1);
                } catch (callbackError) {
                    dbLogger.error(
                        `${operationName} onError callback threw (attempt ${attempt + 1}/${maxRetries})`,
                        callbackError
                    );
                }
            } else {
                dbLogger.error(
                    `${operationName} failed (attempt ${attempt + 1}/${maxRetries})`,
                    error
                );
            }

            if (attempt < maxRetries - 1) {
                // eslint-disable-next-line no-await-in-loop -- retry delay requires sequential awaits
                await sleep(delayMs);
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
