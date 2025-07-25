import isPortReachable from "is-port-reachable";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";
import { PORT_NOT_REACHABLE, PortCheckError } from "./portErrorHandling";

/**
 * Utility functions for performing port connectivity checks via TCP.
 *
 * @remarks
 * Provides low-level port checking using TCP connectivity tests. Measures precise response times and
 * supplies detailed error information for retry mechanisms. For port checks with retry logic, use
 * {@link portRetry.ts} instead.
 *
 * @see {@link performSinglePortCheck}
 * @public
 */

/**
 * Performs a single TCP port connectivity check without retry logic.
 *
 * @remarks
 * Uses the `is-port-reachable` library to test TCP connectivity to the specified port and host.
 * Measures response time using high-precision `performance.now()` timing. Debug logging is enabled
 * in development mode for troubleshooting.
 *
 * On successful connection, returns a {@link MonitorCheckResult} with status `"up"` and actual response time.
 * On connection failure, throws a {@link PortCheckError} with timing information to support retry mechanisms.
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
 * @param host - Target hostname or IP address to check.
 * @param port - Port number to test connectivity.
 * @param timeout - Maximum time to wait for connection in milliseconds.
 * @returns A promise resolving to a {@link MonitorCheckResult} containing port details, response time, and status.
 * @throws {@link PortCheckError} When the port is not reachable, includes response time for retry logic.
 * @see {@link PortCheckError}
 * @see {@link MonitorCheckResult}
 * @public
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
