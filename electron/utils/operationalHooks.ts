/**
 * Operational hooks utility for standardizing error handling, retries, and
 * event emission across the Electron backend.
 *
 * @remarks
 * Provides consistent patterns for async operations with observability, retry
 * logic, and event-driven architecture support. This utility standardizes how
 * backend operations handle failures, emit events, and provide monitoring
 * visibility across the application.
 *
 * Key features:
 *
 * - Consistent error handling patterns for all backend operations
 * - Configurable retry logic with exponential/linear backoff strategies
 * - Automatic event emission for operation lifecycle tracking
 * - Performance monitoring and observability hooks
 * - Standardized logging with operation context
 * - Type-safe operation contracts and event payloads
 *
 * @example Basic operation with hooks:
 *
 * ```typescript
 * import { withHooks } from "./operationalHooks";
 * import { eventBus } from "../events/TypedEventBus";
 *
 * const result = await withHooks(
 *     async () => await database.createSite(siteData),
 *     {
 *         operationName: "createSite",
 *         maxRetries: 3,
 *         backoff: "exponential",
 *         eventBus,
 *         context: { userId: "123", siteUrl: "example.com" },
 *     }
 * );
 * ```
 *
 * @example Custom error handling:
 *
 * ```typescript
 * const config: OperationalHooksConfig = {
 *     operationName: "updateMonitorStatus",
 *     onError: (error, attempt, config) => {
 *         logger.warn(
 *             `Attempt ${attempt} failed for ${config.operationName}`,
 *             error
 *         );
 *         return attempt < 2; // Only retry first 2 failures
 *     },
 *     onSuccess: (result, config) => {
 *         logger.info(
 *             `Operation ${config.operationName} completed successfully`
 *         );
 *     },
 * };
 * ```
 *
 * @packageDocumentation
 */

import type { Tagged, UnknownRecord } from "type-fest";

import { sleep } from "@shared/utils/abortUtils";
import { ensureError } from "@shared/utils/errorHandling";
import * as z from "zod";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";

import { logger } from "./logger";

type OperationalLogLevel = "debug" | "error" | "info" | "warn";

type OperationalHookContextTag = "OperationalHookContext";

/**
 * Frozen metadata attached to operational hook lifecycle events.
 */
export type OperationalHookContext = Tagged<
    Readonly<UnknownRecord>,
    OperationalHookContextTag
>;

/**
 * Strongly typed identifier used to correlate long-running backend operations.
 */
type OperationId = Tagged<string, "operation-id">;

const operationIdSchema = z.custom<OperationId>(
    (value): value is OperationId =>
        typeof value === "string" &&
        value.startsWith("op_") &&
        value.length > 3,
    {
        message: "Operation ID must be a non-empty string starting with 'op_'",
    }
);

/**
 * Author-supplied context accepted by operational hooks before normalization.
 */
export type OperationalHookContextInput =
    | OperationalHookContext
    | Readonly<UnknownRecord>;

const isOperationalHookContext = (
    candidate: unknown
): candidate is OperationalHookContext =>
    typeof candidate === "object" &&
    candidate !== null &&
    !Array.isArray(candidate) &&
    Object.isFrozen(candidate);

const freezeOperationalContext = (
    context: Readonly<UnknownRecord>
): OperationalHookContext => {
    const frozen = Object.freeze({ ...context });
    if (!isOperationalHookContext(frozen)) {
        throw new Error("Failed to normalize operational hook context");
    }

    return frozen;
};

const EMPTY_OPERATIONAL_CONTEXT: OperationalHookContext =
    ((): OperationalHookContext => {
        const frozen = Object.freeze({});
        if (!isOperationalHookContext(frozen)) {
            throw new Error(
                "Failed to initialize operational hook context store"
            );
        }
        return frozen;
    })();

const normalizeOperationalContext = (
    context?: OperationalHookContextInput
): OperationalHookContext => {
    if (!context) {
        return EMPTY_OPERATIONAL_CONTEXT;
    }

    if (isOperationalHookContext(context)) {
        return context;
    }

    return freezeOperationalContext(context);
};

