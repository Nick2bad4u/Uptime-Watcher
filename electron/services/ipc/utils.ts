/**
 * Standardized IPC handler utilities for consistent response formatting and error handling.
 * Provides wrapper functions and utilities for creating type-safe, consistent IPC handlers.
 */

import { ipcMain } from "electron";

import { isNonEmptyString } from "../../../shared/validation/validatorUtils";
import type { IpcParameterValidator, IpcResponse, IpcValidationResponse } from "./types";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";

/**
 * Standard parameter validation utilities for common IPC operations.
 *
 * @public
 */
export const IpcValidators = {
    /**
     * Validates an optional string parameter using validator.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     * @returns Error message or null if valid
     */
    optionalString: (value: unknown, paramName: string): null | string => {
        if (value !== undefined && !isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string when provided`;
        }
        return null;
    },

    /**
     * Validates a required number parameter.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     * @returns Error message or null if valid
     */
    requiredNumber: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "number" || Number.isNaN(value)) {
            return `${paramName} must be a valid number`;
        }
        return null;
    },

    /**
     * Validates a required object parameter.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     * @returns Error message or null if valid
     */
    requiredObject: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            return `${paramName} must be a valid object`;
        }
        return null;
    },

    /**
     * Validates a required string parameter using validator.
     *
     * @param value - Value to validate
     * @param paramName - Parameter name for error messages
     * @returns Error message or null if valid
     */
    requiredString: (value: unknown, paramName: string): null | string => {
        if (!isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string`;
        }
        return null;
    },
} as const;

/**
 * Creates a standardized error response.
 *
 * @param error - Error message
 * @param metadata - Optional metadata
 * @returns Standardized IPC error response
 *
 * @public
 */
export function createErrorResponse<T = void>(error: string, metadata?: Record<string, unknown>): IpcResponse<T> {
    const response: IpcResponse<T> = {
        error,
        success: false,
    };

    if (metadata !== undefined) {
        response.metadata = metadata;
    }

    return response;
}

/**
 * Creates a standardized success response.
 *
 * @param data - The response data
 * @param metadata - Optional metadata
 * @param warnings - Optional warnings
 * @returns Standardized IPC success response
 *
 * @public
 */
export function createSuccessResponse<T>(
    data?: T,
    metadata?: Record<string, unknown>,
    warnings?: string[]
): IpcResponse<T> {
    const response: IpcResponse<T> = {
        success: true,
    };

    if (data !== undefined) {
        response.data = data;
    }

    if (metadata !== undefined) {
        response.metadata = metadata;
    }

    if (warnings !== undefined && warnings.length > 0) {
        response.warnings = warnings;
    }

    return response;
}

/**
 * Creates a standardized validation response for backward compatibility.
 *
 * @param success - Whether validation passed
 * @param errors - Validation errors
 * @param warnings - Validation warnings
 * @param metadata - Additional metadata
 * @returns Standardized validation response
 *
 * @public
 */
export function createValidationResponse(
    success: boolean,
    errors: string[] = [],
    warnings: string[] = [],
    metadata: Record<string, unknown> = {}
): IpcValidationResponse {
    return {
        errors,
        metadata,
        success,
        warnings,
    };
}

/**
 * Registers a standardized IPC handler with consistent error handling and response formatting.
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function
 * @param validateParams - Optional parameter validation function
 * @param registeredHandlers - Set to track registered handlers for cleanup
 *
 * @remarks
 * Registers an IPC handler with the electron ipcMain, automatically wrapping it with
 * standardized error handling, logging, and response formatting. All responses will
 * follow the IpcResponse interface for consistency.
 *
 * @example
 * ```typescript
 * registerStandardizedIpcHandler(
 *   "get-sites",
 *   async () => this.uptimeOrchestrator.getSites(),
 *   null,
 *   this.registeredIpcHandlers
 * );
 * ```
 *
 * @public
 */
