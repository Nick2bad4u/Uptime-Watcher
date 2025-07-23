/**
 * Utility functions for performing port checks with retry logic.
 *
 * @remarks
 * This module provides high-level port checking with sophisticated retry mechanisms.
 * It builds on the basic port checking in portChecker.ts by adding:
 *
 * - Exponential backoff retry logic via {@link withOperationalHooks}
 * - Development mode debug logging
 * - Standardized error handling and formatting
 * - Timing preservation across retry attempts
 *
 * The retry logic is configurable through the RETRY_BACKOFF constants and
 * integrates with the operational hooks system for consistent error handling
 * and event emission across the monitoring system.
 *
 * For single port checks without retry logic, use portChecker.ts directly.
 * For error handling utilities, see portErrorHandling.ts.
 */

import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { MonitorCheckResult } from "../types";
import { performSinglePortCheck } from "./portChecker";
import { handlePortCheckError } from "./portErrorHandling";

/**
 * Perform port check with sophisticated retry logic and exponential backoff.
 *
 * @param host - Target hostname or IP address to check
 * @param port - Port number to test connectivity
 * @param timeout - Maximum time to wait for each connection attempt in milliseconds
 * @param maxRetries - Number of additional retry attempts after initial failure (0 = try once only)
 * @returns Promise resolving to monitor check result with timing and status information
 *
 * @remarks
 * Uses {@link withOperationalHooks} for sophisticated retry logic with exponential backoff.
 * The maxRetries parameter represents additional attempts after the initial attempt,
 * so maxRetries=3 results in 4 total attempts (1 initial + 3 retries).
 *
 * Retry logic includes:
 * - Exponential backoff between attempts
 * - Debug logging in development mode
 * - Timing preservation across retry attempts
 * - Standardized error handling via {@link handlePortCheckError}
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
 * @see {@link withOperationalHooks} for retry mechanism details
 * @see {@link performSinglePortCheck} for single attempt logic
 * @see {@link handlePortCheckError} for error result formatting
 */
export async function performPortCheckWithRetry(
    host: string,
    port: number,
    timeout: number,
    maxRetries: number
): Promise<MonitorCheckResult> {
    try {
        // Convert "additional retries" to "total attempts" for withOperationalHooks
        // maxRetries=3 means: 1 initial attempt + 3 retries = 4 total attempts
        const totalAttempts = maxRetries + 1;

        // Prepare base configuration
        const baseConfig = {
            initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts, // withOperationalHooks expects total attempts
            operationName: `Port check for ${host}:${port}`,
        };

        // Add debug logging in development mode for better readability
        const config = isDev()
            ? {
                  ...baseConfig,
                  onRetry: (attempt: number, error: Error) => {
                      const errorMessage = error instanceof Error ? error.message : String(error);
                      logger.debug(
                          `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                      );
                  },
              }
            : baseConfig;

        return await withOperationalHooks(() => performSinglePortCheck(host, port, timeout), config);
    } catch (error) {
        return handlePortCheckError(error, host, port);
    }
}
