/**
 * Core infrastructure for generating typed preload bridges from IPC channel
 * definitions
 *
 * @remarks
 * This module provides the foundational components for creating modular,
 * type-safe preload APIs that maintain perfect alignment with backend IPC
 * handlers. It leverages the existing IpcResponse interface and validation
 * patterns.
 *
 * @packageDocumentation
 */

import type {
    IpcHandlerVerificationResult,
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    IpcInvokeChannelResult,
    IpcResponse as SharedIpcResponse, VoidIpcInvokeChannel
} from "@shared/types/ipc";
import type { IpcRendererEvent } from "electron";
import type { UnknownRecord } from "type-fest";

import {
    MAX_IPC_JSON_IMPORT_BYTES,
    MAX_IPC_SQLITE_RESTORE_BYTES,
} from "@shared/constants/backup";
import {
    createIpcCorrelationEnvelope,
    isIpcHandlerVerificationResult,
} from "@shared/types/ipc";
import {
    DATA_CHANNELS,
    DIAGNOSTICS_CHANNELS,
    MONITORING_CHANNELS,
} from "@shared/types/preload";
import { generateCorrelationId } from "@shared/utils/correlation";
import { ensureError } from "@shared/utils/errorHandling";
import {
    extractIpcResponseData,
    validateVoidIpcResponse,
} from "@shared/utils/ipcResponse";
import { isJsonByteBudgetExceeded } from "@shared/utils/jsonByteBudget";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { ipcRenderer } from "electron";

import {
    buildPayloadPreview,
    preloadDiagnosticsLogger,
    preloadLogger,
    reportPreloadGuardFailure,
} from "../utils/preloadLogger";

/**
 * Canonical IPC response shape used by the preload bridge.
 *
 * @typeParam T - Payload type carried by a successful IPC response.
 */
export type IpcResponse<T = unknown> = SharedIpcResponse<T>;

/**
 * Minimal "safe parse" shape compatible with Zod's `safeParse` return type.
 *
 * @remarks
 * Preload bridges often reuse shared Zod schemas/guards to validate IPC
 * payloads. This type allows domain modules to pass either Zod safe parsers or
 * custom validators into {@link createValidatedInvoker}.
 */
export type SafeParseLike<T> =
    | {
          readonly data: T;
          readonly success: true;
      }
    | {
          readonly error: unknown;
          readonly success: false;
      };

/**
 * Generic safe-parse result shape used by Zod and compatible validators.
 *
 * @remarks
 * This is intentionally _not_ tied to Zod's concrete types to avoid coupling
 * shared validation modules to preload infrastructure.
 */
export type SafeParseResultLike<T> =
    | {
          readonly data: T;
          readonly success: true;
      }
    | {
          readonly error: unknown;
          readonly success: false;
      };

/**
 * Options controlling how validation failures are logged and reported.
 */
export interface ResultValidationOptions {
    /** Optional domain label to help group diagnostics in logs. */
    readonly domain?: string;
    /** Override for the validator name displayed in diagnostics. */
    readonly guardName?: string;
    /** Optional reason string forwarded to diagnostics. */
    readonly reason?: string;
}

function isSafeParseFailure<T>(
    value: SafeParseLike<T>
): value is Extract<SafeParseLike<T>, { readonly success: false }> {
    return !value.success;
}

function isSafeParseResultFailure<T>(
    value: SafeParseResultLike<T>
): value is Extract<SafeParseResultLike<T>, { readonly success: false }> {
    return !value.success;
}

function describeCandidateType(candidate: unknown): string {
    if (candidate === null) {
        return "null";
    }

    if (Array.isArray(candidate)) {
        return "array";
    }

    return typeof candidate;
}

/**
 * Adapts a Zod-style `safeParse` function to the bridge's {@link SafeParseLike}
 * interface.
 */
