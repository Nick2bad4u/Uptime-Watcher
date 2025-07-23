import isPortReachable from "is-port-reachable";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";
import { PORT_NOT_REACHABLE, PortCheckError } from "./portErrorHandling";

/**
 * Utility functions for performing port connectivity checks.
 *
 * @remarks
 * This module provides low-level port checking functionality using TCP connectivity tests.
 * Functions measure precise response times and provide detailed error information
 * for retry mechanisms.
 *
 * For port checks with retry logic, use the functions in portRetry.ts instead.
 */

/**
 * Perform a single port check attempt without retry logic.
 *
 * @param host - Target hostname or IP address to check
 * @param port - Port number to test connectivity
 * @param timeout - Maximum time to wait for connection in milliseconds
 * @returns Promise resolving to monitor check result with timing information
 * @throws PortCheckError When port is not reachable, includes response time for retry logic
 *
 * @remarks
 * Uses the `is-port-reachable` library to test TCP connectivity to the specified port.
 * Measures response time using high-precision performance.now() timing.
 *
 * On successful connection, returns a result with status "up" and actual response time.
 * On connection failure, throws PortCheckError with timing information to support
 * retry mechanisms that need response time data.
 *
 * Debug logging is automatically enabled in development mode for troubleshooting.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await performSinglePortCheck("example.com", 80, 5000);
 *   console.log(`Port check result: ${result.status} in ${result.responseTime}ms`);
 * } catch (error) {
 *   if (error instanceof PortCheckError) {
 *     console.log(`Port unreachable after ${error.responseTime}ms`);
 *   }
 * }
 * ```
 *
 * @see {@link PortCheckError} for error details
 * @see {@link MonitorCheckResult} for return type structure
 */
export async function performSinglePortCheck(host: string, port: number, timeout: number): Promise<MonitorCheckResult> {
    // Start high-precision timing for response time measurement
    const startTime = performance.now();

    if (isDev()) {
        logger.debug(`[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms`);
    }

    // Test TCP connectivity using is-port-reachable library
    const isReachable = await isPortReachable(port, {
        host: host,
        timeout: timeout,
    });

    // Calculate precise response time in milliseconds
    const responseTime = Math.round(performance.now() - startTime);

    if (isReachable) {
        if (isDev()) {
            logger.debug(`[PortMonitor] Port ${host}:${port} is reachable in ${responseTime}ms`);
        }
        return {
            details: String(port),
            responseTime,
            status: "up",
        };
    } else {
        // Port not reachable - throw custom error with response time to support retry logic
        throw new PortCheckError(PORT_NOT_REACHABLE, responseTime);
    }
}
