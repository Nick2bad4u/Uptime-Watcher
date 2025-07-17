/**
 * HTTP monitoring error handling utilities.
 * Provides standardized error processing for HTTP monitors.
 */

import axios, { AxiosError } from "axios";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";

/**
 * Create a standard error result.
 */
export function createErrorResult(error: string, responseTime: number): MonitorCheckResult {
    return {
        details: "0",
        error,
        responseTime,
        status: "down",
    };
}

/**
 * Handle errors that occur during health checks.
 */
export function handleCheckError(error: unknown, url: string): MonitorCheckResult {
    const responseTime = axios.isAxiosError(error) && error.responseTime ? error.responseTime : 0;

    if (axios.isAxiosError(error)) {
        return handleAxiosError(error as AxiosError, url, responseTime);
    }

    // Non-Axios errors (shouldn't happen, but just in case)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.error(`[HttpMonitor] Unexpected error checking ${url}`, error);
    return createErrorResult(errorMessage, responseTime);
}

/**
 * Handle Axios-specific errors.
 */
export function handleAxiosError(error: AxiosError, url: string, responseTime: number): MonitorCheckResult {
    // With validateStatus: () => true, we should only get network errors here
    // HTTP response errors are handled in the success path

    // Network errors, timeouts, DNS failures, etc.
    const errorMessage = error.message || "Network error";
    if (isDev()) {
        logger.debug(`[HttpMonitor] Network error for ${url}: ${errorMessage}`);
    }
    return createErrorResult(errorMessage, responseTime);
}
