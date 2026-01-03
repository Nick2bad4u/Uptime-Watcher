/**
 * Standardized IPC handler utilities for consistent response formatting and
 * error handling. Provides wrapper functions and utilities for creating
 * type-safe, consistent IPC handlers.
 */

import type { CorrelationId } from "@shared/types/events";
import type {
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    IpcInvokeChannelResult,
} from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { isIpcCorrelationEnvelope } from "@shared/types/ipc";
import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";
import { generateCorrelationId } from "@shared/utils/correlation";
import {
    normalizeLogValue,
    withLogContext,
} from "@shared/utils/loggingContext";
import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
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
import { truncateUtfString } from "./diagnosticsLimits";

const HIGH_FREQUENCY_OPERATIONS = new Set<string>([
    MONITOR_TYPES_CHANNELS.formatMonitorDetail,
    MONITOR_TYPES_CHANNELS.getMonitorTypes,
]);

/**
 * Maximum byte length accepted for URL parameters passed through IPC.
 *
 * @remarks
 * This is a defense-in-depth limit to prevent accidental or malicious oversized
 * payloads (e.g. multi-megabyte strings) from forcing expensive parsing or
 * logging work at IPC boundaries.
 */
const MAX_IPC_URL_UTF_BYTES = 32_768;

function validateIpcUrlStringGuards(
    value: string,
    paramName: string
): null | string {
    return /[\n\r]/u.test(value)
        ? `${paramName} must not contain newlines`
        : null;
}

const validateIpcUrlPayloadGuards = (
    value: unknown,
    paramName: string
): null | string => {
    if (typeof value !== "string") {
        return null;
    }

    const byteLength = getUtfByteLength(value);

    if (byteLength > MAX_IPC_URL_UTF_BYTES) {
        return `${paramName} must not exceed ${MAX_IPC_URL_UTF_BYTES} bytes`;
    }

    return validateIpcUrlStringGuards(value, paramName);
};

/** Maximum bytes allowed for IPC error messages returned to the renderer. */
const MAX_IPC_ERROR_MESSAGE_UTF_BYTES = 4096;

const normalizeIpcErrorMessage = (message: string): string => {
    // Truncate first to cap redaction work for huge messages.
    const preview = truncateUtfString(
        message,
        MAX_IPC_ERROR_MESSAGE_UTF_BYTES
    ).value;

    const normalized = normalizeLogValue(preview);
    return typeof normalized === "string" ? normalized : preview;
};

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
    /** Correlation identifier propagated from the renderer. */
    correlationId?: CorrelationId;
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
    readonly correlationId?: CorrelationId;
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

/**
 * Curried registrar type for standardized IPC handlers.
 */
export type StandardizedIpcRegistrar = <TChannel extends IpcInvokeChannel>(
    channelName: TChannel,
    handler: StrictIpcInvokeHandler<TChannel>,
    ...validatorArgs: ChannelParams<TChannel> extends readonly []
        ? [validateParams?: IpcParameterValidator | null]
        : [validateParams: IpcParameterValidator]
) => void;

function assertChannelParams<TChannel extends IpcInvokeChannel>(
    channelName: TChannel,
    params: readonly unknown[],
    handler: StrictIpcInvokeHandler<TChannel>
): asserts params is ChannelParams<TChannel> {
    if (!Array.isArray(params)) {
        throw new TypeError(
            `[IpcService] Expected parameters array when invoking ${channelName}`
        );
    }

    const expectedParamCount = handler.length;
    // NOTE: We only enforce arity when the handler declares an explicit
    // parameter list.
    //
    // Vitest mocks and rest-parameter handlers commonly report `length === 0`
    // even when they can accept parameters. In those cases, the runtime arity
    // is not meaningful, so we skip strict enforcement here.
    if (expectedParamCount > 0 && params.length !== expectedParamCount) {
        throw new Error(
            `[IpcService] Channel ${channelName} expects exactly ${expectedParamCount} parameter(s) but received ${params.length}`
        );
    }
}

interface ExtractedIpcContext {
    readonly args: readonly unknown[];
    readonly correlationId?: CorrelationId;
}

const extractIpcCorrelationContext = (
    args: readonly unknown[]
): ExtractedIpcContext => {
    const correlationEnvelope = args.at(-1);
    if (isIpcCorrelationEnvelope(correlationEnvelope)) {
        return {
            args: args.slice(0, -1),
            correlationId: correlationEnvelope.correlationId,
        } satisfies ExtractedIpcContext;
    }

    return { args } satisfies ExtractedIpcContext;
};

function shouldLogHandler(channelName: string): boolean {
    return isDev() && !HIGH_FREQUENCY_OPERATIONS.has(channelName);
}

