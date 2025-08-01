/**
 * Type guards and utilities for monitor configuration properties.
 *
 * @remarks
 * Provides safe type checking for monitor configuration properties that may be
 * undefined at runtime despite type definitions suggesting otherwise.
 * This addresses the type safety issues identified in HttpMonitor and PortMonitor.
 */

import { isNonEmptyString, isValidFQDN, isValidUrl } from "../../../../shared/validation/validatorUtils";
import { Site } from "../../../types";

/**
 * Safely extracts retry attempts from monitor configuration.
 *
 * @param monitor - The monitor configuration
 * @param defaultRetryAttempts - Default retry attempts to use if monitor doesn't have them
 * @returns The retry attempts value to use
 */
export function getMonitorRetryAttempts(monitor: Site["monitors"][0], defaultRetryAttempts: number): number {
    return hasValidRetryAttempts(monitor) ? monitor.retryAttempts : defaultRetryAttempts;
}

/**
 * Safely extracts timeout value from monitor configuration.
 *
 * @param monitor - The monitor configuration
 * @param defaultTimeout - Default timeout to use if monitor doesn't have one
 * @returns The timeout value to use
 */
export function getMonitorTimeout(monitor: Site["monitors"][0], defaultTimeout: number): number {
    return hasValidTimeout(monitor) ? monitor.timeout : defaultTimeout;
}

/**
 * Type guard to safely check if a monitor has a valid host using validator.
 *
 * @param monitor - The monitor configuration to check
 * @returns True if the monitor has a valid host, false otherwise
 */
export function hasValidHost(monitor: Site["monitors"][0]): monitor is Site["monitors"][0] & { host: string } {
    // Allow hostnames that are either FQDNs or could be valid IPs/hostnames
    return (
        isNonEmptyString(monitor.host) &&
        (isValidFQDN(monitor.host, { require_tld: false }) || /^[\w.-]+$/.test(monitor.host))
    );
}

/**
 * Type guard to safely check if a monitor has a valid port.
 *
 * @param monitor - The monitor configuration to check
 * @returns True if the monitor has a valid port, false otherwise
 */
export function hasValidPort(monitor: Site["monitors"][0]): monitor is Site["monitors"][0] & { port: number } {
    return typeof monitor.port === "number" && monitor.port >= 1 && monitor.port <= 65_535;
}

/**
 * Type guard to safely check if a monitor has valid retry attempts.
 *
 * @param monitor - The monitor configuration to check
 * @returns True if the monitor has valid retry attempts, false otherwise
 */
export function hasValidRetryAttempts(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { retryAttempts: number } {
    return typeof monitor.retryAttempts === "number" && monitor.retryAttempts >= 0;
}

/**
 * Type guard to safely check if a monitor has a valid timeout value.
 *
 * @param monitor - The monitor configuration to check
 * @returns True if the monitor has a valid timeout, false otherwise
 */
export function hasValidTimeout(monitor: Site["monitors"][0]): monitor is Site["monitors"][0] & { timeout: number } {
    return typeof monitor.timeout === "number" && monitor.timeout > 0;
}

/**
 * Type guard to safely check if a monitor has a valid URL using validator.
 *
 * @param monitor - The monitor configuration to check
 * @returns True if the monitor has a valid URL, false otherwise
 */
export function hasValidUrl(monitor: Site["monitors"][0]): monitor is Site["monitors"][0] & { url: string } {
    return isValidUrl(monitor.url);
}