export const createOperationalHookContext = (
    context?: OperationalHookContextInput
): OperationalHookContext => normalizeOperationalContext(context);

/**
 * Configuration for operational hooks.
 */
export interface OperationalHooksConfig<T = unknown> {
    /**
     * Backoff strategy for retry delays.
     *
     * @defaultValue "exponential"
     */
    backoff?: "exponential" | "linear";

    /**
     * Context data to include in events.
     */
    context?: OperationalHookContextInput;

    /**
     * Whether to emit events for this operation.
     *
     * @defaultValue true
     */
    emitEvents?: boolean;

    /**
     * Event emitter for operation events.
     */
    eventEmitter?: TypedEventBus<UptimeEvents>;

    /**
     * Customize the log level used when the operation fails permanently.
     *
     * @remarks
     * Accepts either a static level or a callback that derives the level from
     * the caught error context. Invalid values fall back to the default
     * setting.
     *
     * @defaultValue "error"
     */
    failureLogLevel?:
        | ((
              error: Error,
              attempt: number,
              maxRetries: number
          ) => OperationalLogLevel)
        | OperationalLogLevel;

    /**
     * Initial delay between retries in milliseconds.
     *
     * @defaultValue 100
     */
    initialDelay?: number;

    /**
     * Maximum number of retry attempts.
     *
     * @defaultValue 3
     */
    maxRetries?: number;

    /**
     * Callback when operation fails permanently.
     */
    onFailure?: (error: Error, attempts: number) => Promise<void> | void;

    /**
     * Callback when retry is attempted.
     */
    onRetry?: (attempt: number, error: Error) => Promise<void> | void;

    /**
     * Callback when operation succeeds.
     */
    onSuccess?: (result: T) => Promise<void> | void;

    /**
     * Name of the operation for logging and event emission.
     */
    operationName: string;

    /**
     * Whether to throw on final failure.
     *
     * @defaultValue true
     */
    throwOnFailure?: boolean;
}

/**
 * Calculate retry delay based on attempt number and backoff strategy.
 */
function calculateDelay(
    attempt: number,
    initialDelay: number,
    backoff: "exponential" | "linear"
): number {
    if (backoff === "exponential") {
        // Attempt is 0-based (attempt=0 means first retry after initial failure)
        return initialDelay * 2 ** attempt;
    }
    return initialDelay * (attempt + 1);
}

/**
 * Generate a unique operation ID for tracking using crypto.randomUUID().
 */
function generateOperationId(): OperationId {
    if (typeof globalThis.crypto.randomUUID !== "function") {
        throw new TypeError(
            "crypto.randomUUID is unavailable for operation ID generation"
        );
    }

    const candidate = `op_${Date.now()}_${globalThis.crypto
        .randomUUID()
        .slice(0, 8)}`;
    return operationIdSchema.parse(candidate);
}

/**
 * Emit operation start event safely.
 */
async function emitStartEvent(
    eventEmitter: TypedEventBus<UptimeEvents>,
    operationName: string,
    startTime: number,
    context: OperationalHookContext
): Promise<void> {
    try {
        await eventEmitter.emitTyped("database:transaction-completed", {
            duration: 0,
            lifecycleStage: "start",
            operation: `${operationName}:started`,
            success: true,
            timestamp: startTime,
            ...context,
        });
    } catch (eventError) {
        /* V8 ignore next 2 */ logger.debug(
            `[OperationalHooks] Failed to emit start event for ${operationName}`,
            eventError
        );
    }
}

function isOperationalLogLevel(value: unknown): value is OperationalLogLevel {
    return (
        value === "debug" ||
        value === "info" ||
        value === "warn" ||
        value === "error"
    );
}