export function createSafeParseAdapter<T>(
    safeParse: (candidate: unknown) => SafeParseResultLike<T>
): (candidate: unknown) => SafeParseLike<T> {
    return (candidate): SafeParseLike<T> => {

        const parsed = safeParse(candidate);
        if (!isSafeParseResultFailure(parsed)) {
            return { data: parsed.data, success: true };
        }

        return { error: parsed.error, success: false };
    };
}

/**
 * Runtime validator for boolean IPC responses.
 */
export function safeParseBooleanResult(
    candidate: unknown
): SafeParseLike<boolean> {
    if (typeof candidate === "boolean") {
        return { data: candidate, success: true };
    }


    return {
        error: new Error(
            `Expected boolean response payload, received ${describeCandidateType(candidate)}`
        ),
        success: false,
    };
}

/**
 * Runtime validator for string IPC responses.
 */
export function safeParseStringResult(
    candidate: unknown
): SafeParseLike<string> {
    if (typeof candidate === "string") {
        return { data: candidate, success: true };
    }

    return {
        error: new Error(
            `Expected string response payload, received ${describeCandidateType(candidate)}`
        ),
        success: false,
    };
}

/**
 * Runtime validator for numeric IPC responses.
 */
export function safeParseNumberResult(
    candidate: unknown
): SafeParseLike<number> {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return { data: candidate, success: true };
    }

    return {
        error: new Error(
            `Expected finite number response payload, received ${describeCandidateType(candidate)}`
        ),
        success: false,
    };
}

/**
 * Runtime validator for non-negative integer IPC responses.
 */
export function safeParseNonNegativeIntResult(
    candidate: unknown
): SafeParseLike<number> {
    if (
        typeof candidate === "number" &&
        Number.isFinite(candidate) &&
        Number.isInteger(candidate) &&
        candidate >= 0
    ) {
        return { data: candidate, success: true };
    }

    return {
        error: new Error(
            `Expected non-negative integer response payload, received ${describeCandidateType(candidate)}`
        ),
        success: false,
    };
}

const DIAGNOSTICS_CHANNEL = DIAGNOSTICS_CHANNELS.verifyIpcHandler;

const globalProcessCandidate: unknown = Reflect.get(
    globalThis,
    "process"
) as unknown;
const globalEnvCandidate: unknown =
    typeof globalProcessCandidate === "object" &&
    globalProcessCandidate !== null
        ? (Reflect.get(globalProcessCandidate, "env") as unknown)
        : undefined;

function isTruthyEnvFlag(value: unknown): boolean {
    if (value === true) {
        return true;
    }

    if (typeof value !== "string") {
        return false;
    }

    switch (value.trim().toLowerCase()) {
        case "1":
        case "true":
        case "yes": {
            return true;
        }
        default: {
            return false;
        }
    }
}

function shouldAllowDiagnosticsFallback(): boolean {
    const vitestFlag: unknown =
        typeof globalEnvCandidate === "object" && globalEnvCandidate !== null
            ? (Reflect.get(globalEnvCandidate, "VITEST") as unknown)
            : undefined;
    const nodeEnv: unknown =
        typeof globalEnvCandidate === "object" && globalEnvCandidate !== null
            ? (Reflect.get(globalEnvCandidate, "NODE_ENV") as unknown)
            : undefined;

    const isTestEnv = isTruthyEnvFlag(vitestFlag) || nodeEnv === "test";
    if (!isTestEnv) {
        return false;
    }

    // Test-only override: allow targeted tests to force fallback off.
    const overrideFlag: unknown = Reflect.get(
        globalThis,
        "__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__"
    );

    return overrideFlag !== false;
}

const verifiedChannels = new Set<string>([DIAGNOSTICS_CHANNEL]);
const pendingVerifications = new Map<string, Promise<void>>();

/**
 * @internal Resets
 * verification caches to support deterministic testing.
 */
export function resetDiagnosticsVerificationStateForTesting(): void {
    verifiedChannels.clear();
    verifiedChannels.add(DIAGNOSTICS_CHANNEL);
    pendingVerifications.clear();
}

/**
 * Event callback signature used when registering IPC listeners from the preload
 * bridge.
 */
