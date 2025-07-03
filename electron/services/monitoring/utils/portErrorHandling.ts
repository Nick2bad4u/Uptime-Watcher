/**
 * Port monitoring error classes and constants.
 */

import { isDev } from "../../../utils";
import { logger } from "../../../utils/logger";

/**
 * Constants for port monitor error messages.
 */
export const PORT_NOT_REACHABLE = "Port not reachable";

/**
 * Custom error class that preserves response time information from failed port checks.
 */
export class PortCheckError extends Error {
    public readonly responseTime: number;

    constructor(message: string, responseTime: number) {
        super(message);
        this.name = "PortCheckError";
        this.responseTime = responseTime;
    }
}

/**
 * Handle errors that occur during port checks.
 */
export function handlePortCheckError(
    error: unknown,
    host: string,
    port: number
): {
    details: string;
    error: string;
    responseTime: number;
    status: "down";
} {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    // Extract response time from custom error if available
    const responseTime = error instanceof PortCheckError ? error.responseTime : 0;

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