function resolveFailureLogLevel<T>(
    config: OperationalHooksConfig<T>,
    error: Error,
    attempt: number,
    maxRetries: number
): OperationalLogLevel {
    const { failureLogLevel, operationName } = config;

    if (failureLogLevel === undefined) {
        return "error";
    }

    if (typeof failureLogLevel === "function") {
        try {
            const resolved = failureLogLevel(error, attempt, maxRetries);
            return isOperationalLogLevel(resolved) ? resolved : "error";
        } catch (classificationError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] failureLogLevel callback failed for ${operationName}`,
                classificationError
            );
            return "error";
        }
    }

    return isOperationalLogLevel(failureLogLevel) ? failureLogLevel : "error";
}

/**
 * Handle operation failure.
 */
async function handleFailure<T>(
    error: Error,
    config: OperationalHooksConfig<T>,
    operationName: string,
    startTime: number,
    attempt: number,
    operationId: OperationId,
    context: OperationalHookContext,
    throwOnFailure: boolean = true,
    logLevel: OperationalLogLevel = "error"
): Promise<T> {
    const { emitEvents, eventEmitter, onFailure } = config;
    const duration = Date.now() - startTime;

    if (onFailure) {
        try {
            await onFailure(error, attempt);
        } catch (callbackError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failure callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    // Emit failure event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                duration,
                lifecycleStage: "failure",
                operation: `${operationName}:failed`,
                success: false,
                timestamp: Date.now(),
                ...context,
            });
        } catch (eventError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failed to emit failure event for ${operationName}`,
                eventError
            );
        }
    }

    const logMessage = `[OperationalHooks] ${operationName} failed permanently after ${attempt} attempts`;
    const logMetadata = {
        context,
        duration,
        error,
        operationId,
    } as const;

    switch (logLevel) {
        case "debug": {
            /* V8 ignore next 2 */ logger.debug(logMessage, logMetadata);
            break;
        }
        case "error": {
            /* V8 ignore next 2 */ logger.error(logMessage, error, {
                context,
                duration,
                operationId,
            });
            break;
        }
        case "info": {
            /* V8 ignore next 2 */ logger.info(logMessage, logMetadata);
            break;
        }
        case "warn": {
            /* V8 ignore next 2 */ logger.warn(logMessage, logMetadata);
            break;
        }
        default: {
            /* V8 ignore next 4 */ logger.warn(
                `[OperationalHooks] Unknown failure log level, defaulting to error`,
                {
                    context,
                    duration,
                    operationId,
                    providedLevel: logLevel,
                }
            );
            /* V8 ignore next 2 */ logger.error(logMessage, error, {
                context,
                duration,
                operationId,
            });
            break;
        }
    }

    if (throwOnFailure) {
        throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Generic fallback value when operation fails and exceptions are disabled
    return null as T;
}

/**
 * Handle retry attempt.
 */