export function registerStandardizedIpcHandler<T>(
    channelName: string,
    handler: (...args: unknown[]) => Promise<T> | T,
    validateParams: IpcParameterValidator | null,
    registeredHandlers: Set<string>
): void {
    registeredHandlers.add(channelName);

    ipcMain.handle(channelName, async (_, ...args: unknown[]) => {
        return validateParams
            ? withIpcHandlerValidation(channelName, handler, validateParams, args)
            : withIpcHandler(channelName, () => handler(...args));
    });
}

/**
 * Wraps an IPC handler with standardized error handling, logging, and response formatting.
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function to wrap
 * @returns The wrapped handler result
 *
 * @remarks
 * Provides consistent error handling, logging, and response formatting for all IPC handlers.
 * Automatically logs handler execution and errors, validates parameters if provided,
 * and ensures all responses follow the standardized format.
 *
 * @example
 * ```typescript
 * const result = await withIpcHandler(
 *   "get-sites",
 *   async () => this.uptimeOrchestrator.getSites()
 * );
 * ```
 *
 * @public
 */
export async function withIpcHandler<T>(channelName: string, handler: () => Promise<T> | T): Promise<IpcResponse<T>> {
    const startTime = Date.now();

    try {
        // Reduce logging spam for high-frequency operations
        const isHighFrequencyOperation = ["format-monitor-detail", "get-monitor-types"].includes(channelName);

        if (isDev() && !isHighFrequencyOperation) {
            logger.debug(`[IpcHandler] Starting ${channelName}`);
        }

        const result = await handler();
        const duration = Date.now() - startTime;

        if (isDev() && !isHighFrequencyOperation) {
            logger.debug(`[IpcHandler] Completed ${channelName}`, { duration });
        }

        return createSuccessResponse(result, { duration, handler: channelName });
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        logger.error(`[IpcHandler] Failed ${channelName}`, {
            duration,
            error: errorMessage,
            handler: channelName,
        });

        return createErrorResponse<T>(errorMessage, { duration, handler: channelName });
    }
}

/**
 * Wraps an IPC handler with parameter validation, standardized error handling, and response formatting.
 *
 * @param channelName - Name of the IPC channel
 * @param handler - The handler function to wrap
 * @param validateParams - Parameter validation function
 * @param params - The parameters to validate and pass to the handler
 * @returns The wrapped handler result
 *
 * @remarks
 * Extended version of withIpcHandler that includes parameter validation.
 * Validates parameters before executing the handler and provides detailed error messages.
 *
 * @example
 * ```typescript
 * const result = await withIpcHandlerValidation(
 *   "add-site",
 *   async (site: Site) => this.uptimeOrchestrator.addSite(site),
 *   (params) => IpcValidators.requiredObject(params[0], "site"),
 *   [siteData]
 * );
 * ```
 *
 * @public
 */
export async function withIpcHandlerValidation<T>(
    channelName: string,
    handler: (...args: unknown[]) => Promise<T> | T,
    validateParams: IpcParameterValidator,
    params: unknown[]
): Promise<IpcResponse<T>> {
    const startTime = Date.now();

    try {
        // Reduce logging spam for high-frequency operations
        const isHighFrequencyOperation = ["format-monitor-detail", "get-monitor-types"].includes(channelName);

        if (isDev() && !isHighFrequencyOperation) {
            logger.debug(`[IpcHandler] Starting ${channelName}`, { paramCount: params.length });
        }

        // Validate parameters
        const validationErrors = validateParams(params);
        if (validationErrors) {
            const errorMessage = `Parameter validation failed: ${validationErrors.join(", ")}`;
            logger.warn(`[IpcHandler] Validation failed ${channelName}`, { errors: validationErrors });
            return createErrorResponse<T>(errorMessage, { handler: channelName, validationErrors });
        }

        const result = await handler(...params);
        const duration = Date.now() - startTime;

        if (isDev() && !isHighFrequencyOperation) {
            logger.debug(`[IpcHandler] Completed ${channelName}`, { duration });
        }

        return createSuccessResponse(result, { duration, handler: channelName });
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        logger.error(`[IpcHandler] Failed ${channelName}`, {
            duration,
            error: errorMessage,
            handler: channelName,
        });

        return createErrorResponse<T>(errorMessage, { duration, handler: channelName });
    }
}
