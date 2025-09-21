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
 * Configuration for an IPC channel
 */
export interface ChannelConfig<TInput = unknown[], TOutput = unknown> {
    /** The IPC channel name */
    channel: string;
    /** Whether this channel requires parameters */
    hasParameters?: boolean;
    /** Input parameter types (for TypeScript inference) */
    inputTypes?: TInput;
    /** Method name to expose in the API */
    methodName: string;
    /** Output type (for TypeScript inference) */
    outputType?: TOutput;
}

/**
 * Error class for IPC-related errors with enhanced context
 */
export class IpcError extends Error {
    public readonly originalError: Error | undefined;

    public readonly channel: string;

    public constructor(
        message: string,
        channel: string,
        originalError?: Error
    ) {
        super(message);
        this.name = "IpcError";
        this.channel = channel;
        this.originalError = originalError;
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
 * Converts kebab-case channel names to camelCase method names
 *
 * @param channel - Channel name in kebab-case
 *
 * @returns Method name in camelCase
 */
function convertChannelToCamelCase(channel: string): string {
    return channel
        .split("-")
        .map((part, index) =>
            index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("");
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
export function createTypedInvoker<TOutput>(
    channel: string
): (...args: unknown[]) => Promise<TOutput> {
    return async (...args: unknown[]): Promise<TOutput> => {
        try {
            const response: unknown = await ipcRenderer.invoke(
                channel,
                ...args
            );
            return validateIpcResponse<TOutput>(response);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
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
export function createVoidInvoker(
    channel: string
): (...args: unknown[]) => Promise<void> {
    return async (...args: unknown[]): Promise<void> => {
        try {
            const response: unknown = await ipcRenderer.invoke(
                channel,
                ...args
            );
            validateVoidIpcResponse(response);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
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
                callback(...args);
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
            ipcRenderer.once(channel, (_event, ...args) => {
                callback(...args);
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

/**
 * Utility function to create channel configuration objects
 *
 * @param channel - IPC channel name
 * @param methodName - Method name for the API (defaults to camelCase of
 *   channel)
 * @param outputType - Expected output type (for TypeScript inference)
 *
 * @returns Channel configuration object
 */
export function defineChannel<TOutput = unknown>(
    channel: string,
    methodName?: string,
    outputType?: TOutput
): ChannelConfig<unknown[], TOutput> {
    return {
        channel,
        methodName: methodName ?? convertChannelToCamelCase(channel),
        ...(outputType !== undefined && { outputType }),
        hasParameters: false, // This would be detected automatically in full implementation
    };
}

/**
 * Creates a domain-specific API bridge from channel configurations
 *
 * @param channels - Array of channel configurations for the domain
 *
 * @returns Object with typed methods for each channel
 */
export function createDomainBridge<
    TChannels extends Record<string, ChannelConfig>,
>(
    channels: TChannels
): Record<string, (...args: unknown[]) => Promise<unknown>> {
    const api: Record<string, (...args: unknown[]) => Promise<unknown>> = {};

    for (const [methodName, config] of Object.entries(channels)) {
        if (config.outputType === undefined) {
            // Void return type
            api[methodName] = createVoidInvoker(config.channel) as (
                ...args: unknown[]
            ) => Promise<unknown>;
        } else {
            // Typed return type
            api[methodName] = createTypedInvoker(config.channel) as (
                ...args: unknown[]
            ) => Promise<unknown>;
        }
    }

    return api;
}
