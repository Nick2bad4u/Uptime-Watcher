/**
 * Standardized IPC response interface for consistent API communication. All IPC
 * handlers should return responses following this structure.
 */

import type {
    IpcResponse as SharedIpcResponse,
    IpcValidationResponse as SharedIpcValidationResponse,
} from "@shared/types/ipc";

/**
 * Canonical IPC response shape used by Electron IPC handlers.
 *
 * @typeParam T - Payload type carried by a successful IPC response.
 */
export type IpcResponse<T = unknown> = SharedIpcResponse<T>;

/**
 * Validation response shape returned when IPC parameter validation runs before
 * invoking a handler.
 */
export type IpcValidationResponse = SharedIpcValidationResponse;

/**
 * Parameters for IPC handler wrapper configuration.
 *
 * @public
 */
export interface IpcHandlerConfig<
    TParams extends readonly unknown[] = readonly unknown[],
    TResult = unknown,
> {
    /** Channel name for the IPC handler */
    channelName: string;
    /** The actual handler function */
    handler: (...args: TParams) => Promise<TResult> | TResult;
    /** Optional parameter validation function */
    validateParams?: IpcParameterValidator;
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

/**
 * Function signature for validating IPC parameter arrays prior to handler
 * execution.
 */
export type IpcParameterValidator = (
    params: readonly unknown[]
) => null | string[];
