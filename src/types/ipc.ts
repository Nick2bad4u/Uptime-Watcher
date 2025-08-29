/**
 * IPC response type definitions and utilities for type-safe frontend-backend
 * communication.
 *
 * @remarks
 * This module provides TypeScript interfaces and utility functions that mirror
 * the backend IpcResponse interface, ensuring type safety across the Electron
 * IPC boundary. All standardized IPC handlers in the application return
 * responses in the defined format.
 *
 * The module includes:
 *
 * - Standardized response format interface
 * - Type guards for runtime type checking
 * - Data extraction utilities with error handling
 * - Safe fallback mechanisms for failed operations
 *
 * These utilities are essential for maintaining type safety when communicating
 * between the renderer process (frontend) and main process (backend) in the
 * Electron application.
 *
 * @example
 *
 * ```typescript
 * // Type-safe IPC response handling
 * const response = await window.electronAPI.getSites();
 * if (isIpcResponse<Site[]>(response)) {
 *     const sites = extractIpcData<Site[]>(response);
 *     setSites(sites);
 * }
 *
 * // Safe extraction with fallback
 * const sites = safeExtractIpcData(response, []);
 * ```
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

/**
 * Standardized IPC response format.
 *
 * @typeParam T - The type of data returned on success
 *
 * @public
 */
export interface IpcResponse<T> {
    /** Response data when successful */
    data?: T;
    /** Error message when operation fails */
    error?: string;
    /** Additional operation metadata */
    metadata?: UnknownRecord;
    /** Indicates whether the operation was successful */
    success: boolean;
    /** Non-critical warnings */
    warnings?: readonly string[];
}

/**
 * Type guard to check if a value is an IPC response.
 *
 * @param value - The value to check
 *
 * @returns True if the value is an IPC response
 *
 * @public
 */
// eslint-disable-next-line etc/no-misused-generics -- Type parameter must be explicitly provided for type guard
export function isIpcResponse<T>(value: unknown): value is IpcResponse<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        typeof (value as { success: unknown }).success === "boolean"
    );
}

/**
 * Extracts data from an IPC response or throws an error.
 *
 * @param response - The IPC response to extract data from
 *
 * @returns The data from the response
 *
 * @throws Error if the response indicates failure
 *
 * @public
 */
// eslint-disable-next-line etc/no-misused-generics, @typescript-eslint/no-unnecessary-type-parameters -- Type parameter must be explicitly provided for type assertion
export function extractIpcData<T>(response: unknown): T {
    if (!isIpcResponse<T>(response)) {
        throw new Error(ERROR_CATALOG.ipc.INVALID_RESPONSE_FORMAT);
    }

    if (!response.success) {
        throw new Error(
            response.error ?? ERROR_CATALOG.ipc.IPC_OPERATION_FAILED
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type T is provided by caller who knows the expected response data type
    return response.data as T;
}

/**
 * Safely handles IPC responses with fallback values.
 *
 * @param response - The IPC response
 * @param fallback - Fallback value if operation failed
 *
 * @returns The data or fallback value
 *
 * @public
 */
export function safeExtractIpcData<T>(response: unknown, fallback: T): T {
    try {
        return extractIpcData<T>(response);
    } catch {
        return fallback;
    }
}
