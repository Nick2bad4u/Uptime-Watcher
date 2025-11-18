/**
 * Shared logging helpers used across renderer and main processes.
 *
 * @remarks
 * Centralizes message formatting and error serialization to ensure consistent
 * log output regardless of execution environment.
 */

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
    /** Optional error cause when provided. */
    readonly cause?: unknown;
    /** Error message for display. */
    readonly message: string;
    /** Error name for identification. */
    readonly name?: string;
    /** Optional stack trace if available. */
    readonly stack?: string;
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
        return {
            message: error.message,
            name: error.name,
            ...(error.stack ? { stack: error.stack } : {}),
            ...("cause" in error
                ? { cause: (error as { cause?: unknown }).cause }
                : {}),
        } satisfies SerializedError;
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
            error,
            ...args,
        ];
    }

    return [
        baseMessage,
        serialized,
        ...args,
    ];
};
