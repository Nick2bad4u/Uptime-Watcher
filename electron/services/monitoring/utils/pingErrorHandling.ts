/**
 * Provides specialized error handling for ping monitoring operations.
 *
 * @remarks
 * This module standardizes error handling for ping connectivity checks, providing
 * consistent error messages and result formatting. Works in conjunction with the
 * ping retry utilities to ensure uniform error reporting across all ping operations.
 *
 * @see {@link handlePingCheckError}
 * @public
 */

import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";

/**
 * Context information for ping operations.
 *
 * @remarks
 * Used to provide additional context when handling ping errors.
 */
export interface PingOperationContext {
    /** Target host being pinged */
    host: string;
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Timeout in milliseconds */
    timeout: number;
}

/**
 * Handles errors from ping operations and returns a standardized error result.
 *
 * @remarks
 * This function processes errors from ping connectivity checks and returns a
 * consistent {@link MonitorCheckResult} structure. It logs the error details
 * and provides appropriate error messages for different failure scenarios.
 *
 * @param error - The error that occurred during the ping operation
 * @param context - Additional context about the ping operation
 * @returns A standardized error result with status "down"
 * @see {@link PingOperationContext}
 * @public
 */
export function handlePingCheckError(error: unknown, context: PingOperationContext): MonitorCheckResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Ping check failed", {
        error: errorMessage,
        ...context,
    });

    // Return standardized error result
    return {
        details: `Ping failed: ${errorMessage}`,
        error: errorMessage,
        responseTime: 0,
        status: "down",
    };
}
