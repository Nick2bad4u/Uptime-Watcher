/**
 * Utilities for standardized error handling in HTTP monitoring.
 *
 * @remarks
 * Provides helpers for consistent error result construction and logging for HTTP monitor checks, including handling of Axios-specific errors and generic runtime errors. All functions return a {@link MonitorCheckResult} and never throw.
 *
 * @see {@link MonitorCheckResult}
 * @public
 */

import type { AxiosError } from "axios";

import axios from "axios";

import type { MonitorCheckResult } from "../types";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

/**
 * Constructs a standardized error result for monitor checks.
 *
 * @remarks
 * The `details` field is set to `"Error"` to distinguish error states from valid HTTP responses. This function is used for both network and generic errors. The returned object always has `status: "down"`.
 *
 * @param error - The error message describing what went wrong.
 * @param responseTime - The response time in milliseconds at the point of failure.
 * @param correlationId - Optional correlation ID for event tracking and logging.
 * @returns A {@link MonitorCheckResult} object indicating failure.
 *
 * @example
 * ```typescript
 * createErrorResult("Timeout", 500, "corr-123");
 * ```
 *
 * @see {@link MonitorCheckResult}
 * @public
 */
export function createErrorResult(
    error: string,
    responseTime: number,
    correlationId?: string
): MonitorCheckResult {
    if (correlationId && isDev()) {
        logger.debug(`[HttpMonitor] Creating error result`, {
            correlationId,
            error,
            responseTime,
        });
    }

    return {
        details: "Error", // Indicates error state vs HTTP status code
        error,
        responseTime,
        status: "down",
    };
}

/**
 * Handles Axios-specific errors encountered during HTTP monitoring.
 *
 * @remarks
 * Intended for network errors such as timeouts, DNS failures, or connection refusals. HTTP response errors (status codes) are handled separately in the success path. Always returns a failure result; never throws.
 *
 * @param error - The {@link AxiosError} instance containing request/response details.
 * @param url - The URL that was being monitored when the error occurred.
 * @param responseTime - The response time in milliseconds at the point of failure.
 * @param correlationId - Optional correlation ID for event tracking and logging.
 * @returns A {@link MonitorCheckResult} object representing the network error.
 *
 * @example
 * ```typescript
 * handleAxiosError(error, "https://example.com", 1200, "corr-456");
 * ```
 *
 * @see {@link AxiosError}
 * @see {@link MonitorCheckResult}
 * @public
 */
export function handleAxiosError(
    error: AxiosError,
    url: string,
    responseTime: number,
    correlationId?: string
): MonitorCheckResult {
    // Network errors, timeouts, DNS failures, etc.
    const errorMessage = error.message || "Network error";

    if (isDev()) {
        const logData = correlationId ? { correlationId, error } : { error };
        logger.debug(
            `[HttpMonitor] Network error for ${url}: ${errorMessage}`,
            logData
        );
    }

    return createErrorResult(errorMessage, responseTime, correlationId);
}

/**
 * Handles unknown errors that occur during health checks, with correlation tracking.
 *
 * @remarks
 * Attempts to extract response time from Axios errors if available. For non-Error objects, uses "Unknown error" as a fallback message. Logs all errors for diagnostic purposes. Always returns a {@link MonitorCheckResult} and never throws.
 *
 * @param error - The unknown error thrown during monitoring (can be any type).
 * @param url - The URL being monitored when the error occurred.
 * @param correlationId - Optional correlation ID for event tracking and logging.
 * @returns A {@link MonitorCheckResult} object representing the error.
 *
 * @example
 * ```typescript
 * handleCheckError(new Error("Unexpected failure"), "https://example.com", "corr-789");
 * ```
 *
 * @see {@link MonitorCheckResult}
 * @public
 */
export function handleCheckError(
    error: unknown,
    url: string,
    correlationId?: string
): MonitorCheckResult {
    const responseTime =
        axios.isAxiosError(error) && error.responseTime
            ? error.responseTime
            : 0;

    if (axios.isAxiosError(error)) {
        return handleAxiosError(
            error as AxiosError,
            url,
            responseTime,
            correlationId
        );
    }

    // Non-Axios errors (shouldn't happen, but defensive programming)
    // "Unknown error" fallback handles cases where thrown value isn't an Error instance
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

    const logData = correlationId ? { correlationId, error } : { error };
    logger.error(`[HttpMonitor] Unexpected error checking ${url}`, logData);

    return createErrorResult(errorMessage, responseTime, correlationId);
}
