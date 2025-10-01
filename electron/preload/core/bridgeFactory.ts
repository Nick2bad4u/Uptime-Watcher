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
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    IpcInvokeChannelResult,
    VoidIpcInvokeChannel,
} from "@shared/types/ipc";
import type { IpcRendererEvent } from "electron";

import { ipcRenderer } from "electron";

/**
 * Standard IPC response interface matching backend implementation
 */
export interface IpcResponse<T = unknown> {
    data?: T;
    error?: string;
    metadata?: Record<string, unknown>;
    success: boolean;
}

/**
 * Event listener management types
 */
export type EventCallback = (...args: unknown[]) => void;
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
    public readonly details: Readonly<Record<string, unknown>> | undefined;

    public constructor(
        message: string,
        channel: string,
        originalError?: Error,
        details?: Record<string, unknown>
    ) {
        super(message, { cause: originalError });
        this.name = "IpcError";
        this.channel = channel;
        this.originalError = originalError;
        this.details = details ? Object.freeze({ ...details }) : undefined;
    }
}

/**
 * Type guard for IPC response validation
 *
 * @param value - Value to check
 *
 * @returns True if value is a valid IPC response
 */
function isIpcResponse(value: unknown): value is IpcResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        typeof (value as { success: unknown }).success === "boolean"
    );
}

/**
 * Validates and extracts data from IPC response with proper error handling
 *
 * @param response - Raw IPC response from main process
 *
 * @returns Validated data from the response
 *
 * @throws Error if response is invalid or operation failed
 */
// eslint-disable-next-line etc/no-misused-generics, @typescript-eslint/no-unnecessary-type-parameters -- Type parameter T is provided by caller for return type
function validateIpcResponse<T>(response: unknown): T {
    if (!isIpcResponse(response)) {
        throw new Error(
            "Invalid IPC response format - missing required properties"
        );
    }

    if (!response.success) {
        throw new Error(
            response.error ?? "IPC operation failed without error message"
        );
    }

    if (response.data === undefined) {
        throw new Error("IPC response missing data field");
    }

    // Type assertion is necessary here as we cannot validate the actual data type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- IPC response validation ensures structure but not data type
    return response.data as T;
}

/**
 * Validates IPC response for void operations
 *
 * @param response - Raw IPC response from main process
 *
 * @throws Error if response is invalid or operation failed
 */
function validateVoidIpcResponse(response: unknown): void {
    if (!isIpcResponse(response)) {
        throw new Error(
            "Invalid IPC response format - missing required properties"
        );
    }

    if (!response.success) {
        throw new Error(
            response.error ?? "IPC operation failed without error message"
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
    return async function invokeTypedChannel(
        ...args: IpcInvokeChannelParams<TChannel>
    ): Promise<IpcInvokeChannelResult<TChannel>> {
        try {
            const response: unknown = await ipcRenderer.invoke(
                channel,
                ...args
            );
            return validateIpcResponse<IpcInvokeChannelResult<TChannel>>(
                response
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            // eslint-disable-next-line ex/use-error-cause -- Using custom IpcError class with cause handling
            throw new IpcError(
                `IPC call failed for channel '${channel}': ${errorMessage}`,
                channel,
                error instanceof Error ? error : undefined
            );
        }
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
        try {
            const response: unknown = await ipcRenderer.invoke(
                channel,
                ...args
            );
            validateVoidIpcResponse(response);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            // eslint-disable-next-line ex/use-error-cause -- Using custom IpcError class with cause handling
            throw new IpcError(
                `IPC call failed for channel '${channel}': ${errorMessage}`,
                channel,
                error instanceof Error ? error : undefined
            );
        }
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
    return {
        /**
         * Add an event listener
         */
        on: (callback: EventCallback): RemoveListener => {
            const handleEventCallback = (
                _event: IpcRendererEvent,
                ...args: unknown[]
            ): void => {
                try {
                    // eslint-disable-next-line n/callback-return -- Event handler callback, no return needed
                    callback(...args);
                } catch (error) {
                    // Log callback errors but don't propagate them to prevent event system crashes
                    console.warn("Event callback error:", error);
                }
            };
            ipcRenderer.on(channel, handleEventCallback);
            return (): void => {
                ipcRenderer.removeListener(channel, handleEventCallback);
            };
        },

        /**
         * Add a one-time event listener
         */
        once: (callback: EventCallback): void => {
            ipcRenderer.once(channel, (_event, ...args: unknown[]) => {
                try {
                    // eslint-disable-next-line n/callback-return -- Event handler callback, no return needed
                    callback(...args);
                } catch (error) {
                    // Log callback errors but don't propagate them to prevent event system crashes
                    console.warn("Event callback error:", error);
                }
            });
        },

        /**
         * Remove all listeners for this channel
         */
        removeAll: (): void => {
            ipcRenderer.removeAllListeners(channel);
        },
    };
}
