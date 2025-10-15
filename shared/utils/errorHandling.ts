/**
 * Shared error handling utilities for async operations.
 *
 * @remarks
 * Provides a unified pattern for error logging, reporting, and state management
 * across frontend and backend code.
 *
 * @example
 *
 * Frontend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), store);
 * ```
 *
 * Backend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), {
 *     logger,
 *     operationName: "operation",
 * });
 * ```
 *
 * @packageDocumentation
 */

/**
 * Options for constructing an {@link ApplicationError} instance.
 */
/**
 * Options for constructing an {@link ApplicationError} instance.
 */
export interface ApplicationErrorOptions {
    /** Underlying error cause. */
    cause?: unknown;
    /** Machine-readable error code for diagnostics. */
    code: string;
    /** Additional structured metadata for debugging. */
    details?: Record<string, unknown>;
    /** Human-readable error message. */
    message: string;
    /** Optional identifier of the operation that failed. */
    operation?: string;
}

/**
 * Application-level error that decorates a cause with operation metadata.
 *
 * @remarks
 * Normalizes the provided cause to ensure consistent error chaining and keeps
 * diagnostic metadata immutable for safe logging.
 *
 * @public
 */
export class ApplicationError extends Error {
    /** Machine-readable error code. */
    public readonly code: string;

    /** Identifier of the operation that produced the error. */
    public readonly operation: string | undefined;

    /** Structured diagnostic metadata. */
    public readonly details: Readonly<Record<string, unknown>> | undefined;

    /** Underlying cause of the error chain. */
    public override readonly cause: unknown;

    public constructor(options: ApplicationErrorOptions) {
        const normalizedCause =
            options.cause instanceof Error
                ? options.cause
                : options.cause === undefined
                  ? undefined
                  : new Error(String(options.cause));

        super(
            options.message,
            normalizedCause ? { cause: normalizedCause } : undefined
        );
        this.name = "ApplicationError";
        this.code = options.code;
        this.operation = options.operation;
        this.details = options.details
            ? Object.freeze({ ...options.details })
            : undefined;
        this.cause = normalizedCause;
    }
}

export interface ErrorHandlingBackendContext {
    logger: {
        error: (msg: string, err: unknown) => void;
    };
    operationName?: string;
}

export interface ErrorHandlingFrontendStore {
    clearError: () => void;
    setError: (err: string | undefined) => void;
    setLoading: (loading: boolean) => void;
}

/**
 * Get the appropriate error message based on the operation name.
 *
 * @param operationName - The operation name (should be string, but defensive)
 *
 * @returns Formatted error message
 */
function getErrorMessage(operationName: unknown): string {
    if (
        operationName &&
        (typeof operationName === "string" || typeof operationName === "number")
    ) {
        // Accept strings and numbers for operation names
        return `Failed to ${operationName}`;
    }
    return "Async operation failed";
}

/**
 * Shared error handling utility for async operations. Provides a unified
 * pattern for error logging, reporting, and state management.
 *
 * @remarks
 * This utility provides two overloaded signatures for different contexts:
 *
 * - Frontend: Integrates with store state management (loading, error states)
 * - Backend: Integrates with logging infrastructure for operation tracking
 *
 * @example Frontend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), store);
 * ```
 *
 * Backend usage:
 *
 * ```typescript
 * await withErrorHandling(() => doSomethingAsync(), {
 *     logger,
 *     operationName: "operation",
 * });
 * ```
 */

/**
 * Safely execute store operations with error logging.
 *
 * @remarks
 * Protects against store operation failures that could interfere with the main
 * operation flow. Uses console logging to avoid dependencies on external
 * loggers in shared utilities. Logs both store operation failures and original
 * error context when provided for comprehensive debugging information.
 *
 * @param storeOperation - Store operation function to execute safely
 * @param operationName - Descriptive name for the operation (used in error
 *   logging)
 * @param originalError - Optional original error context for enhanced debugging
 *
 * @internal
 */
function safeStoreOperation(
    storeOperation: () => void,
    operationName: string,
    originalError?: unknown
): void {
    try {
        storeOperation();
    } catch (error) {
        // Use basic console for shared utilities to avoid dependencies
        // This is acceptable in shared utilities that can't import loggers
        console.warn("Store operation failed for:", operationName, error);
        if (originalError) {
            console.error("Original operation error:", originalError);
        }
    }
}

/**
 * Type-safe error conversion result with enhanced type information.
 */
export interface ErrorConversionResult {
    /** The resulting Error instance */
    error: Error;
    /** The original input type information */
    originalType: string;
    /** Whether the input was already an Error instance */
    wasError: boolean;
}

/**
 * Enhanced error conversion that provides detailed type information.
 *
 * @param error - Unknown error value from catch blocks
 *
 * @returns Detailed error conversion result
 */
export function convertError(error: unknown): ErrorConversionResult {
    if (error instanceof Error) {
        return {
            error,
            originalType: "Error",
            wasError: true,
        };
    }

    // Safely convert to string with fallback for problematic objects
    // eslint-disable-next-line @typescript-eslint/init-declarations -- initialized in try-catch below
    let errorMessage: string;
    try {
        errorMessage = String(error);
    } catch {
        // Fallback for objects that can't be converted to string
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = "[object cannot be converted to string]";
        }
    }

    // Provide fallback for whitespace-only strings (but preserve truly empty strings)
    if (errorMessage.trim().length === 0 && errorMessage.length > 0) {
        errorMessage = `[whitespace-only ${typeof error}]`;
    }

    return {
        error: new Error(errorMessage),
        originalType: typeof error,
        wasError: false,
    };
}

