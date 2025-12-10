/**
 * Provides retry-enabled connectivity checks with exponential backoff and
 * standardized error handling.
 *
 * @remarks
 * This module builds on the native connectivity checking utilities by adding
 * configurable retry logic, exponential backoff, and development-mode debug
 * logging. It integrates with the operational hooks system for consistent error
 * handling and event emission across the monitoring system.
 *
 * All connectivity operations use native Node.js modules (net, dns, fetch) for
 * consistent behavior across Windows, macOS, and Linux platforms without
 * requiring elevated privileges or external system utilities. The module
 * provides both single-attempt and retry-enabled connectivity functions.
 *
 * Key features:
 *
 * - Cross-platform connectivity checking using native Node.js modules
 * - Support for TCP, DNS, and HTTP/HTTPS connectivity checks
 * - Configurable retry logic with exponential backoff
 * - Integration with operational hooks for monitoring and debugging
 * - Standardized error handling and result formatting
 * - Development mode debug logging for troubleshooting
 * - No external dependencies or elevated privileges required
 *
 * @example
 *
 * ```typescript
 * // Basic connectivity check with retries
 * const result = await performPingCheckWithRetry("google.com", 5000, 3);
 *
 * // Single connectivity attempt
 * const result = await performSinglePingCheck("192.168.1.1", 3000);
 *
 * // HTTP/HTTPS connectivity check
 * const result = await performSinglePingCheck(
 *     "https://api.example.com",
 *     5000
 * );
 * ```
 *
 * @public
 *
 * @see {@link performPingCheckWithRetry} - Main retry-enabled connectivity function
 * @see {@link performSinglePingCheck} - Single-attempt connectivity function
 * @see {@link withOperationalHooks} - Operational hooks integration
 * @see {@link handlePingCheckError} - Error handling utilities
 * @see {@link checkConnectivity} - Native connectivity checking
 * @see {@link checkHttpConnectivity} - HTTP/HTTPS connectivity checking
 */

import type { MonitorCheckResult } from "../types";

import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { checkConnectivity, checkHttpConnectivity } from "./nativeConnectivity";
import { handlePingCheckError } from "./pingErrorHandling";

/**
 * Performs a single connectivity check without retry logic.
 *
 * @remarks
 * This function performs a single connectivity attempt to the specified host
 * using native Node.js modules. It automatically detects HTTP/HTTPS URLs and
 * uses appropriate connectivity check methods (HTTP for URLs, TCP/DNS for
 * hosts). This function is used internally by {@link performPingCheckWithRetry}
 * and can also be used directly for single-attempt checks.
 *
 * Uses native connectivity checking with TCP port scanning and DNS resolution
 * for maximum compatibility without requiring elevated privileges.
 *
 * @param host - Target hostname, IP address, or URL to check connectivity for.
 * @param timeout - Maximum time to wait for the connectivity response in
 *   milliseconds.
 *
 * @returns A promise that resolves to a {@link MonitorCheckResult} with
 *   connectivity status and timing.
 *
 * @throws Error if the connectivity operation fails or times out.
 *
 * @public
 *
 * @see {@link performPingCheckWithRetry}
 * @see {@link checkConnectivity}
 * @see {@link checkHttpConnectivity}
 */
export async function performSinglePingCheck(
    host: string,
    timeout: number
): Promise<MonitorCheckResult> {
    try {
        // Determine check type based on host format
        const isHttpUrl = /^https?:\/\//iv.test(host);

        // Use native connectivity check instead of ping package
        return isHttpUrl
            ? await checkHttpConnectivity(host, timeout)
            : await checkConnectivity(host, { retries: 0, timeout });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        throw new Error(`Connectivity check failed: ${errorMessage}`, {
            cause: error,
        });
    }
}

/**
 * Performs a connectivity check with retry logic and exponential backoff.
 *
 * @remarks
 * This function wraps {@link performSinglePingCheck} with retry logic using
 * {@link withOperationalHooks}. It attempts to check connectivity to the
 * specified host, retrying on failure up to `maxRetries` times (for a total of
 * `maxRetries` + `1` attempts). Exponential backoff is applied between
 * attempts.
 *
 * Process flow:
 *
 * 1. Validates input parameters
 * 2. Performs initial connectivity attempt
 * 3. On failure, retries with exponential backoff
 * 4. Returns standardized result or error
 *
 * Debug logging is enabled in development mode to aid troubleshooting. If all
 * attempts fail, returns a standardized error result via
 * {@link handlePingCheckError}.
 *
 * @example
 *
 * ```typescript
 * import { monitorLogger } from "../../../utils/logger";
 *
 * // Try once, no retries
 * const result = await performPingCheckWithRetry("example.com", 5000, 0);
 *
 * // Try 4 times total (1 initial + 3 retries) with 3-second timeout
 * const result = await performPingCheckWithRetry("google.com", 3000, 3);
 * if (result.status === "up") {
 *     monitorLogger.info("Connectivity successful", result);
 * } else {
 *     monitorLogger.warn("Connectivity failed", {
 *         error: result.error,
 *     });
 * }
 * ```
 *
 * @param host - Target hostname, IP address, or URL to check connectivity for
 * @param timeout - Maximum time to wait for each connectivity attempt in
 *   milliseconds
 * @param maxRetries - Number of additional retry attempts after initial failure
 *   (0 = try once only)
 *
 * @returns Promise resolving to {@link MonitorCheckResult} with connectivity
 *   status, timing, and details
 *
 * @public
 *
 * @see {@link withOperationalHooks} - Retry logic implementation
 * @see {@link performSinglePingCheck} - Single connectivity attempt function
 * @see {@link handlePingCheckError} - Error handling utility
 */
export async function performPingCheckWithRetry(
    host: string,
    timeout: number,
    maxRetries: number
): Promise<MonitorCheckResult> {
    const normalizedRetries =
        typeof maxRetries === "number" && Number.isFinite(maxRetries)
            ? Math.max(0, Math.floor(maxRetries))
            : 0;

    // With operational hooks, `maxRetries` is interpreted as the total number
    // of attempts. The public API for this helper exposes `maxRetries` as the
    // number of additional retry attempts after the initial call (0 = one
    // attempt). Convert the caller value into an attempt count here.
    const totalAttempts = normalizedRetries + 1;

    if (isDev()) {
        logger.debug("Starting connectivity check with retry", {
            host,
            maxRetries: normalizedRetries,
            timeout,
        });
    }

    try {
        return await withOperationalHooks(
            async () => performSinglePingCheck(host, timeout),
            {
                initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                maxRetries: totalAttempts,
                operationName: "connectivity-check",
            }
        );
    } catch (error) {
        return handlePingCheckError(error, {
            host,
            maxRetries: normalizedRetries,
            timeout,
        });
    }
}