export type EventCallback = (...args: unknown[]) => void;

/**
 * Function returned by IPC subscription helpers that removes the corresponding
 * listener when invoked.
 */
export type RemoveListener = () => void;

/**
 * Error class for IPC-related errors with enhanced context
 */
export class IpcError extends Error {
    public readonly originalError: Error | undefined;

    public readonly channel: string;

    /**
     * Optional structured metadata that provides additional IPC failure
     * context.
     */
    public readonly details: Readonly<UnknownRecord> | undefined;

    public constructor(
        message: string,
        channel: string,
        originalError?: Error,
        details?: UnknownRecord
    ) {
        super(message, { cause: originalError });
        this.name = "IpcError";
        this.channel = channel;
        this.originalError = originalError;
        this.details = details ? Object.freeze({ ...details }) : undefined;
    }
}

/**
 * Options for IPC invokers created via {@link createTypedInvoker} and
 * {@link createVoidInvoker}.
 */
export interface IpcInvokeOptions {
    /**
     * Client-side invoke timeout in milliseconds.
     *
     * @remarks
     * Electron `ipcRenderer.invoke()` calls are not cancellable, so timing out
     * does not stop the main-process handler. It only prevents the renderer
     * from waiting forever.
     */
    readonly timeoutMs?: number;
}

const DEFAULT_MAX_INVOKE_ARGS_BYTES = 5_000_000;
const MAX_IMPORT_DATA_ARGS_BYTES = MAX_IPC_JSON_IMPORT_BYTES;
const MAX_SQLITE_RESTORE_ARGS_BYTES = MAX_IPC_SQLITE_RESTORE_BYTES;

const DEFAULT_INVOKE_TIMEOUT_MS = 60_000;
const LONG_INVOKE_TIMEOUT_MS = 5 * 60_000;
const DIAGNOSTICS_VERIFY_TIMEOUT_MS = 10_000;

function getInvokeTimeoutMs(channel: string): number {
    switch (channel) {
        case DATA_CHANNELS.downloadSqliteBackup:
        case DATA_CHANNELS.exportData:
        case DATA_CHANNELS.importData:
        case DATA_CHANNELS.restoreSqliteBackup:
        case DATA_CHANNELS.saveSqliteBackup: {
            return LONG_INVOKE_TIMEOUT_MS;
        }
        default: {
            return DEFAULT_INVOKE_TIMEOUT_MS;
        }
    }
}

async function withTimeout<T>(args: {
    readonly onTimeout: () => Error;
    readonly promise: Promise<T>;
    readonly timeoutMs: number;
}): Promise<T> {
    const { onTimeout, promise, timeoutMs } = args;
    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const TIMEOUT = Symbol("timeout");

    try {
        const raced = await Promise.race([
            promise,
            new Promise<typeof TIMEOUT>((resolve) => {
                timeoutId = setTimeout(() => { resolve(TIMEOUT); }, timeoutMs);
            }),
        ]);

        if (raced === TIMEOUT) {
            throw onTimeout();
        }

        return raced as T;
    } finally {
        clearTimeout(timeoutId);
    }
}

function getInvokeArgsByteBudget(channel: string): number {
    switch (channel) {
        case DATA_CHANNELS.importData: {
            return MAX_IMPORT_DATA_ARGS_BYTES;
        }
        case DATA_CHANNELS.restoreSqliteBackup: {
            return MAX_SQLITE_RESTORE_ARGS_BYTES;
        }
        default: {
            return DEFAULT_MAX_INVOKE_ARGS_BYTES;
        }
    }
}

function assertInvokeArgsWithinBudget(
    channel: string,
    args: readonly unknown[]
): void {
    const maxBytes = getInvokeArgsByteBudget(channel);

    if (!isJsonByteBudgetExceeded(args, maxBytes)) {
        return;
    }

    preloadDiagnosticsLogger.warn(
        "[IPC Bridge] Rejected invoke payload (exceeds byte budget)",
        undefined,
        {
            channel,
            maxBytes,
        }
    );

    throw new IpcError(
        `IPC payload too large for channel '${channel}' (max ${maxBytes} bytes)`,
        channel,
        undefined,
        {
            maxBytes,
        }
    );
}

