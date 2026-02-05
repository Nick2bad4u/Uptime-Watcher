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

import {
    IPC_INVOKE_CHANNEL_PARAM_COUNTS,
    isIpcCorrelationEnvelope,
} from "@shared/types/ipc";
import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";
import { generateCorrelationId } from "@shared/utils/correlation";
import { ensureError } from "@shared/utils/errorHandling";
import {
    normalizeLogValue,
    withLogContext,
} from "@shared/utils/loggingContext";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { isNonEmptyString } from "@shared/validation/validatorUtils";
import { ipcMain, type IpcMainInvokeEvent } from "electron";

import type {
    IpcParameterValidator,
    IpcResponse,
    IpcResultValidator,
} from "./types";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { truncateUtfString } from "./diagnosticsLimits";

type ChannelParams<TChannel extends IpcInvokeChannel> = [
    ...IpcInvokeChannelParams<TChannel>,
];

type StrictIpcInvokeHandler<TChannel extends IpcInvokeChannel> = (
    ...args: ChannelParams<TChannel>
) =>
    | IpcInvokeChannelResult<TChannel>
    | Promise<IpcInvokeChannelResult<TChannel>>;

/**
 * Registers an IPC invoke handler with standardized correlation handling,
 * parameter validation, response formatting, and optional result validation.
 */
export type StandardizedIpcRegistrar = <TChannel extends IpcInvokeChannel>(
    channelName: TChannel,
    handler: StrictIpcInvokeHandler<TChannel>,
    validateParams: IpcParameterValidator,
    validateResult?: IpcResultValidator<IpcInvokeChannelResult<TChannel>> | null
) => void;

function createSafeErrorMessage(error: unknown): string {
    const ensured = ensureError(error);
    return isNonEmptyString(ensured.message)
        ? ensured.message
        : "Unknown error";
}

const HIGH_FREQUENCY_OPERATIONS = new Set<string>([
    MONITOR_TYPES_CHANNELS.formatMonitorDetail,
    MONITOR_TYPES_CHANNELS.getMonitorTypes,
]);

const getExpectedParamCount = (channelName: IpcInvokeChannel): number =>
    IPC_INVOKE_CHANNEL_PARAM_COUNTS[channelName];

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
    /** Optional validation errors when the success payload validation fails. */
    resultValidationErrors?: readonly string[];

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

/**
 * Options for {@link withIpcHandler} / {@link withIpcHandlerValidation}.
 */
export interface WithIpcHandlerOptions<TResult = unknown> {
    correlationId?: CorrelationId;
    metadata?: Partial<IpcHandlerMetadata>;
    validateResult?: IpcResultValidator<TResult> | null;
}