/**
 * Handle backend operations with logger integration.
 *
 * @remarks
 * Logs operation failures with contextual information using the provided
 * logger. Does not modify the original error, ensuring stack traces and error
 * details are preserved for upstream error handling.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param context - Backend context with logger and optional operation name
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after logging
 */
async function handleBackendOperation<T>(
    operation: () => Promise<T>,
    context: ErrorHandlingBackendContext
): Promise<T> {
    // Extract properties safely
    const { logger } = context;
    const { operationName } = context;

    try {
        return await operation();
    } catch (error) {
        const errorMessage = getErrorMessage(operationName);

        // Safely handle logging - fallback to console.error if logger fails
        try {
            logger.error(errorMessage, error);
        } catch (logError) {
            // Fallback to console.error if logger.error throws
            console.error(errorMessage, error);
            console.warn("Logger error during error handling:", logError);
        }

        throw error;
    }
}

/**
 * Handle frontend operations with store state management integration.
 *
 * @remarks
 * Provides comprehensive state management for frontend operations:
 *
 * - Clears error state before operation
 * - Sets loading state during execution
 * - Handles error state on failure
 * - Ensures loading state is always cleared in finally block Uses safe store
 *   operations to prevent state management errors from breaking the operation.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param store - Frontend store with state management methods
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after setting error state
 */
async function handleFrontendOperation<T>(
    operation: () => Promise<T>,
    store: ErrorHandlingFrontendStore
): Promise<T> {
    // Prepare store state
    safeStoreOperation(() => {
        store.clearError();
    }, "clear error state");
    safeStoreOperation(() => {
        store.setLoading(true);
    }, "set loading state");

    try {
        return await operation();
    } catch (error) {
        // Handle operation error by converting to a normalized Error instance.
        const { error: normalizedError } = convertError(error);
        safeStoreOperation(
            () => {
                store.setError(normalizedError.message);
            },
            "set error state",
            error
        );
        throw error;
    } finally {
        // Always clear loading state
        safeStoreOperation(() => {
            store.setLoading(false);
        }, "clear loading state in finally block");
    }
}

/**
 * Handle async operations with frontend store or backend context integration.
 *
 * @remarks
 * - For frontend stores: Automatically manages loading state and error state in
 *   the provided store. Clears error state before operation, sets loading
 *   during execution, and handles error state on failure while preserving the
 *   original error.
 * - For backend contexts: Logs operation failures using the provided logger with
 *   contextual information. Preserves original error for upstream handling
 *   while ensuring proper logging.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute with error handling
 * @param storeOrContext - Either frontend store with error/loading state
 *   management or backend context with logger
 *
 * @returns Promise resolving to operation result
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    storeOrContext: ErrorHandlingBackendContext | ErrorHandlingFrontendStore
): Promise<T>;

/**
 * Implementation of the overloaded withErrorHandling function.
 *
 * @typeParam T - The return type of the async operation
 *
 * @param operation - Async operation to execute
 * @param storeOrContext - Either frontend store or backend context
 *
 * @returns Promise resolving to operation result
 *
 * @throws Re-throws the original error after handling (logging or state
 *   management)
 *
 * @internal
 */
// eslint-disable-next-line no-redeclare -- Function overload implementation is legitimate TypeScript pattern
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    storeOrContext: ErrorHandlingBackendContext | ErrorHandlingFrontendStore
): Promise<T> {
    // Check if it's a frontend store (has setError, clearError, setLoading
    // methods)
    const isFrontendStore =
        typeof storeOrContext === "object" &&
        "setError" in storeOrContext &&
        "clearError" in storeOrContext &&
        "setLoading" in storeOrContext;

    return isFrontendStore
        ? handleFrontendOperation(operation, storeOrContext)
        : handleBackendOperation(operation, storeOrContext);
}

/**
 * Type-safe error conversion result with enhanced type information.
 */
/**
 * Ensures an error object is properly typed and formatted. Converts unknown
 * error types to proper Error instances.
 *
 * @param error - Unknown error value from catch blocks
 *
 * @returns Properly typed Error instance
 */
export function ensureError(error: unknown): Error {
    return convertError(error).error;
}

/**
 * Simple error handling wrapper for utility functions. Provides consistent
 * error logging and error response formatting.
 *
 * @param operation - The async operation to execute
 * @param operationName - Name of the operation for logging
 * @param fallbackValue - Value to return if operation fails when shouldThrow is
 *   false
 * @param shouldThrow - Whether to throw on error or return fallback value
 *
 * @returns Promise resolving to operation result or fallback value
 *
 * @throws When shouldThrow is true, or when shouldThrow is false but no
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

        // Use console logging for shared utilities to avoid dependencies
        console.error(`${operationName} failed`, wrappedError);

        if (shouldThrow) {
            throw wrappedError;
        }

        if (fallbackValue === undefined) {
            throw new Error(
                `${operationName} failed and no fallback value provided. ` +
                    `When shouldThrow is false, you must provide a fallbackValue parameter.`,
                { cause: error }
            );
        }

        return fallbackValue;
    }
}
