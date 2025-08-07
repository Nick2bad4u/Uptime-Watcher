/**
 * IPC Response type definitions for frontend-backend communication.
 *
 * @remarks
 * These types mirror the backend IpcResponse interface to ensure type safety
 * across the IPC boundary. All standardized IPC handlers return responses
 * in this format.
 */

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
    metadata?: Record<string, unknown>;
    /** Indicates whether the operation was successful */
    success: boolean;
    /** Non-critical warnings */
    warnings?: string[];
}

/**
 * Extracts data from an IPC response or throws an error.
 *
 * @param response - The IPC response to extract data from
 * @returns The data from the response
 * @throws Error if the response indicates failure
 *
 * @public
 */
export function extractIpcData<T>(response: unknown): T {
    if (!isIpcResponse<T>(response)) {
        throw new Error(ERROR_CATALOG.ipc.INVALID_RESPONSE_FORMAT);
    }

    if (!response.success) {
        throw new Error(
            response.error ?? ERROR_CATALOG.ipc.IPC_OPERATION_FAILED
        );
    }

    return response.data as T;
}

/**
 * Type guard to check if a value is an IPC response.
 *
 * @param value - The value to check
 * @returns True if the value is an IPC response
 *
 * @public
 */
export function isIpcResponse<T>(value: unknown): value is IpcResponse<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        typeof (value as { success: unknown }).success === "boolean"
    );
}

/**
 * Safely handles IPC responses with fallback values.
 *
 * @param response - The IPC response
 * @param fallback - Fallback value if operation failed
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
