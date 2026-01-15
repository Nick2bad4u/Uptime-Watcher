import isPortReachable from "is-port-reachable";

import type { MonitorCheckResult } from "../types";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { PORT_NOT_REACHABLE, PortCheckError } from "./portErrorHandling";

/**
 * TCP port connectivity check utilities for monitoring services.
 *
 * @remarks
 * Provides low-level, single-attempt TCP port checking for use in monitor
 * health checks. Measures precise response times and supplies detailed error
 * information for retry and diagnostics. All database and event updates are
 * handled outside this utility. For port checks with retry logic, see
 * {@link portRetry.ts}.
 *
 * @public
 *
 * @see {@link performSinglePortCheck}
 * @see {@link MonitorCheckResult}
 * @see {@link PortCheckError}
 */

/**
 * Utility functions for performing port connectivity checks via TCP.
 *
 * @remarks
 * Provides low-level port checking using TCP connectivity tests. Measures
 * precise response times and supplies detailed error information for retry
 * mechanisms. For port checks with retry logic, use {@link portRetry.ts}
 * instead.
 *
 * @public
 *
 * @see {@link performSinglePortCheck}
 */

/**
 * Performs a single TCP port connectivity check to a specified host and port,
 * without retry logic.
 *
 * @remarks
 * Uses the {@link "is-port-reachable"} library to test TCP connectivity to the
 * given host and port, measuring response time with high-precision
 * `performance.now()`. Debug logging is enabled in development mode. This
 * function does not mutate state or trigger events; it is intended for use
 * within repository or service layers that handle orchestration and event
 * propagation.
 *
 * On success, resolves to a {@link MonitorCheckResult} with status `"up"` and
 * the measured response time. On failure, throws a {@link PortCheckError}
 * containing the error message and response time for use in retry or error
 * handling logic.
 *
 * @example
 *
 * ```typescript
 * import { monitorLogger } from "../../../utils/logger";
 *
 * try {
 *     const result = await performSinglePortCheck("example.com", 80, 5000);
 *     monitorLogger.info("Port check result", result);
 * } catch (error) {
 *     if (error instanceof PortCheckError) {
 *         monitorLogger.warn("Port unreachable", {
 *             responseTime: error.responseTime,
 *         });
 *     }
 * }
 * ```
 *
 * @param host - The target hostname or IP address to check (e.g., "localhost",
 *   "192.168.1.1").
 * @param port - The TCP port number to test for connectivity.
 * @param timeout - The maximum time to wait for a connection, in milliseconds.
 *
 * @returns A promise that resolves to a {@link MonitorCheckResult} containing
 *   port details, response time, and status.
 *
 * @throws {@link PortCheckError} Thrown if the port is not reachable within the
 *   timeout, with response time included for diagnostics and retry logic.
 *
 * @public
 *
 * @see {@link MonitorCheckResult}
 * @see {@link PortCheckError}
 */
export async function performSinglePortCheck(
    host: string,
    port: number,
    timeout: number
): Promise<MonitorCheckResult> {
    // Start high-precision timing for response time measurement
    const startTime = performance.now();

    if (isDev()) {
        logger.debug(
            `[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms`
        );
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
            logger.debug(
                `[PortMonitor] Port ${host}:${port} is reachable in ${responseTime}ms`
            );
        }
        return {
            details: String(port),
            responseTime,
            status: "up",
        };
    }
    // Port not reachable - throw custom error with response time to
    // support retry logic
    throw new PortCheckError(PORT_NOT_REACHABLE, responseTime);
}