async function handleRetry<T>(
    error: Error,
    config: OperationalHooksConfig<T>,
    operationName: string,
    attempt: number,
    operationId: OperationId,
    backoff: "exponential" | "linear" = "exponential",
    initialDelay: number = 100
): Promise<void> {
    const { onRetry } = config;

    if (onRetry) {
        try {
            await onRetry(attempt, error);
        } catch (callbackError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Retry callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    const delay = calculateDelay(attempt, initialDelay, backoff);

    if (delay > 0) {
        /* V8 ignore next 2 */ logger.debug(
            `[OperationalHooks] Retrying ${operationName} in ${delay}ms`,
            {
                attempt: attempt + 1,
                operationId,
            }
        );

        await sleep(delay);
    }
}

/**
 * Handle successful operation completion.
 */
async function handleSuccess<T>(
    result: T,
    config: OperationalHooksConfig<T>,
    operationName: string,
    startTime: number,
    attempt: number,
    operationId: OperationId,
    context: OperationalHookContext
): Promise<T> {
    const { emitEvents, eventEmitter, onSuccess } = config;
    const duration = Date.now() - startTime;

    // Call success callback
    if (onSuccess) {
        try {
            await onSuccess(result);
        } catch (callbackError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Success callback failed for ${operationName}`,
                callbackError
            );
        }
    }

    // Emit success event
    if (emitEvents && eventEmitter) {
        try {
            await eventEmitter.emitTyped("database:transaction-completed", {
                duration,
                lifecycleStage: "success",
                operation: `${operationName}:completed`,
                success: true,
                timestamp: Date.now(),
                ...(typeof result === "number" && { recordsAffected: result }),
                ...context,
            });
        } catch (eventError) {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] Failed to emit success event for ${operationName}`,
                eventError
            );
        }
    }

    /* V8 ignore next 2 */ logger.debug(
        `[OperationalHooks] ${operationName} succeeded after ${attempt} attempt(s)`,
        {
            context,
            duration,
            operationId,
        }
    );

    return result;
}

/**
 * Wraps an async operation with retry logic, error handling, and event
 * emission.
 */
export async function withOperationalHooks<T>(
    operation: () => Promise<T>,
    config: OperationalHooksConfig<T>
): Promise<T> {
    const {
        backoff = "exponential",
        context: contextInput,
        emitEvents = true,
        eventEmitter,
        initialDelay = 100,
        maxRetries = 3,
        operationName,
        throwOnFailure = true,
    } = config;

    const context = normalizeOperationalContext(contextInput);
    const operationId = generateOperationId();
    const startTime = Date.now();

    // Emit operation start event
    if (emitEvents && eventEmitter) {
        await emitStartEvent(eventEmitter, operationName, startTime, context);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] ${operationName} attempt ${attempt}/${maxRetries}`,
                {
                    context,
                    operationId,
                }
            );

            // eslint-disable-next-line no-await-in-loop -- retry operations require sequential awaits
            const result = await operation();
            // eslint-disable-next-line no-await-in-loop -- success handling requires sequential await
            return await handleSuccess(
                result,
                config,
                operationName,
                startTime,
                attempt,
                operationId,
                context
            );
        } catch (error) {
            lastError = ensureError(error);

            /* V8 ignore next 2 */ logger.debug(
                `[OperationalHooks] ${operationName} failed on attempt ${attempt}/${maxRetries}`,
                {
                    context,
                    error: lastError,
                    operationId,
                }
            );

            const failureLogLevel = resolveFailureLogLevel(
                config,
                lastError,
                attempt,
                maxRetries
            );

            // If this was the last attempt, handle failure
            if (attempt === maxRetries) {
                return handleFailure(
                    lastError,
                    config,
                    operationName,
                    startTime,
                    attempt,
                    operationId,
                    context,
                    throwOnFailure,
                    failureLogLevel
                );
            }

            // Handle retry - intentionally sequential for retry logic
            // eslint-disable-next-line no-await-in-loop -- retry handling requires sequential await
            await handleRetry(
                lastError,
                config,
                operationName,
                attempt,
                operationId,
                backoff,
                initialDelay
            );
        }
    }

    // This should never be reached, but TypeScript needs it
    throw (
        lastError ??
        new Error(
            `Operation ${operationName} completed without success or error`
        )
    );
}

/**
 * Specialized wrapper for database operations with database-specific defaults.
 *
 * @remarks
 * This function is a convenience wrapper around withOperationalHooks that
 * applies database-optimized settings and adds a "database:" prefix to
 * operation names for consistent event naming. While the underlying
 * implementation is generic, this wrapper should only be used for actual
 * database operations to maintain clear semantic boundaries and event
 * categorization.
 *
 * @typeParam T - The return type of the database operation
 *
 * @param operation - Database operation to execute with retry logic
 * @param operationName - Name of the database operation (will be prefixed with
 *   "database:")
 * @param eventEmitter - Optional event emitter for operation lifecycle events
 * @param context - Optional context data to include in events
 *
 * @returns Promise resolving to the operation result
 */
export async function withDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    context?: OperationalHookContextInput
): Promise<T> {
    return withOperationalHooks(operation, {
        backoff: "exponential",
        initialDelay: 100,
        maxRetries: 3,
        operationName: `database:${operationName}`,
        ...(eventEmitter && { eventEmitter }),
        ...(context && { context }),
        emitEvents: Boolean(eventEmitter),
    });
}
