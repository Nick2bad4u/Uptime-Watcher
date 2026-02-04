/**
 * Standardized IPC response interface for consistent API communication. All IPC
 * handlers should return responses following this structure.
 */

import type { IpcResponse as SharedIpcResponse } from "@shared/types/ipc";

/**
 * Canonical IPC response shape used by Electron IPC handlers.
 *
 * @typeParam T - Payload type carried by a successful IPC response.
 */
export type IpcResponse<T = unknown> = SharedIpcResponse<T>;

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

/**
 * Validates an IPC handler's _success_ payload.
 *
 * @remarks
 * This follows the same convention as {@link IpcParameterValidator}: return
 * `null` for success or an array of error strings for failure.
 */
export type IpcResultValidator<TResult> = (
    result: TResult
) => ReturnType<IpcParameterValidator>;
