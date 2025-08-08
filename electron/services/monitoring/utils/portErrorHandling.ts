/**
 * Utilities and types for standardized error handling in port monitoring operations.
 *
 * @remarks
 * This module provides error constants, result structures, and helper functions for handling
 * port connectivity failures in a consistent, type-safe manner. It is used by the Electron backend
 * to communicate port check errors to the frontend, preserving timing and diagnostic information.
 *
 * @see {@link PortCheckError}
 * @see {@link PortCheckErrorResult}
 * @see {@link handlePortCheckError}
 * @public
 */

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

/**
 * Standardized error message for port connectivity failures.
 *
 * @remarks
 * Used throughout port monitoring utilities to ensure consistent error reporting and handling.
 *
 * @public
 */
export const PORT_NOT_REACHABLE = "Port not reachable";

/**
 * Result structure for a failed port check operation.
 *
 * @remarks
 * Used to communicate port check failures to the frontend in a standardized, type-safe format.
 *
 * @example
 * ```typescript
 * {
 *   details: "443",
 *   error: "Port not reachable",
 *   responseTime: 1200,
 *   status: "down"
 * }
 * ```
 *
 * @see {@link handlePortCheckError}
 * @public
 */
export interface PortCheckErrorResult {
    /**
     * The port number that was being checked, as a string.
     * @public
     */
    details: string;
    /**
     * Standardized error message for frontend consumption.
     * @remarks
     * Typically {@link PORT_NOT_REACHABLE} or a system error message.
     * @public
     */
    error: string;
    /**
     * Response time in milliseconds, or -1 if measurement failed.
     * @remarks
     * Used for diagnostics and retry/backoff strategies.
     * @public
     */
    responseTime: number;
    /**
     * Always the string literal "down" for error results.
     * @public
     */
    status: "down";
}

/**
 * Custom error class for port connectivity failures, preserving response time information.
 *
 * @remarks
 * Extends the standard {@link Error} class to include timing data, supporting diagnostics and retry/backoff strategies.
 *
 * @example
 * ```typescript
 * throw new PortCheckError("Port not reachable", 1200);
 * ```
 *
 * @param message - The error message describing the failure.
 * @param responseTime - The time taken until failure in milliseconds.
 * @public
 */
export class PortCheckError extends Error {
    /**
     * The response time at the point of failure, in milliseconds.
     *
     * @readonly
     * @public
     */
    public readonly responseTime: number;

    /**
     * Constructs a new {@link PortCheckError} with timing information.
     *
     * @param message - The error message describing the failure.
     * @param responseTime - The time taken until failure in milliseconds.
     *
     * @remarks
     * Sets the error name to "PortCheckError" and preserves the response time for analysis.
     * @public
     */
    public constructor(message: string, responseTime: number) {
        super(message);
        this.name = "PortCheckError";
        this.responseTime = responseTime;
    }
}

/**
 * Normalizes errors from port checks into a standardized result structure for frontend consumption.
 *
 * @remarks
 * Converts any error thrown during a port check into a {@link PortCheckErrorResult} object. If the error is a
 * {@link PortCheckError}, its response time is preserved; otherwise, responseTime is set to -1. Logs debug information
 * in development mode for diagnostics.
 *
 * @param error - The error thrown during port checking. May be any type, but typically an {@link Error} or {@link PortCheckError}.
 * @param host - The hostname or IP address being checked.
 * @param port - The port number being checked.
 *
 * @returns A {@link PortCheckErrorResult} containing error details, standardized message, timing, and status.
 *
 * @example
 * ```typescript
 * try {
 *   // ...port check logic...
 * } catch (err) {
 *   const result = handlePortCheckError(err, "example.com", 443);
 *   // result.status === "down"
 * }
 * ```
 *
 * @see {@link PortCheckError}
 * @see {@link PortCheckErrorResult}
 * @public
 */
export function handlePortCheckError(
    error: unknown,
    host: string,
    port: number
): PortCheckErrorResult {
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
    // Extract response time from custom error if available, use -1 for unknown timing
    const responseTime =
        error instanceof PortCheckError ? error.responseTime : -1;

    // Log debug information in development mode
    if (isDev()) {
        logger.debug(
            `[PortMonitor] Final error for ${host}:${port}: ${errorMessage}`
        );
    }

    return {
        details: String(port),
        error:
            errorMessage === PORT_NOT_REACHABLE
                ? PORT_NOT_REACHABLE
                : errorMessage,
        responseTime,
        status: "down",
    };
}