async function verifyChannelOrThrow(channel: string): Promise<void> {
    if (verifiedChannels.has(channel) || channel === DIAGNOSTICS_CHANNEL) {
        return;
    }

    if (shouldAllowDiagnosticsFallback()) {
        verifiedChannels.add(channel);
        return;
    }

    let verification = pendingVerifications.get(channel);

    if (!verification) {
        verification = (async (): Promise<void> => {
            try {
                const rawResponse: unknown = await withTimeout({
                    onTimeout: () =>
                        new IpcError(
                            `Timed out verifying IPC handler for channel '${channel}'`,
                            channel,
                            undefined,
                            {
                                diagnosticsChannel: DIAGNOSTICS_CHANNEL,
                                timeoutMs: DIAGNOSTICS_VERIFY_TIMEOUT_MS,
                            }
                        ),
                    promise: ipcRenderer.invoke(DIAGNOSTICS_CHANNEL, channel),
                    timeoutMs: DIAGNOSTICS_VERIFY_TIMEOUT_MS,
                });

                const verificationResult =
                    extractIpcResponseData<IpcHandlerVerificationResult>(
                        rawResponse
                    );

                if (!isIpcHandlerVerificationResult(verificationResult)) {
                    throw new Error(
                        "Invalid diagnostics verification response"
                    );
                }

                if (!verificationResult.registered) {
                    preloadDiagnosticsLogger.error(
                        `[IPC Bridge] No handler registered for channel '${channel}'.`,
                        undefined,
                        {
                            availableChannels:
                                verificationResult.availableChannels,
                        }
                    );
                    throw new IpcError(
                        `No handler registered for channel '${channel}'`,
                        channel,
                        undefined,
                        {
                            availableChannels:
                                verificationResult.availableChannels,
                        }
                    );
                }

                verifiedChannels.add(channel);
            } catch (error) {
                if (error instanceof IpcError) {
                    throw error;
                }

                const normalizedError = ensureError(error);

                // eslint-disable-next-line ex/use-error-cause -- IpcError constructor preserves original error via dedicated field
                throw new IpcError(
                    `Failed verifying handler for channel '${channel}': ${getUserFacingErrorDetail(
                        error
                    )}`,
                    channel,
                    normalizedError
                );
            } finally {
                pendingVerifications.delete(channel);
            }
        })();

        pendingVerifications.set(channel, verification);
    }

    await verification;
}

/**
 * Invokes an IPC channel with a correlation envelope and normalizes failures
 * into {@link IpcError}.
 *
 * @remarks
 * This helper exists to keep {@link createTypedInvoker} and
 * {@link createVoidInvoker} perfectly aligned, reducing the risk that one code
 * path diverges from the other (e.g., correlation IDs added to one but not the
 * other).
 */
async function invokeWithValidation<T>(
    channel: string,
    invoke: (
        correlationId: ReturnType<typeof generateCorrelationId>
    ) => Promise<unknown>,
    validate: (response: unknown) => T,
    options?: IpcInvokeOptions
): Promise<T> {
    await verifyChannelOrThrow(channel);

    try {
        const correlationId = generateCorrelationId();
        const timeoutMs = options?.timeoutMs ?? getInvokeTimeoutMs(channel);
        const response = await withTimeout({
            onTimeout: () =>
                new IpcError(
                    `IPC call timed out after ${timeoutMs}ms for channel '${channel}'`,
                    channel,
                    undefined,
                    {
                        correlationId,
                        timeoutMs,
                    }
                ),
            promise: invoke(correlationId),
            timeoutMs,
        });
        return validate(response);
    } catch (error) {
        const errorMessage = getUserFacingErrorDetail(error);
        const normalizedError = ensureError(error);
        // eslint-disable-next-line ex/use-error-cause -- Using custom IpcError class with cause handling
        throw new IpcError(
            `IPC call failed for channel '${channel}': ${errorMessage}`,
            channel,
            normalizedError
        );
    }
}

