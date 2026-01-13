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
    IpcResponse as SharedIpcResponse,
    VoidIpcInvokeChannel,
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
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { ipcRenderer } from "electron";

import { isJsonByteBudgetExceeded } from "../../utils/jsonByteBudget";
import {
    preloadDiagnosticsLogger,
    preloadLogger,
} from "../utils/preloadLogger";

/**
 * Canonical IPC response shape used by the preload bridge.
 *
 * @typeParam T - Payload type carried by a successful IPC response.
 */
export type IpcResponse<T = unknown> = SharedIpcResponse<T>;

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
 * @internal
 * Resets verification caches to support deterministic testing.
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

const DEFAULT_MAX_INVOKE_ARGS_BYTES = 5_000_000;
const MAX_IMPORT_DATA_ARGS_BYTES = MAX_IPC_JSON_IMPORT_BYTES;
const MAX_SQLITE_RESTORE_ARGS_BYTES = MAX_IPC_SQLITE_RESTORE_BYTES;

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
                const rawResponse: unknown = await ipcRenderer.invoke(
                    DIAGNOSTICS_CHANNEL,
                    channel
                );

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
    validate: (response: unknown) => T
): Promise<T> {
    await verifyChannelOrThrow(channel);

    try {
        const correlationId = generateCorrelationId();
        const response = await invoke(correlationId);
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
    channel: TChannel
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
                )
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
    channel: TChannel
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
    once: (callback: EventCallback) => void;
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

    return {
        /**
         * Add an event listener
         */
        on: (callback: EventCallback): RemoveListener => {
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
        once: (callback: EventCallback): void => {
            const handleEventCallback = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ): void => {
                removeRegisteredHandler(handleEventCallback);
                invokeSafely(callback, args);
            };

            registeredHandlers.add(handleEventCallback);
            ipcRenderer.on(channel, handleEventCallback);
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
