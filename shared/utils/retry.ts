/**
 * Retry utility for handling transient failures.
 *
 * @remarks
 * This module is environment-agnostic (safe for renderer, shared, and main).
 * Logging is intentionally caller-provided.
 */

import { sleep, sleepUnref } from "@shared/utils/abortUtils";

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
     * @remarks
     * Can be a constant or a function for exponential backoff / jitter.
     *
     * @defaultValue 300
     */
    delayMs?:
        | ((args: { readonly attempt: number; readonly error: unknown }) => number)
        | number;

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
     * Errors thrown by this callback are swallowed to avoid masking the
     * original failure.
     */
    onError?: (error: unknown, attempt: number) => void;

    /**
     * Optional hook invoked after a failed attempt and after the delay for the
     * next attempt is computed.
     */
    onFailedAttempt?: (args: {
        readonly attempt: number;
        readonly delayMs: number;
        readonly error: unknown;
    }) => void;

    /** Optional label for debugging/logging by callers. */
    operationName?: string;

    /**
     * Optional predicate to stop retrying for specific errors.
     *
     * @remarks
     * Returning false stops retrying and rethrows the most recent error.
     */
    shouldRetry?: (error: unknown, attempt: number) => boolean;

    /**
     * When true, uses an unref'd timer for the delay between retries so the
     * process can exit naturally.
     */
    unrefDelay?: boolean;
}

function resolveDelayMs(args: {
    readonly attempt: number;
    readonly delay:
        | ((args: { readonly attempt: number; readonly error: unknown }) => number)
        | number;
    readonly error: unknown;
}): number {
    const value =
        typeof args.delay === "function"
            ? args.delay({ attempt: args.attempt, error: args.error })
            : args.delay;

    if (!Number.isFinite(value) || value <= 0) {
        return 0;
    }

    return value;
}

function raiseNonRetryableRetryError(error: unknown): never {
    if (error instanceof Error) {
        throw error;
    }

    throw wrapNonErrorThrownValue(error);
}

function shouldRetrySafely(
    predicate: RetryOptions["shouldRetry"] | undefined,
    error: unknown,
    attempt: number
): boolean {
    if (!predicate) {
        return true;
    }

    try {
        return predicate(error, attempt);
    } catch {
        // Swallow callback errors: retry logic should not be interrupted by
        // logging/telemetry failures.
        return true;
    }
}

function callOnErrorHook(
    onError: RetryOptions["onError"] | undefined,
    error: unknown,
    attempt: number
): void {
    if (!onError) {
        return;
    }

    try {
        onError(error, attempt);
    } catch {
        // Swallow callback errors: retry logic should not be interrupted by
        // logging/telemetry failures.
    }
}

function callOnFailedAttemptHook(
    onFailedAttempt: RetryOptions["onFailedAttempt"] | undefined,
    args: {
        readonly attempt: number;
        readonly delayMs: number;
        readonly error: unknown;
    }
): void {
    if (!onFailedAttempt) {
        return;
    }

    try {
        onFailedAttempt(args);
    } catch {
        // Swallow callback errors: retry logic should not be interrupted by
        // logging/telemetry failures.
    }
}

async function waitBeforeRetry(args: {
    readonly attempt: number;
    readonly computedDelayMs: number;
    readonly error: unknown;
    readonly onFailedAttempt: RetryOptions["onFailedAttempt"] | undefined;
    readonly unrefDelay: boolean;
}): Promise<void> {
    callOnFailedAttemptHook(args.onFailedAttempt, {
        attempt: args.attempt,
        delayMs: args.computedDelayMs,
        error: args.error,
    });

    await (args.unrefDelay ? sleepUnref : sleep)(args.computedDelayMs);
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
    const {
        delayMs: delayConfig = 300,
        onError,
        onFailedAttempt,
        shouldRetry,
        unrefDelay = false,
    } = options;

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

            callOnErrorHook(onError, error, attempt);

            if (attempt < maxRetries) {
                if (!shouldRetrySafely(shouldRetry, error, attempt)) {
                    raiseNonRetryableRetryError(error);
                }

                const computedDelayMs = resolveDelayMs({
                    attempt,
                    delay: delayConfig,
                    error,
                });

                // eslint-disable-next-line no-await-in-loop -- retry delay requires sequential awaits
                await waitBeforeRetry({
                    attempt,
                    computedDelayMs,
                    error,
                    onFailedAttempt,
                    unrefDelay,
                });
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
