/**
 * Shared utilities for monitor services to reduce code duplication
 * Contains common patterns used across PingMonitor, PortMonitor, and HttpMonitor
 */

import type { Monitor } from "@shared/types";

import type { MonitorCheckResult } from "../types";

import {
    getMonitorRetryAttempts,
    getMonitorTimeout,
} from "../utils/monitorTypeGuards";

export const DEFAULT_REQUEST_TIMEOUT = 5000;
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Create a standardized error result for monitor health checks
 * @param error - Error message
 * @param responseTime - Response time in milliseconds
 * @returns Standardized monitor health check error result
 */
export function createMonitorErrorResult(
    error: string,
    responseTime: number = 0
): MonitorCheckResult {
    return {
        error,
        responseTime,
        status: "down",
    };
}

/**
 * Extract common monitor configuration values (timeout and retry attempts)
 * @param monitor - Monitor configuration
 * @param configTimeout - Default timeout from monitor config
 * @returns Object containing timeout and retry attempts
 */
export function extractMonitorConfig(
    monitor: Monitor,
    configTimeout?: number
): { retryAttempts: number; timeout: number } {
    const timeout = getMonitorTimeout(
        monitor,
        configTimeout ?? DEFAULT_REQUEST_TIMEOUT
    );
    const retryAttempts = getMonitorRetryAttempts(
        monitor,
        DEFAULT_RETRY_ATTEMPTS
    );

    return { retryAttempts, timeout };
}

/**
 * Validate that a monitor has the required host property
 * @param monitor - Monitor to validate
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorHost(monitor: Monitor): null | string {
    if (
        !monitor.host ||
        typeof monitor.host !== "string" ||
        monitor.host.trim() === ""
    ) {
        return "Monitor missing valid host";
    }
    return null;
}

/**
 * Validate that a monitor has the required host and port properties
 * @param monitor - Monitor to validate
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorHostAndPort(monitor: Monitor): null | string {
    const hostError = validateMonitorHost(monitor);
    if (hostError) {
        return hostError.replace("host", "host or port");
    }

    if (
        !monitor.port ||
        typeof monitor.port !== "number" ||
        monitor.port <= 0 ||
        monitor.port > 65_535
    ) {
        return "Monitor missing valid host or port";
    }
    return null;
}

/**
 * Validate that a monitor has the required URL property
 * @param monitor - Monitor to validate
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorUrl(monitor: Monitor): null | string {
    if (
        !monitor.url ||
        typeof monitor.url !== "string" ||
        monitor.url.trim() === ""
    ) {
        return "Monitor missing or invalid URL";
    }
    return null;
}
