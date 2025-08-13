/**
 * Provides retry-enabled TCP port connectivity checks with exponential backoff
 * and standardized error handling.
 *
 * @remarks
 * This module builds on the basic port checking utilities by adding
 * configurable retry logic, exponential backoff, and development-mode debug
 * logging. It integrates with the operational hooks system for consistent
 * error handling and event emission across the monitoring system. For single
 * port checks without retry logic, use {@link portChecker.ts} directly. For
 * error handling utilities, see {@link portErrorHandling.ts}.
 *
 * @see {@link performPortCheckWithRetry}
 * @see {@link portChecker.ts}
 * @see {@link portErrorHandling.ts}
 * @public
 */

import type { MonitorCheckResult } from "../types";

import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { performSinglePortCheck } from "./portChecker";
import { handlePortCheckError } from "./portErrorHandling";

/**
 * Performs a TCP port connectivity check with retry logic and exponential
 * backoff.
 *
 * @remarks
 * This function wraps {@link performSinglePortCheck} with retry logic using
 * {@link withOperationalHooks}. It attempts to connect to the specified host
 * and port, retrying on failure up to `maxRetries` times (for a total of
 * `maxRetries + 1` attempts). Exponential backoff is applied between attempts.
 * Debug logging is enabled in development mode. If all attempts fail, a
 * standardized error result is returned via {@link handlePortCheckError}.
 *
 * @example
 * ```typescript
 * // Try once, no retries
 * const result = await performPortCheckWithRetry("example.com", 80, 5000, 0);
 *
 * // Try 4 times total (1 initial + 3 retries)
 * const result = await performPortCheckWithRetry("example.com", 443, 3000, 3);
 * ```
 *
 * @param host - Target hostname or IP address to check.
 * @param port - Port number to test connectivity.
 * @param timeout - Maximum time to wait for each connection attempt in milliseconds.
 * @param maxRetries - Number of additional retry attempts after initial failure (0 = try once only).
 * @returns A promise that resolves to a {@link MonitorCheckResult} containing port details, response time, and status. If all attempts fail, the result is a standardized error result.
 * @see {@link withOperationalHooks}
 * @see {@link performSinglePortCheck}
 * @see {@link handlePortCheckError}
 * @public
 */
export async function performPortCheckWithRetry(
    host: string,
    port: number,
    timeout: number,
    maxRetries: number
): Promise<MonitorCheckResult> {
    try {
        // Convert "additional retries" to "total attempts" for
        // withOperationalHooks maxRetries=3 means: 1 initial attempt + 3
        // retries = 4 total attempts
        const totalAttempts = maxRetries + 1;

        // Prepare base configuration for operational hooks
        const baseConfig = {
            initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts, // withOperationalHooks expects total attempts
            operationName: `Port check for ${host}:${port}`,
        };

        // Add debug logging in development mode for better readability
        const config = isDev()
            ? {
                  ...baseConfig,
                  onRetry: (attempt: number, error: Error): void => {
                      const errorMessage =
                          error instanceof Error
                              ? error.message
                              : String(error);
                      logger.debug(
                          `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                      );
                  },
              }
            : baseConfig;

        return await withOperationalHooks(
            () => performSinglePortCheck(host, port, timeout),
            config
        );
    } catch (error) {
        // Standardize error result for frontend consumption
        return handlePortCheckError(error, host, port);
    }
}