/**
 * Creates a typed IPC invoker function
 *
 * @param channel - The IPC channel name
 *
 * @returns A function that safely invokes the IPC channel with validation
 */
export function createTypedInvoker<TChannel extends IpcInvokeChannel>(
    channel: TChannel,
    options?: IpcInvokeOptions
): (
    ...args: IpcInvokeChannelParams<TChannel>
) => Promise<IpcInvokeChannelResult<TChannel>> {
    // Some IPC channels legitimately return `undefined` as a successful result
    // (e.g. optional lookups). The main process standard helper
    // `createSuccessResponse` omits the `data` field when the value is
    // `undefined`, so the typed invoker must not require a `data` field for
    // those channels.
    const requireData = channel !== MONITORING_CHANNELS.checkSiteNow;

    return async function invokeTypedChannel(
        ...args: IpcInvokeChannelParams<TChannel>
    ): Promise<IpcInvokeChannelResult<TChannel>> {
        assertInvokeArgsWithinBudget(channel, args);

        return invokeWithValidation(
            channel,
            (correlationId) =>
                ipcRenderer.invoke(
                    channel,
                    ...args,
                    createIpcCorrelationEnvelope(correlationId)
                ),
            (response) =>
                extractIpcResponseData<IpcInvokeChannelResult<TChannel>>(
                    response,
                    { requireData }
                ),
            options
        );
    };
}

/**
 * Creates a typed IPC invoker that returns void
 *
 * @param channel - The IPC channel name
 *
 * @returns A function that safely invokes the IPC channel and validates void
 *   response
 */
export function createVoidInvoker<TChannel extends VoidIpcInvokeChannel>(
    channel: TChannel,
    options?: IpcInvokeOptions
): (...args: IpcInvokeChannelParams<TChannel>) => Promise<void> {
    return async function invokeVoidChannel(
        ...args: IpcInvokeChannelParams<TChannel>
    ): Promise<void> {
        assertInvokeArgsWithinBudget(channel, args);

        await invokeWithValidation(
            channel,
            (correlationId) =>
                ipcRenderer.invoke(
                    channel,
                    ...args,
                    createIpcCorrelationEnvelope(correlationId)
                ),
            (response) => {
                validateVoidIpcResponse(response);
            },
            options
        );
    };
}

/**
 * Creates a typed IPC invoker that additionally validates the successful
 * response payload.
 *
 * @remarks
 * The main process is generally trusted, but this adds defense-in-depth against
 * malformed payloads caused by:
 *
 * - Handler bugs/regressions,
 * - Database corruption producing invalid domain objects,
 * - Version skew during development hot reload.
 *
 * When validation fails, this helper:
 *
 * 1. Logs a structured warning in preload diagnostics,
 * 2. Forwards a diagnostics report to the main process,
 * 3. Throws an {@link IpcError} so the renderer can surface the failure.
 */
export function createValidatedInvoker<TChannel extends IpcInvokeChannel>(
    channel: TChannel,
    validateResult: (
        candidate: unknown
    ) => SafeParseLike<IpcInvokeChannelResult<TChannel>>,
    options: ResultValidationOptions = {}
): (
    ...args: IpcInvokeChannelParams<TChannel>
) => Promise<IpcInvokeChannelResult<TChannel>> {
    const invoke = createTypedInvoker(channel);

    return async (
        ...args: IpcInvokeChannelParams<TChannel>
    ): Promise<IpcInvokeChannelResult<TChannel>> => {
        const result = await invoke(...args);
        const parsed = validateResult(result);

        if (!isSafeParseFailure(parsed)) {
            return parsed.data;
        }

        const guardName =
            options.guardName ??
            (validateResult.name.length > 0
                ? validateResult.name
                : "anonymous");
        const domain = options.domain ?? "preload";
        const payloadPreview = buildPayloadPreview(result);
        const normalizedError = ensureError(parsed.error);

        preloadDiagnosticsLogger.warn(
            "[IPC Bridge] Rejected malformed response payload",
            {
                channel,
                domain,
                guard: guardName,
                payloadType: Array.isArray(result) ? "array" : typeof result,
                ...(payloadPreview ? { payloadPreview } : {}),
                reason: options.reason ?? "response-validation",
            }
        );

        preloadDiagnosticsLogger.debug(
            "[IPC Bridge] Response validation failure details",
            normalizedError
        );

        void reportPreloadGuardFailure({
            channel,
            guard: guardName,
            metadata: {
                domain,
                phase: "invoke-result-validation",
            },
            ...(payloadPreview ? { payloadPreview } : {}),
            reason: options.reason ?? "response-validation",
        });

        throw new IpcError(
            `IPC response payload failed validation for channel '${channel}'`,
            channel,
            normalizedError,
            {
                domain,
                guard: guardName,
            }
        );
    };
}

