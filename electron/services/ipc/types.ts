/**
 * Standardized IPC response interface for consistent API communication. All IPC
 * handlers should return responses following this structure.
 */

import type { ValidationResult } from "@shared/types/validation";

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
 * Base IPC response interface for consistent communication between main and
 * renderer processes.
 *
 * @remarks
 * Provides a standardized structure for all IPC handler responses, ensuring
 * consistent error handling and data format across the application. All IPC
 * handlers should use this response format.
 *
 * @example
 *
 * ```typescript
 * // Success response
 * const response: IpcResponse<Site[]> = {
 *     success: true,
 *     data: sites,
 * };
 *
 * // Error response
 * const response: IpcResponse<void> = {
 *     success: false,
 *     error: "Failed to retrieve sites",
 * };
 * ```
 *
 * @public
 */
export interface IpcResponse<T = unknown> {
    /** The response data when operation succeeds */
    data?: T;
    /** Error message when operation fails */
    error?: string;
    /** Additional metadata about the operation */
    metadata?: Record<string, unknown>;
    /** Indicates if the operation was successful */
    success: boolean;
    /** Non-critical warnings about the operation */
    warnings?: string[];
}

/**
 * Validation result interface specifically for monitor validation operations.
 *
 * @remarks
 * Extends the base IpcResponse pattern for monitor validation-specific
 * operations.
 *
 * @public
 */
export interface IpcValidationResponse extends IpcResponse<ValidationResult> {
    /** List of validation errors (required for validation responses) */
    errors: string[];
    /** Whether validation passed (required for validation responses) */
    success: boolean;
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
// eslint-disable-next-line etc/prefer-interface -- Function type is simpler for validation callbacks
export type IpcParameterValidator = (params: unknown[]) => null | string[];
