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
 * Used consistently across port monitoring to ensure standardized
 * error reporting to the frontend.
 */
export const PORT_NOT_REACHABLE = "Port not reachable";

/**
 * Result structure for failed port check operations.
 */
export interface PortCheckErrorResult {
    /** Port number that was being checked */
    details: string;
    /** Standardized error message for frontend consumption */
    error: string;
    /** Response time in milliseconds, -1 if measurement failed */
    responseTime: number;
    /** Always "down" for error results */
    status: "down";
}

/**
 * Custom error class that preserves response time information from failed port checks.
 *
 * @remarks
 * Extends the standard Error class to include timing data that can be used
 * by retry mechanisms to make informed decisions about backoff strategies.
 */
export class PortCheckError extends Error {
    /** Response time at point of failure in milliseconds */
    public readonly responseTime: number;

    /**
     * Create a new PortCheckError with timing information.
     *
     * @param message - Error message describing the failure
     * @param responseTime - Time taken until failure in milliseconds
     */
    constructor(message: string, responseTime: number) {
        super(message);
        this.name = "PortCheckError";
        this.responseTime = responseTime;
    }
}

/**
 * Handle errors that occur during port checks with standardized formatting.
 *
 * @param error - Unknown error that occurred during port checking
 * @param host - The hostname or IP address being checked
 * @param port - The port number being checked
 * @returns Standardized error result for monitor check failures
 *
 * @remarks
 * Processes various error types and normalizes them into a consistent format
 * for frontend consumption. Extracts timing information from PortCheckError
 * instances to support retry logic analysis.
 *
 * Response time defaults to -1 when timing information is unavailable,
 * distinguishing from valid 0ms responses.
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
