/**
 * Provides retry-enabled ping connectivity checks with exponential backoff and
 * standardized error handling.
 *
 * @remarks
 * This module builds on the basic ping checking utilities by adding
 * configurable retry logic, exponential backoff, and development-mode debug
 * logging. It integrates with the operational hooks system for consistent
 * error handling and event emission across the monitoring system.
 *
 * All ping operations use only cross-platform compatible options to ensure
 * consistent behavior across Windows, macOS, and Linux platforms. The module
 * provides both single-attempt and retry-enabled ping functions.
 *
 * Key features:
 * - Cross-platform ping execution using only compatible options
 * - Configurable retry logic with exponential backoff
 * - Integration with operational hooks for monitoring and debugging
 * - Standardized error handling and result formatting
 * - Development mode debug logging for troubleshooting
 *
 * @example
 * ```typescript
 * // Basic ping with retries
 * const result = await performPingCheckWithRetry("google.com", 5000, 3);
 *
 * // Single ping attempt
 * const result = await performSinglePingCheck("192.168.1.1", 3000);
 * ```
 *
 * @see {@link performPingCheckWithRetry} - Main retry-enabled ping function
 * @see {@link performSinglePingCheck} - Single-attempt ping function
 * @see {@link withOperationalHooks} - Operational hooks integration
 * @see {@link handlePingCheckError} - Error handling utilities
 * @public
 */

import * as ping from "ping";

import type { MonitorCheckResult } from "../types";

import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { handlePingCheckError } from "./pingErrorHandling";

/**
 * Performs a ping connectivity check with retry logic and exponential backoff.
 *
 * @param host - Target hostname or IP address to ping
 * @param timeout - Maximum time to wait for each ping attempt in milliseconds
 * @param maxRetries - Number of additional retry attempts after initial failure (0 = try once only)
 * @returns Promise resolving to {@link MonitorCheckResult} with ping status, timing, and details
 *
 * @remarks
 * This function wraps {@link performSinglePingCheck} with retry logic using
 * {@link withOperationalHooks}. It attempts to ping the specified host,
 * retrying on failure up to `maxRetries` times (for a total of `maxRetries` +
 * `1` attempts). Exponential backoff is applied between attempts.
 *
 * Process flow:
 * 1. Validates input parameters
 * 2. Performs initial ping attempt
 * 3. On failure, retries with exponential backoff
 * 4. Returns standardized result or error
 *
 * Debug logging is enabled in development mode to aid troubleshooting.
 * If all attempts fail, returns a standardized error result via {@link
 * handlePingCheckError}.
 *
 * @example
 * ```typescript
 * // Try once, no retries
 * const result = await performPingCheckWithRetry("example.com", 5000, 0);
 *
 * // Try 4 times total (1 initial + 3 retries) with 3-second timeout
 * const result = await performPingCheckWithRetry("google.com", 3000, 3);
 * if (result.status === "up") {
 *   console.log(`Ping successful: ${result.responseTime}ms`);
 * } else {
 *   console.log(`Ping failed: ${result.error}`);
 * }
 * ```
 *
 * @see {@link withOperationalHooks} - Retry logic implementation
 * @see {@link performSinglePingCheck} - Single ping attempt function
 * @see {@link handlePingCheckError} - Error handling utility
 * @public
 */
export async function performPingCheckWithRetry(
    host: string,
    timeout: number,
    maxRetries: number
): Promise<MonitorCheckResult> {
    if (isDev()) {
        logger.debug("Starting ping check with retry", {
            host,
            maxRetries,
            timeout,
        });
    }

    try {
        return await withOperationalHooks(
            async () => performSinglePingCheck(host, timeout),
            {
                initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                maxRetries,
                operationName: "ping-check",
            }
        );
    } catch (error) {
        return handlePingCheckError(error, {
            host,
            maxRetries,
            timeout,
        });
    }
}

/**
 * Performs a single ping connectivity check without retry logic.
 *
 * @remarks
 * This function performs a single ping attempt to the specified host using the
 * node-ping library. It measures response time and returns a structured
 * result. This function is used internally by {@link
 * performPingCheckWithRetry} and can also be used directly for single-attempt
 * checks.
 *
 * Uses only cross-platform ping options: numeric, timeout, and min_reply for
 * maximum compatibility.
 *
 * @param host - Target hostname or IP address to ping.
 * @param timeout - Maximum time to wait for the ping response in milliseconds.
 * @returns A promise that resolves to a {@link MonitorCheckResult} with ping status and timing.
 * @throws Error if the ping operation fails or times out.
 * @see {@link performPingCheckWithRetry}
 * @public
 */
export async function performSinglePingCheck(
    host: string,
    timeout: number
): Promise<MonitorCheckResult> {
    const startTime = Date.now();
    const timeoutInSeconds = Math.max(1, Math.floor(timeout / 1000)); // Convert to seconds, minimum 1

    try {
        const pingResult = await ping.promise.probe(host, {
            // Use only cross-platform options for maximum compatibility
            min_reply: 1, // Exit after receiving 1 reply (faster response)
            numeric: false, // Don't map IP addresses to hostnames
            timeout: timeoutInSeconds, // Timeout in seconds
        });

        const responseTime = Date.now() - startTime;

        if (pingResult.alive) {
            // Parse response time from ping result, fallback to measured time
            const pingTime =
                pingResult.time && typeof pingResult.time === "number"
                    ? Math.round(pingResult.time)
                    : responseTime;

            return {
                details: `Ping successful - packet loss: ${pingResult.packetLoss || "0"}%`,
                responseTime: pingTime,
                status: "up",
            };
        } else {
            return {
                details: "Host unreachable",
                error: "Ping failed - host unreachable",
                responseTime,
                status: "down",
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        throw new Error(
            `Ping failed: ${errorMessage} (response time: ${responseTime}ms)`
        );
    }
}
