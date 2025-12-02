/**
 * Standardized IPC handler utilities for consistent response formatting and
 * error handling. Provides wrapper functions and utilities for creating
 * type-safe, consistent IPC handlers.
 */

import type {
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    IpcInvokeChannelResult,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";
import {
    isNonEmptyString,
    isValidUrl,
} from "@shared/validation/validatorUtils";
import { ipcMain } from "electron";

import type {
    IpcParameterValidator,
    IpcResponse,
    IpcValidationResponse,
} from "./types";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";

const HIGH_FREQUENCY_OPERATIONS = new Set<string>([
    MONITOR_TYPES_CHANNELS.formatMonitorDetail,
    MONITOR_TYPES_CHANNELS.getMonitorTypes,
]);

/**
 * Structured metadata describing IPC handler execution characteristics.
 *
 * @remarks
 * This type intentionally extends {@link UnknownRecord} so additional diagnostic
 * fields can be attached without weakening the metadata contract for known
 * properties like {@link handler}, {@link duration}, and {@link paramCount}.
 * Callers outside this module should continue to treat the public
 * {@link IpcResponse.metadata} field as an opaque record.
 */
interface IpcHandlerMetadata extends UnknownRecord {
    /** Total handler execution duration in milliseconds. */
    duration?: number;
    /** Fully-qualified IPC handler name (channel identifier). */
    handler?: string;
    /** Number of parameters supplied to the handler. */
    paramCount?: number;
    /** Optional validation errors when parameter validation fails. */
    validationErrors?: readonly string[];
}

interface HandlerExecutionFailure {
    duration: number;
    errorMessage: string;
    outcome: "error";
}

interface HandlerExecutionSuccess<T> {
    duration: number;
    outcome: "success";
    value: T;
}

type HandlerExecutionResult<T> =
    | HandlerExecutionFailure
    | HandlerExecutionSuccess<T>;

interface WithIpcHandlerOptions {
    readonly metadata?: IpcHandlerMetadata;
}

type ChannelParams<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelParams<TChannel> extends readonly unknown[]
        ? IpcInvokeChannelParams<TChannel>
        : never;

type StrictIpcInvokeHandler<TChannel extends IpcInvokeChannel> = (
    ...params: ChannelParams<TChannel>
) =>
    | IpcInvokeChannelResult<TChannel>
    | Promise<IpcInvokeChannelResult<TChannel>>;

function shouldLogHandler(channelName: string): boolean {
    return isDev() && !HIGH_FREQUENCY_OPERATIONS.has(channelName);
}

async function executeIpcHandler<T>(
    channelName: string,
    handler: () => Promise<T> | T,
    startMetadata?: IpcHandlerMetadata
): Promise<HandlerExecutionResult<T>> {
    const startTime = Date.now();
    const logStart = shouldLogHandler(channelName);

    if (logStart) {
        const metadata =
            startMetadata && Object.keys(startMetadata).length > 0
                ? { handler: channelName, ...startMetadata }
                : { handler: channelName };
        logger.debug(`[IpcHandler] Starting ${channelName}`, metadata);
    }

    try {
        const value = await handler();
        const duration = Date.now() - startTime;

        if (logStart) {
            logger.debug(`[IpcHandler] Completed ${channelName}`, {
                duration,
                handler: channelName,
            });
        }

        return {
            duration,
            outcome: "success",
            value,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        logger.error(`[IpcHandler] Failed ${channelName}`, {
            duration,
            error: errorMessage,
            handler: channelName,
        });

        return {
            duration,
            errorMessage,
            outcome: "error",
        };
    }
}

/**
 * Standard parameter validation utilities for common IPC operations.
 *
 * @public
 */
export const IpcValidators = {
    /**
     * Validates an optional string parameter using validator.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    optionalString: (value: unknown, paramName: string): null | string => {
        if (value !== undefined && !isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string when provided`;
        }
        return null;
    },

    /**
     * Validates a required boolean parameter.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    requiredBoolean: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "boolean") {
            return `${paramName} must be a boolean`;
        }
        return null;
    },

    /**
     * Validates a required number parameter.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    requiredNumber: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "number" || Number.isNaN(value)) {
            return `${paramName} must be a valid number`;
        }
        return null;
    },

    /**
     * Validates a required object parameter.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    requiredObject: (value: unknown, paramName: string): null | string => {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            return `${paramName} must be a valid object`;
        }
        return null;
    },

    /**
     * Validates a required string parameter using validator.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    requiredString: (value: unknown, paramName: string): null | string => {
        if (!isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string`;
        }
        return null;
    },
    /**
     * Validates a required URL parameter restricted to safe protocols.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     *
     * @returns Error message or null if valid
     */
    requiredUrl: (value: unknown, paramName: string): null | string => {
        if (!isValidUrl(value)) {
            return `${paramName} must be a valid http(s) URL`;
        }

        return null;
    },
} as const;

/**
 * Creates a standardized error response.
 *
 * @param error - Error message
 * @param metadata - Optional metadata
 *
 * @returns Standardized IPC error response
 *
 * @public
 */
// eslint-disable-next-line etc/no-misused-generics -- Type parameter can be omitted for flexible usage
export function createErrorResponse<T = void>(
    error: string,
    metadata?: UnknownRecord
): IpcResponse<T> {
    const response: IpcResponse<T> = {
        error,
        success: false,
    };

    if (metadata !== undefined) {
        response.metadata = metadata;
    }

    return response;
}

/**
 * Creates a standardized success response.
 *
 * @param data - The response data
 * @param metadata - Optional metadata
 * @param warnings - Optional warnings
 *
 * @returns Standardized IPC success response
 *
 * @public
 */
export function createSuccessResponse<T>(
    data?: T,
    metadata?: UnknownRecord,
    warnings?: string[]
): IpcResponse<T> {
    const response: IpcResponse<T> = {
        success: true,
    };

    if (data !== undefined) {
        response.data = data;
    }

    if (metadata !== undefined) {
        response.metadata = metadata;
    }

    if (warnings !== undefined && warnings.length > 0) {
        response.warnings = warnings;
    }

    return response;
}

function createResponseFromExecution<T>(
    channelName: string,
    execution: HandlerExecutionResult<T>
): IpcResponse<T> {
    if (execution.outcome === "success") {
        return createSuccessResponse(execution.value, {
            duration: execution.duration,
            handler: channelName,
        });
    }

    return createErrorResponse<T>(execution.errorMessage, {
        duration: execution.duration,
        handler: channelName,
    });
}

/**
 * Creates a standardized validation response for backward compatibility.
 *
 * @param success - Whether validation passed
 * @param errors - Validation errors
 * @param warnings - Validation warnings
 * @param metadata - Additional metadata
 *
 * @returns Standardized validation response
 *
 * @public
 */
export function createValidationResponse(
    success: boolean,
    errors: readonly string[] = [],
    warnings: readonly string[] = [],
    metadata: UnknownRecord = {}
): IpcValidationResponse {
    return {
        errors,
        metadata,
        success,
        warnings,
    };
}

/**
 * Wraps an IPC handler with standardized error handling, logging, and response
 * formatting.
 *
 * @remarks
 * Provides consistent error handling, logging, and response formatting for all
 * IPC handlers. Automatically logs handler execution and errors, validates
 * parameters if provided, and ensures all responses follow the standardized
 * format.
 *
 * @example
 *
 * ```typescript
 * const result = await withIpcHandler("get-sites", async () =>
 *     this.uptimeOrchestrator.getSites()
 * );
 * ```
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function to wrap
 *
 * @returns The wrapped handler result
 *
 * @public
 */
export async function withIpcHandler<T>(
    channelName: string,
    handler: () => Promise<T> | T,
    options?: WithIpcHandlerOptions
): Promise<IpcResponse<T>> {
    const execution = await executeIpcHandler(
        channelName,
        handler,
        options?.metadata
    );
    return createResponseFromExecution(channelName, execution);
}

/**
 * Wraps an IPC handler with parameter validation, standardized error handling,
 * and response formatting.
 *
 * @remarks
 * Extended version of withIpcHandler that includes parameter validation.
 * Validates parameters before executing the handler and provides detailed error
 * messages.
 *
 * @example
 *
 * ```typescript
 * const result = await withIpcHandlerValidation(
 *     "add-site",
 *     async (site: Site) => this.uptimeOrchestrator.addSite(site),
 *     (params) => IpcValidators.requiredObject(params[0], "site"),
 *     [siteData]
 * );
 * ```
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function to wrap
 * @param validateParams - Parameter validation function
 * @param params - The parameters to validate and pass to the handler
 *
 * @returns The wrapped handler result
 *
 * @public
 */
export async function withIpcHandlerValidation<
    T,
    TParams extends readonly unknown[],
>(
    channelName: string,
    handler: (...validatedParams: TParams) => Promise<T> | T,
    validateParams: IpcParameterValidator,
    params: TParams
): Promise<IpcResponse<T>> {
    const validationErrors = validateParams(params);
    if (validationErrors?.length) {
        const errorMessage = `Parameter validation failed: ${validationErrors.join(", ")}`;
        logger.warn(`[IpcHandler] Validation failed ${channelName}`, {
            errors: validationErrors,
        });
        return createErrorResponse<T>(errorMessage, {
            handler: channelName,
            validationErrors,
        });
    }

    const execution = await executeIpcHandler(
        channelName,
        () => handler(...params),
        {
            paramCount: params.length,
        }
    );
    return createResponseFromExecution(channelName, execution);
}

/**
 * Registers a standardized IPC handler with consistent error handling and
 * response formatting.
 *
 * @remarks
 * Registers an IPC handler with the electron ipcMain, automatically wrapping it
 * with standardized error handling, logging, and response formatting. All
 * responses will follow the IpcResponse interface for consistency.
 *
 * @example
 *
 * ```typescript
 * registerStandardizedIpcHandler(
 *     "get-sites",
 *     async () => this.uptimeOrchestrator.getSites(),
 *     null,
 *     this.registeredIpcHandlers
 * );
 * ```
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function
 * @param validateParams - Optional parameter validation function
 * @param registeredHandlers - Set to track registered handlers for cleanup
 *
 * @public
 */
export function registerStandardizedIpcHandler<
    TChannel extends IpcInvokeChannel,
>(
    channelName: TChannel,
    handler: StrictIpcInvokeHandler<TChannel>,
    validateParams: IpcParameterValidator | null,
    registeredHandlers: Set<IpcInvokeChannel>
): void {
    if (registeredHandlers.has(channelName)) {
        const errorMessage = `[IpcService] Attempted to register duplicate IPC handler for channel '${channelName}'`;

        logger.error(errorMessage, {
            channel: channelName,
            registeredHandlers: Array.from(registeredHandlers),
        });

        throw new Error(errorMessage);
    }

    registeredHandlers.add(channelName);

    try {
        ipcMain.handle(
            channelName,
            async (_event, ...rawArgs: ChannelParams<TChannel>) => {
                if (validateParams) {
                    return withIpcHandlerValidation(
                        channelName,
                        (...validatedParams: ChannelParams<TChannel>) =>
                            handler(...validatedParams),
                        validateParams,
                        rawArgs
                    );
                }

                return withIpcHandler(channelName, () => handler(...rawArgs), {
                    metadata: {
                        paramCount: rawArgs.length,
                    },
                });
            }
        );
    } catch (rawError) {
        registeredHandlers.delete(channelName);

        const error =
            rawError instanceof Error ? rawError : new Error(String(rawError));

        logger.error(
            `[IpcService] Failed to register IPC handler for channel '${channelName}'`,
            error
        );

        throw error;
    }
}