async function executeIpcHandler<T>(
    channelName: string,
    handler: () => Promise<T> | T,
    options?: WithIpcHandlerOptions
): Promise<HandlerExecutionResult<T>> {
    const startTime = Date.now();
    const logStart = shouldLogHandler(channelName);
    const correlationId = options?.correlationId ?? generateCorrelationId();
    const startMetadata = options?.metadata;

    if (logStart) {
        const metadata =
            startMetadata && Object.keys(startMetadata).length > 0
                ? { handler: channelName, ...startMetadata }
                : { handler: channelName };
        logger.debug(
            `[IpcHandler] Starting ${channelName}`,
            withLogContext({
                channel: channelName,
                correlationId,
                event: "ipc:handler:start",
                severity: "debug",
            }),
            metadata
        );
    }

    try {
        const value = await handler();
        const duration = Date.now() - startTime;

        if (logStart) {
            logger.debug(
                `[IpcHandler] Completed ${channelName}`,
                withLogContext({
                    channel: channelName,
                    correlationId,
                    event: "ipc:handler:completed",
                    severity: "debug",
                }),
                {
                    duration,
                    handler: channelName,
                }
            );
        }

        return {
            duration,
            outcome: "success",
            value,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const rawErrorMessage = getUserFacingErrorDetail(error);
        const errorMessage = normalizeIpcErrorMessage(rawErrorMessage);

        logger.error(
            `[IpcHandler] Failed ${channelName}`,
            withLogContext({
                channel: channelName,
                correlationId,
                event: "ipc:handler:failed",
                severity: "error",
            }),
            {
                duration,
                error: errorMessage,
            }
        );

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
     * Validates a required URL parameter intended for opening via
     * `shell.openExternal`.
     *
     * @remarks
     * This differs from {@link requiredUrl} by allowing `mailto:` in addition to
     * `http:` and `https:`. It also enforces the same defense-in-depth size and
     * newline constraints used by {@link requiredUrl}.
     */
    requiredExternalOpenUrl: (
        value: unknown,
        paramName: string
    ): null | string => {
        const guardError = validateIpcUrlPayloadGuards(value, paramName);
        if (guardError) {
            return guardError;
        }

        const validation = validateExternalOpenUrlCandidate(value);
        if ("reason" in validation) {
            return `${paramName} ${validation.reason}`;
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
        const guardError = validateIpcUrlPayloadGuards(value, paramName);
        if (guardError) {
            return guardError;
        }

        if (
            !isValidUrl(value, {
                disallowAuth: true,
            })
        ) {
            return `${paramName} must be a valid http(s) URL`;
        }

        return null;
    },
} as const;

/**
 * Converts an {@link ArrayBufferView} into a standalone {@link ArrayBuffer}
 * containing exactly the view's bytes.
 *
 * @remarks
 * Useful for IPC payloads when you want to send a plain ArrayBuffer to the
 * renderer without leaking extra bytes from a larger underlying buffer.
 */
export function toClonedArrayBuffer(view: ArrayBufferView): ArrayBuffer {
    const { buffer, byteLength, byteOffset } = view;

    if (buffer instanceof ArrayBuffer) {
        return buffer.slice(byteOffset, byteOffset + byteLength);
    }

    const out = new ArrayBuffer(byteLength);
    new Uint8Array(out).set(new Uint8Array(buffer, byteOffset, byteLength));
    return out;
}

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
    execution: HandlerExecutionResult<T>,
    correlationId?: CorrelationId
): IpcResponse<T> {
    if (execution.outcome === "success") {
        return createSuccessResponse(execution.value, {
            duration: execution.duration,
            handler: channelName,
            ...(correlationId ? { correlationId } : {}),
        });
    }

    return createErrorResponse<T>(execution.errorMessage, {
        duration: execution.duration,
        handler: channelName,
        ...(correlationId ? { correlationId } : {}),
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
 * import { SITES_CHANNELS } from "@shared/types/preload";
 *
 * const result = await withIpcHandler(SITES_CHANNELS.getSites, async () =>
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
    const execution = await executeIpcHandler(channelName, handler, options);
    return createResponseFromExecution(
        channelName,
        execution,
        options?.correlationId
    );
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
 * import { SITES_CHANNELS } from "@shared/types/preload";
 *
 * const result = await withIpcHandlerValidation(
 *     SITES_CHANNELS.addSite,
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
    params: TParams,
    options?: WithIpcHandlerOptions
): Promise<IpcResponse<T>> {
    const validationErrors = validateParams(params) ?? [];
    const correlationId = options?.correlationId;
    const correlationMetadata = correlationId ? { correlationId } : {};
    if (validationErrors.length > 0) {
        const errorMessage = `Parameter validation failed: ${validationErrors.join(", ")}`;
        logger.warn(
            `[IpcHandler] Validation failed ${channelName}`,
            withLogContext({
                channel: channelName,
                ...correlationMetadata,
                event: "ipc:handler:validation-failed",
                severity: "warn",
            }),
            {
                errors: validationErrors,
            }
        );
        return createErrorResponse<T>(errorMessage, {
            handler: channelName,
            ...correlationMetadata,
            validationErrors,
        });
    }

    const metadata: IpcHandlerMetadata = {
        paramCount: params.length,
        ...options?.metadata,
    };

    const executionOptions: WithIpcHandlerOptions =
        correlationId === undefined
            ? { metadata }
            : {
                  correlationId,
                  metadata,
              };

    const execution = await executeIpcHandler(
        channelName,
        () => handler(...params),
        executionOptions
    );
    return createResponseFromExecution(channelName, execution, correlationId);
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
 * import { SITES_CHANNELS } from "@shared/types/preload";
 *
 * registerStandardizedIpcHandler(
 *     SITES_CHANNELS.getSites,
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
    if (validateParams === null && handler.length > 0) {
        const errorMessage = `[IpcService] Missing validateParams for '${channelName}'. Handlers that accept parameters must provide runtime validation.`;

        logger.error(
            errorMessage,
            withLogContext({
                channel: channelName,
                event: "ipc:handler:register",
                severity: "error",
            }),
            {
                channel: channelName,
            }
        );

        throw new Error(errorMessage);
    }

    if (registeredHandlers.has(channelName)) {
        const errorMessage = `[IpcService] Attempted to register duplicate IPC handler for channel '${channelName}'`;

        logger.error(
            errorMessage,
            withLogContext({
                channel: channelName,
                event: "ipc:handler:register",
                severity: "error",
            }),
            {
                channel: channelName,
                registeredHandlers: Array.from(registeredHandlers),
            }
        );

        throw new Error(errorMessage);
    }

    registeredHandlers.add(channelName);

    try {
        ipcMain.handle(channelName, async (_event, ...rawArgs: unknown[]) => {
            const { args, correlationId } =
                extractIpcCorrelationContext(rawArgs);

            const correlationMetadata =
                correlationId === undefined ? {} : { correlationId };

            // Preserve the dedicated error message for "no-param" channels that
            // do not use validators.
            if (validateParams === null && args.length > 0) {
                logger.warn(
                    "[IpcHandler] Rejected IPC invocation with unexpected parameters",
                    withLogContext({
                        channel: channelName,
                        ...correlationMetadata,
                        event: "ipc:handler:unexpected-params",
                        severity: "warn",
                    }),
                    {
                        paramCount: args.length,
                    }
                );

                return createErrorResponse(
                    `Unexpected IPC parameters for ${channelName}. This channel does not accept any parameters.`,
                    {
                        handler: channelName,
                        ...correlationMetadata,
                        paramCount: args.length,
                    }
                );
            }

            try {
                assertChannelParams(channelName, args, handler);
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : `Invalid IPC parameters for ${channelName}`;

                logger.warn(
                    "[IpcHandler] Rejected IPC invocation due to invalid parameter shape",
                    withLogContext({
                        channel: channelName,
                        ...correlationMetadata,
                        event: "ipc:handler:validation-failed",
                        severity: "warn",
                    }),
                    {
                        error: message,
                        paramCount: args.length,
                    }
                );

                return createErrorResponse(message, {
                    handler: channelName,
                    ...correlationMetadata,
                    paramCount: args.length,
                });
            }

            const baseMetadata = {
                paramCount: args.length,
            } satisfies IpcHandlerMetadata;
            const handlerOptions: WithIpcHandlerOptions =
                correlationId === undefined
                    ? {
                          metadata: baseMetadata,
                      }
                    : {
                          correlationId,
                          metadata: baseMetadata,
                      };

            if (validateParams === null) {
                return withIpcHandler(
                    channelName,
                    () => handler(...args),
                    handlerOptions
                );
            }

            return withIpcHandlerValidation(
                channelName,
                (...validatedParams: ChannelParams<TChannel>) =>
                    handler(...validatedParams),
                validateParams,
                args,
                handlerOptions
            );
        });
    } catch (rawError) {
        registeredHandlers.delete(channelName);

        const error =
            rawError instanceof Error
                ? rawError
                : new Error(getUserFacingErrorDetail(rawError));

        logger.error(
            `[IpcService] Failed to register IPC handler for channel '${channelName}'`,
            withLogContext({
                channel: channelName,
                event: "ipc:handler:register",
                severity: "error",
            }),
            error
        );

        throw error;
    }
}

/**
 * Creates a typed registrar for {@link registerStandardizedIpcHandler}.
 *
 * @remarks
 * Handler modules typically register multiple channels. Currying the shared
 * `registeredHandlers` set avoids repeating it for every registration call.
 */
export function createStandardizedIpcRegistrar(
    registeredHandlers: Set<IpcInvokeChannel>
): StandardizedIpcRegistrar {
    return function register<TChannel extends IpcInvokeChannel>(
        channelName: TChannel,
        handler: StrictIpcInvokeHandler<TChannel>,
        ...validatorArgs: ChannelParams<TChannel> extends readonly []
            ? [validateParams?: IpcParameterValidator | null]
            : [validateParams: IpcParameterValidator]
    ): void {
        const validateParams = validatorArgs[0] ?? null;

        registerStandardizedIpcHandler(
            channelName,
            handler,
            validateParams,
            registeredHandlers
        );
    };
}
