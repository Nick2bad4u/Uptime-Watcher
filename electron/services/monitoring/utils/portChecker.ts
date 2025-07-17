import isPortReachable from "is-port-reachable";

import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { MonitorCheckResult } from "../types";
import { PORT_NOT_REACHABLE, PortCheckError } from "./portErrorHandling";

/**
 * Utility functions for performing port connectivity checks.
 */

/**
 * Perform a single port check attempt without retry logic.
 */
export async function performSinglePortCheck(host: string, port: number, timeout: number): Promise<MonitorCheckResult> {
    const startTime = performance.now();

    if (isDev()) {
        logger.debug(`[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms`);
    }

    const isReachable = await isPortReachable(port, {
        host: host,
        timeout: timeout,
    });

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
        // Port not reachable - throw error with response time to trigger retry
        throw new PortCheckError(PORT_NOT_REACHABLE, responseTime);
    }
}
