/**
 * HTTP monitoring error handling utilities.
 * Provides standardized error processing for HTTP monitors.
 */

import axios, { AxiosError } from "axios";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";

/**
 * Create a standardized error result for monitor checks.
 *
 * @param error - Error message describing what went wrong
 * @param responseTime - Response time in milliseconds at point of failure
 * @param correlationId - Optional correlation ID for event tracking
 * @returns Standardized monitor check result indicating failure
 *
 * @remarks
 * The details field is set to "Error" as a placeholder to indicate
 * an error state rather than a specific HTTP status code.
 * This distinguishes error results from successful HTTP responses.
 */
export function createErrorResult(error: string, responseTime: number, correlationId?: string): MonitorCheckResult {
    if (correlationId && isDev()) {
        logger.debug(`[HttpMonitor] Creating error result`, { correlationId, error, responseTime });
    }

    return {
        details: "Error", // Indicates error state vs HTTP status code
        error,
        responseTime,
        status: "down",
    };
}

/**
 * Handle Axios-specific errors during HTTP monitoring.
 *
 * @param error - Axios error instance containing request/response details
 * @param url - The URL that was being monitored when error occurred
 * @param responseTime - Response time in milliseconds at point of failure
 * @param correlationId - Optional correlation ID for event tracking
 * @returns Standardized monitor check result for the network error
 *
 * @remarks
 * With validateStatus: () =\> true configuration, this primarily handles
 * network errors like timeouts, DNS failures, connection refused, etc.
 * HTTP response errors are handled in the success path for manual evaluation.
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
        logger.debug(`[HttpMonitor] Network error for ${url}: ${errorMessage}`, logData);
    }

    return createErrorResult(errorMessage, responseTime, correlationId);
}

/**
 * Handle errors that occur during health checks with correlation tracking.
 *
 * @param error - Unknown error that occurred during monitoring
 * @param url - The URL being monitored when error occurred
 * @param correlationId - Optional correlation ID for event tracking
 * @returns Standardized monitor check result for the error
 *
 * @remarks
 * Attempts to extract response time from Axios errors via declaration merging.
 * For non-Error objects, uses "Unknown error" as a fallback message since
 * we cannot guarantee the structure of thrown values in JavaScript.
 */
export function handleCheckError(error: unknown, url: string, correlationId?: string): MonitorCheckResult {
    const responseTime = axios.isAxiosError(error) && error.responseTime ? error.responseTime : 0;

    if (axios.isAxiosError(error)) {
        return handleAxiosError(error as AxiosError, url, responseTime, correlationId);
    }

    // Non-Axios errors (shouldn't happen, but defensive programming)
    // "Unknown error" fallback handles cases where thrown value isn't an Error instance
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    const logData = correlationId ? { correlationId, error } : { error };
    logger.error(`[HttpMonitor] Unexpected error checking ${url}`, logData);

    return createErrorResult(errorMessage, responseTime, correlationId);
}