function assertChannelParams<TChannel extends IpcInvokeChannel>(
    channelName: TChannel,
    params: readonly unknown[]
): asserts params is ChannelParams<TChannel> {
    if (!Array.isArray(params)) {
        throw new TypeError(
            `[IpcService] Expected parameters array when invoking ${channelName}`
        );
    }

    const expectedParamCount = getExpectedParamCount(channelName);

    if (params.length !== expectedParamCount) {
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
    options?: WithIpcHandlerOptions<T>
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
        if (byteOffset === 0 && byteLength === buffer.byteLength) {
            return buffer;
        }
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
export function createErrorResponse(
    error: string,
    metadata?: UnknownRecord
): IpcResponse<never> {
    const response: IpcResponse<never> = {
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
    correlationId: CorrelationId | undefined,
    metadata: IpcHandlerMetadata | undefined,
    validateResult?: IpcResultValidator<T>
): IpcResponse<T> {
    const responseMetadata: IpcHandlerMetadata = {
        ...metadata,
        duration: execution.duration,
        handler: channelName,
        ...(correlationId ? { correlationId } : {}),
    };

    if (execution.outcome === "success") {
        if (validateResult) {
            try {
                const resultValidationErrors = validateResult(execution.value);
                if (
                    resultValidationErrors &&
                    resultValidationErrors.length > 0
                ) {
                    return createErrorResponse(
                        "IPC handler returned an invalid response payload",
                        {
                            ...responseMetadata,
                            resultValidationErrors,
                        }
                    );
                }
            } catch (error) {
                const safeErrorMessage = createSafeErrorMessage(error);
                return createErrorResponse(safeErrorMessage, responseMetadata);
            }
        }

        return createSuccessResponse(execution.value, responseMetadata);
    }

    return createErrorResponse(execution.errorMessage, responseMetadata);
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
 * const result = await withIpcHandler(
 *     SITES_CHANNELS.getSites,
 *     async () => this.uptimeOrchestrator.getSites(),
 *     {
 *         validateResult: (value) =>
 *             Array.isArray(value) ? null : ["Expected an array"],
 *     }
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
    options?: WithIpcHandlerOptions<T>
): Promise<IpcResponse<T>> {
    const execution = await executeIpcHandler(channelName, handler, options);
    return createResponseFromExecution(
        channelName,
        execution,
        options?.correlationId,
        options?.metadata,
        options?.validateResult ?? undefined
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
    options?: WithIpcHandlerOptions<T>
): Promise<IpcResponse<T>> {
    const validationErrors = validateParams(params) ?? [];

    const correlationId = options?.correlationId;
    const metadata: Partial<IpcHandlerMetadata> = {
        ...options?.metadata,
        paramCount: params.length,
    };

    if (validationErrors.length > 0) {
        if (shouldLogHandler(channelName)) {
            logger.warn(
                `[IpcHandler] Validation failed ${channelName}`,
                withLogContext({
                    channel: channelName,
                    ...(correlationId ? { correlationId } : {}),
                    event: "ipc:validation:failure",
                    severity: "warn",
                }),
                {
                    channelName,
                    validationErrors,
                }
            );
        }

        const errorMessage = `Parameter validation failed: ${validationErrors.join(
            ", "
        )}`;

        const responseMetadata = {
            ...metadata,
            handler: channelName,
            ...(correlationId ? { correlationId } : {}),
            validationErrors,
        } satisfies IpcHandlerMetadata;

        return createErrorResponse(errorMessage, responseMetadata);
    }

    const executionOptions: WithIpcHandlerOptions<T> = {
        metadata,
        validateResult: options?.validateResult ?? null,
        ...(correlationId ? { correlationId } : {}),
    };

    const execution = await executeIpcHandler(
        channelName,
        () => handler(...params),
        executionOptions
    );

    return createResponseFromExecution(
        channelName,
        execution,
        executionOptions.correlationId,
        executionOptions.metadata,
        executionOptions.validateResult ?? undefined
    );
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
 * @param validateResult - Optional validator for successful handler results
 *
 * @public
 */
export function registerStandardizedIpcHandler<
    TChannel extends IpcInvokeChannel,
>(
    channelName: TChannel,
    handler: StrictIpcInvokeHandler<TChannel>,
    validateParams: IpcParameterValidator | null,
    registeredHandlers: Set<IpcInvokeChannel>,
    validateResult: IpcResultValidator<
        IpcInvokeChannelResult<TChannel>
    > | null = null
): void {
    const expectedParamCount = getExpectedParamCount(channelName);

    if (validateParams === null && expectedParamCount > 0) {
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
        ipcMain.handle(
            channelName,
            async (_event: IpcMainInvokeEvent, ...rawArgs: unknown[]) => {
                const { args, correlationId } =
                    extractIpcCorrelationContext(rawArgs);

                const correlationMetadata =
                    correlationId === undefined ? {} : { correlationId };

                // Preserve the dedicated error message for "no-param" channels that
                // do not use validators.
                if (
                    validateParams === null &&
                    expectedParamCount === 0 &&
                    args.length > 0
                ) {
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
                    assertChannelParams(channelName, args);
                } catch (error: unknown) {
                    const safeError = ensureError(error);
                    const message =
                        safeError.message.length > 0
                            ? safeError.message
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
                const handlerOptions: WithIpcHandlerOptions<
                    IpcInvokeChannelResult<TChannel>
                > = {
                    ...(correlationId === undefined ? {} : { correlationId }),
                    metadata: baseMetadata,
                    ...(validateResult === null ? {} : { validateResult }),
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
            }
        );
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
    return (<TChannel extends IpcInvokeChannel>(
        channelName: TChannel,
        handler: StrictIpcInvokeHandler<TChannel>,
        validateParams?: IpcParameterValidator | null,
        validateResult?: IpcResultValidator<
            IpcInvokeChannelResult<TChannel>
        > | null
    ) => {
        registerStandardizedIpcHandler(
            channelName,
            handler,
            validateParams ?? null,
            registeredHandlers,
            validateResult ?? null
        );
    }) as StandardizedIpcRegistrar;
}
