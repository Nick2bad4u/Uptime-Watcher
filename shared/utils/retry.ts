/**
 * Retry utility for handling transient failures.
 *
 * @remarks
 * This module is environment-agnostic (safe for renderer, shared, and main).
 * Logging is intentionally caller-provided.
 */

import { sleep } from "@shared/utils/abortUtils";

const RETRY_NON_ERROR_THROWN_MARKER: unique symbol = Symbol(
    "shared.utils.retry.nonErrorThrown"
);

/**
 * Returns true when the thrown error is a wrapper created by {@link withRetry}
 * for a non-Error thrown value.
 */
export function isRetryNonErrorThrownError(
    value: unknown
): value is Error & { readonly cause: unknown } {
    return (
        value instanceof Error &&
        Reflect.get(value, RETRY_NON_ERROR_THROWN_MARKER) === true
    );
}

function wrapNonErrorThrownValue(value: unknown): Error {
    const error = new Error("[withRetry] Operation threw a non-Error value", {
        cause: value,
    });

    Object.defineProperty(error, RETRY_NON_ERROR_THROWN_MARKER, {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false,
    });

    return error;
}

/**
 * Options controlling retry behavior for {@link withRetry}.
 */
export interface RetryOptions {
    /**
     * Delay between attempts in milliseconds.
     *
     * @defaultValue 300
     */
    delayMs?: number;

    /**
     * Maximum number of attempts (including the first attempt).
     *
     * @defaultValue 5
     */
    maxRetries?: number;

    /**
     * Optional hook invoked after a failed attempt.
     *
     * @remarks
     * Errors thrown by this callback are swallowed to avoid masking the original
     * failure.
     */
    onError?: (error: unknown, attempt: number) => void;

    /** Optional label for debugging/logging by callers. */
    operationName?: string;
}

/**
 * Executes an async operation with retry behavior.
 *
 * @typeParam T - Return type of the operation
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { onError } = options;

    // Treat negative delays as 0 to avoid scheduling oddities.
    const delayMs = Math.max(0, options.delayMs ?? 300);

    // `maxRetries` is the maximum number of attempts (including the first).
    const maxRetries = options.maxRetries ?? 5;
    if (!Number.isFinite(maxRetries) || maxRetries <= 0) {
        throw new Error(
            `[withRetry] maxRetries must be a positive number (received ${String(maxRetries)})`
        );
    }

    const errors: unknown[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop -- retry operations require sequential awaits
            return await operation();
        } catch (error) {
            errors.push(error);

            if (onError) {
                try {
                    onError(error, attempt);
                } catch {
                    // Swallow callback errors: retry logic should not be
                    // interrupted by logging/telemetry failures.
                }
            }

            if (attempt < maxRetries) {
                // eslint-disable-next-line no-await-in-loop -- retry delay requires sequential awaits
                await sleep(delayMs);
            }
        }
    }

    const lastError = errors.at(-1);
    if (lastError === undefined) {
        throw new Error("[withRetry] Operation failed without an error");
    }

    if (lastError instanceof Error) {
        throw lastError;
    }

    throw wrapNonErrorThrownValue(lastError);
}
