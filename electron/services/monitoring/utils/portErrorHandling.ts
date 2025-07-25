/**
 * Port monitoring error classes and constants.
 *
 * @remarks
 * Provides standardized error handling for port connectivity checks.
 * Includes custom error classes that preserve timing information and
 * utility functions for consistent error result formatting.
 */

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

/**
 * Error message constant for port connectivity failures.
 *
 * @remarks
 * Used consistently across port monitoring utilities to standardize error reporting.
 *
 * @public
 */
export const PORT_NOT_REACHABLE = "Port not reachable";

/**
 * Structure representing the result of a failed port check operation.
 *
 * @remarks
 * Used to communicate port check failures to the frontend in a standardized format.
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
 * @public
 */
export interface PortCheckErrorResult {
    /** Port number that was being checked, as a string. */
    details: string;
    /** Standardized error message for frontend consumption. */
    error: string;
    /** Response time in milliseconds, or -1 if measurement failed. */
    responseTime: number;
    /** Always "down" for error results. */
    status: "down";
}

/**
 * Custom error class for port connectivity failures, preserving response time information.
 *
 * @remarks
 * Extends the standard {@link Error} class to include timing data, supporting retry and backoff strategies.
 *
 * @example
 * ```typescript
 * throw new PortCheckError("Port not reachable", 1200);
 * ```
 *
 * @param message - Error message describing the failure.
 * @param responseTime - Time taken until failure in milliseconds.
 *
 * @public
 */
export class PortCheckError extends Error {
    /**
     * Response time at point of failure in milliseconds.
     *
     * @readonly
     */
    public readonly responseTime: number;

    /**
     * Constructs a new {@link PortCheckError} with timing information.
     *
     * @param message - Error message describing the failure.
     * @param responseTime - Time taken until failure in milliseconds.
     *
     * @remarks
     * Sets the error name to "PortCheckError" and preserves the response time for analysis.
     */
    constructor(message: string, responseTime: number) {
        super(message);
        this.name = "PortCheckError";
        this.responseTime = responseTime;
    }
}

/**
 * Normalizes errors from port checks into a standardized result structure for frontend consumption.
 *
 * @remarks
 * Converts various error types into a {@link PortCheckErrorResult} object. Extracts timing information from
 * {@link PortCheckError} instances, or sets responseTime to -1 if unavailable. Logs debug information in development mode.
 *
 * @param error - The error thrown during port checking. May be any type.
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
 *
 * @public
 */
export function handlePortCheckError(error: unknown, host: string, port: number): PortCheckErrorResult {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    // Extract response time from custom error if available, use -1 for unknown timing
    const responseTime = error instanceof PortCheckError ? error.responseTime : -1;

    // Log debug information in development mode
    if (isDev()) {
        logger.debug(`[PortMonitor] Final error for ${host}:${port}: ${errorMessage}`);
    }

    return {
        details: String(port),
        error: errorMessage === PORT_NOT_REACHABLE ? PORT_NOT_REACHABLE : errorMessage,
        responseTime,
        status: "down",
    };
}
