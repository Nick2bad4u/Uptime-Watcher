/**
 * Utilities for standardized error handling in HTTP monitoring.
 *
 * @remarks
 * Provides helpers for consistent error result construction and logging for
 * HTTP monitor checks, including handling of Axios-specific errors and generic
 * runtime errors. All functions return a {@link MonitorCheckResult} and never
 * throw.
 *
 * @public
 *
 * @see {@link MonitorCheckResult}
 */

import type { AxiosError } from "axios";

import { getErrorMessage } from "@shared/utils/errorUtils";
import axios from "axios";

import type { MonitorCheckResult } from "../types";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

/**
 * Constructs a standardized error result for monitor checks.
 *
 * @remarks
 * The `details` field is set to `"Error"` to distinguish error states from
 * valid HTTP responses. This function is used for both network and generic
 * errors. The returned object always has `status: "down"`.
 *
 * @example
 *
 * ```typescript
 * createErrorResult("Timeout", 500, "corr-123");
 * ```
 *
 * @param error - The error message describing what went wrong.
 * @param responseTime - The response time in milliseconds at the point of
 *   failure.
 * @param correlationId - Optional correlation ID for event tracking and
 *   logging.
 *
 * @returns A {@link MonitorCheckResult} object indicating failure.
 *
 * @public
 *
 * @see {@link MonitorCheckResult}
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

const CANCELLATION_ERROR_CODES = new Set(["ECONNABORTED", "ERR_CANCELED"]);
const CANCELLATION_ERROR_NAMES = new Set([
    "AbortError",
    "CanceledError",
    "TimeoutError",
]);

function normalizeErrorCode(error: Error): string | undefined {
    const candidate: unknown = Reflect.get(error as object, "code");

    if (typeof candidate === "string" && candidate.trim() !== "") {
        return candidate.toUpperCase();
    }

    return undefined;
}

/**
 * Determine whether an error represents an expected cancellation scenario.
 */
export function isCancellationError(
    error: unknown
): error is Error & { code?: string } {
    if (!(error instanceof Error)) {
        return false;
    }

    const normalizedCode = normalizeErrorCode(error);
    if (normalizedCode && CANCELLATION_ERROR_CODES.has(normalizedCode)) {
        return true;
    }

    if (CANCELLATION_ERROR_NAMES.has(error.name)) {
        return true;
    }

    if (axios.isAxiosError(error)) {
        const axiosCode = normalizeErrorCode(error);
        if (axiosCode && CANCELLATION_ERROR_CODES.has(axiosCode)) {
            return true;
        }
    }

    return typeof axios.isCancel === "function" && axios.isCancel(error);
}

/**
 * Handles Axios-specific errors encountered during HTTP monitoring.
 *
 * @remarks
 * Intended for network errors such as timeouts, DNS failures, or connection
 * refusals. HTTP response errors (status codes) are handled separately in the
 * success path. Always returns a failure result; never throws.
 *
 * @example
 *
 * ```typescript
 * handleAxiosError(error, "https://example.com", 1200, "corr-456");
 * ```
 *
 * @param error - The {@link AxiosError} instance containing request/response
 *   details.
 * @param url - The URL that was being monitored when the error occurred.
 * @param responseTime - The response time in milliseconds at the point of
 *   failure.
 * @param correlationId - Optional correlation ID for event tracking and
 *   logging.
 *
 * @returns A {@link MonitorCheckResult} object representing the network error.
 *
 * @public
 *
 * @see {@link AxiosError}
 * @see {@link MonitorCheckResult}
 */
export function handleAxiosError(
    error: AxiosError,
    url: string,
    responseTime: number,
    correlationId?: string
): MonitorCheckResult {
    // Network errors, timeouts, DNS failures, etc.
    let errorMessage = error.message || "Network error";

    const normalizedCode = normalizeErrorCode(error);

    if (isCancellationError(error)) {
        errorMessage = "Request canceled";
    } else if (normalizedCode === "ECONNABORTED") {
        errorMessage = "Request timed out";
    }

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
 * Handles unknown errors that occur during health checks, with correlation
 * tracking.
 *
 * @remarks
 * Attempts to extract response time from Axios errors if available. For
 * non-Error objects, uses "Unknown error" as a fallback message. Logs all
 * errors for diagnostic purposes. Always returns a {@link MonitorCheckResult}
 * and never throws.
 *
 * @example
 *
 * ```typescript
 * handleCheckError(
 *     new Error("Unexpected failure"),
 *     "https://example.com",
 *     "corr-789"
 * );
 * ```
 *
 * @param error - The unknown error thrown during monitoring (can be any type).
 * @param url - The URL being monitored when the error occurred.
 * @param correlationId - Optional correlation ID for event tracking and
 *   logging.
 *
 * @returns A {@link MonitorCheckResult} object representing the error.
 *
 * @public
 *
 * @see {@link MonitorCheckResult}
 */
export function handleCheckError(
    error: unknown,
    url: string,
    correlationId?: string
): MonitorCheckResult {
    const axiosError = axios.isAxiosError(error) ? error : undefined;
    const responseTime = axiosError?.responseTime ?? 0;

    if (isCancellationError(error)) {
        if (isDev()) {
            const logContext = correlationId
                ? { correlationId, error }
                : { error };
            logger.debug(
                `[HttpMonitor] Request for ${url} was canceled before completion`,
                logContext
            );
        }

        return createErrorResult(
            "Request canceled",
            responseTime,
            correlationId
        );
    }

    if (axiosError) {
        return handleAxiosError(axiosError, url, responseTime, correlationId);
    }

    // Non-Axios errors (shouldn't happen, but defensive programming)
    // "Unknown error" fallback handles cases where thrown value isn't an Error
    // instance
    const errorMessage = getErrorMessage(error);

    const logData = correlationId ? { correlationId, error } : { error };
    logger.error(`[HttpMonitor] Unexpected error checking ${url}`, logData);

    return createErrorResult(errorMessage, responseTime, correlationId);
}
