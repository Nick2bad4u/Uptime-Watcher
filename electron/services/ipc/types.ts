/**
 * Standardized IPC response interface for consistent API communication. All IPC
 * handlers should return responses following this structure.
 */

import type {
    IpcResponse as SharedIpcResponse,
    IpcValidationResponse as SharedIpcValidationResponse,
} from "@shared/types/ipc";

export type IpcResponse<T = unknown> = SharedIpcResponse<T>;
export type IpcValidationResponse = SharedIpcValidationResponse;

/**
 * Parameters for IPC handler wrapper configuration.
 *
 * @public
 */
export interface IpcHandlerConfig<TParams = unknown[], TResult = unknown> {
    /** Channel name for the IPC handler */
    channelName: string;
    /** The actual handler function */
    handler: (...args: TParams[]) => Promise<TResult> | TResult;
    /** Optional parameter validation function */
    validateParams?: (params: unknown[]) => null | string[];
}

/**
 * Validation function type for IPC parameters.
 *
 * @param params - The parameters to validate
 *
 * @returns Array of error messages, or null if validation passes
 *
 * @public
 */

export type IpcParameterValidator = (params: unknown[]) => null | string[];