/**
 * Creates an event listener manager for IPC events
 *
 * @param channel - The event channel name
 *
 * @returns Object with methods to manage event listeners
 */
export function createEventManager(channel: string): {
    on: (callback: EventCallback) => RemoveListener;
    once: (callback: EventCallback) => RemoveListener;
    removeAll: () => void;
} {
    const registeredHandlers = new Set<
        (_event: IpcRendererEvent, ...args: unknown[]) => void
    >();

    const invokeSafely = (callback: EventCallback, args: unknown[]): void => {
        try {
            // eslint-disable-next-line n/callback-return -- Event handler callback, no return needed
            callback(...args);
        } catch (error) {
            // Log callback errors but don't propagate them to prevent event system crashes.
            const normalizedError = ensureError(error);
            preloadLogger.warn("Event callback error", {
                channel,
                error: normalizedError,
            });
        }
    };

    const removeRegisteredHandler = (
        handler: (_event: IpcRendererEvent, ...args: unknown[]) => void
    ): void => {
        if (!registeredHandlers.delete(handler)) {
            return;
        }

        ipcRenderer.removeListener(channel, handler);
    };

    const shouldRegisterCallback = (
        callback: unknown,
        mode: "on" | "once"
    ): callback is EventCallback => {
        if (typeof callback === "function") {
            return true;
        }

        // Defense-in-depth: the renderer can still call this API with invalid
        // values at runtime. Rejecting here avoids permanently registering a
        // listener that would spam diagnostics on every event.
        preloadDiagnosticsLogger.warn(
            "[IPC Bridge] Rejected non-function event callback",
            {
                callbackType: typeof callback,
                channel,
                mode,
            }
        );

        return false;
    };

    return {
        /**
         * Add an event listener
         */
        on: (callback: EventCallback): RemoveListener => {
            if (!shouldRegisterCallback(callback, "on")) {
                return (): void => {
                    // No-op: listener was not registered.
                };
            }

            const handleEventCallback = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ): void => {
                invokeSafely(callback, args);
            };
            registeredHandlers.add(handleEventCallback);
            ipcRenderer.on(channel, handleEventCallback);
            return (): void => {
                removeRegisteredHandler(handleEventCallback);
            };
        },

        /**
         * Add a one-time event listener
         */
        once: (callback: EventCallback): RemoveListener => {
            if (!shouldRegisterCallback(callback, "once")) {
                return (): void => {
                    // No-op: listener was not registered.
                };
            }

            const handleEventCallback = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ): void => {
                removeRegisteredHandler(handleEventCallback);
                invokeSafely(callback, args);
            };

            registeredHandlers.add(handleEventCallback);
            ipcRenderer.once(channel, handleEventCallback);

            return (): void => {
                removeRegisteredHandler(handleEventCallback);
            };
        },

        /**
         * Remove all listeners for this channel
         */
        removeAll: (): void => {
            for (const handler of registeredHandlers) {
                ipcRenderer.removeListener(channel, handler);
            }
            registeredHandlers.clear();
        },
    };
}
