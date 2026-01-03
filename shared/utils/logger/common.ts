/**
 * Shared logging helpers used across renderer and main processes.
 *
 * @remarks
 * Centralizes message formatting and error serialization to ensure consistent
 * log output regardless of execution environment.
 */

import { normalizeLogValue } from "../loggingContext";

/**
 * Structured error payload for serialized Error instances.
 *
 * @remarks
 * Used to ensure consistent error logging shape across process boundaries.
 *
 * @param cause - Optional error cause when provided.
 * @param message - Error message for display.
 * @param name - Error name for identification.
 * @param stack - Optional stack trace if available.
 *
 * @returns Serialized error payload.
 *
 * @public
 */
export interface SerializedError {
    [key: string]: unknown;
    [key: symbol]: unknown;
    /** Optional error cause when provided. */
    readonly cause?: unknown;
    /** Error message for display. */
    readonly message: string;
    /** Error name for identification. */
    readonly name?: string;
    /** Optional stack trace if available. */
    readonly stack?: string;
}

function safeNormalizeLogValue(value: unknown): unknown {
    try {
        return normalizeLogValue(value);
    } catch {
        return value;
    }
}

function safeNormalizeLogString(value: string): string {
    const sanitized = safeNormalizeLogValue(value);
    return typeof sanitized === "string" ? sanitized : value;
}

function safeSerializeErrorInternal(error: Error, depth: number): SerializedError {
    const safeSerializeCause = (cause: unknown): unknown => {
        if (cause instanceof Error && depth < 3) {
            return safeNormalizeLogValue(
                safeSerializeErrorInternal(cause, depth + 1)
            );
        }

        return safeNormalizeLogValue(cause);
    };

    return {
        message: safeNormalizeLogString(error.message),
        name: safeNormalizeLogString(error.name),
        ...(error.stack ? { stack: safeNormalizeLogString(error.stack) } : {}),
        ...("cause" in error
            ? {
                  cause: safeSerializeCause((error as { cause?: unknown }).cause),
              }
            : {}),
    } satisfies SerializedError;
}

/**
 * Formats a log message using a standard prefix.
 *
 * @param prefix - Identifier for the log source (e.g., "BACKEND").
 * @param message - Message body to append after the prefix.
 *
 * @returns Formatted log message.
 */
export const formatLogMessage = (prefix: string, message: string): string =>
    `[${prefix}] ${message}`;

/**
 * Serializes unknown error input into a structured payload suitable for
 * logging.
 *
 * @param error - Error instance or arbitrary value passed to a logger.
 *
 * @returns Structured error payload when the value is an Error, otherwise the
 *   original value.
 */
export const serializeError = (error: unknown): null | SerializedError => {
    if (error instanceof Error) {
        return safeSerializeErrorInternal(error, 0) satisfies SerializedError;
    }

    return null;
};

/**
 * Builds structured log arguments for non-error logging methods.
 *
 * @param prefix - Log source prefix.
 * @param message - Log message body.
 * @param args - Additional arguments to append.
 *
 * @returns Array of arguments suitable for log transport invocation.
 */
export const buildLogArguments = (
    prefix: string,
    message: string,
    args: readonly unknown[]
): readonly unknown[] => [formatLogMessage(prefix, message), ...args];

/**
 * Builds structured log arguments for error logging methods.
 *
 * @param prefix - Log source prefix.
 * @param message - Log message body.
 * @param error - Optional error object or context.
 * @param args - Additional arguments to append.
 *
 * @returns Array of arguments suitable for error log transport invocation.
 */
export const buildErrorLogArguments = (
    prefix: string,
    message: string,
    error: unknown,
    args: readonly unknown[]
): readonly unknown[] => {
    const baseMessage = formatLogMessage(prefix, message);

    if (error === undefined) {
        return [baseMessage, ...args];
    }

    const serialized = serializeError(error);

    if (serialized === null) {
        return [
            baseMessage,
            safeNormalizeLogValue(error),
            ...args,
        ];
    }

    return [
        baseMessage,
        safeNormalizeLogValue(serialized),
        ...args,
    ];
};
