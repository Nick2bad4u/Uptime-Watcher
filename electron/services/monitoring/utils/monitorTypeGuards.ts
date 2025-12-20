/**
 * Type guards and utilities for monitor configuration properties.
 *
 * @remarks
 * Provides safe type checking for monitor configuration properties that may be
 * undefined at runtime despite type definitions suggesting otherwise. This
 * addresses the type safety issues identified in HttpMonitor and PortMonitor.
 */

import type { Site } from "@shared/types";

import {
    isNonEmptyString,
    isValidFQDN,
    isValidUrl,
} from "@shared/validation/validatorUtils";

import {
    createMonitorConfig,
    type NormalizedMonitorConfig,
} from "../createMonitorConfig";

/**
 * Type guard to safely check if a monitor has valid retry attempts.
 *
 * @param monitor - The monitor configuration to check
 *
 * @returns True if the monitor has valid retry attempts, false otherwise
 */
export function hasValidRetryAttempts(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { retryAttempts: number } {
    return (
        typeof monitor.retryAttempts === "number" &&
        monitor.retryAttempts >= 0 &&
        Number.isFinite(monitor.retryAttempts)
    );
}

/**
 * Type guard to safely check if a monitor has a valid timeout value.
 *
 * @param monitor - The monitor configuration to check
 *
 * @returns True if the monitor has a valid timeout, false otherwise
 */
export function hasValidTimeout(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { timeout: number } {
    return (
        typeof monitor.timeout === "number" &&
        monitor.timeout > 0 &&
        Number.isFinite(monitor.timeout)
    );
}

/**
 * Normalize monitor configuration and surface timeout, retry attempts, and
 * check interval values using the shared factory.
 *
 * @param monitor - Monitor configuration containing optional overrides.
 * @param defaults - Optional fallback values typically provided by the calling
 *   service.
 *
 * @returns Fully normalized monitor configuration with invariant guarantees.
 */
export function extractMonitorConfig(
    monitor: Site["monitors"][0],
    defaults: Partial<NormalizedMonitorConfig> = {}
): NormalizedMonitorConfig {
    return createMonitorConfig(monitor, defaults);
}

/**
 * Type guard to safely check if a monitor has a valid host using validator.
 *
 * @param monitor - The monitor configuration to check
 *
 * @returns True if the monitor has a valid host, false otherwise
 */
export function hasValidHost(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { host: string } {
    // Allow hostnames that are either FQDNs or could be valid IPs/hostnames
    return (
        isNonEmptyString(monitor.host) &&
        (isValidFQDN(monitor.host, { require_tld: false }) ||
            // eslint-disable-next-line regexp/require-unicode-sets-regexp -- The `v` flag is not consistently supported across our Electron/TypeScript toolchain; `u` preserves the intended ASCII-only hostname character set.
            /^[\w.-]+$/u.test(monitor.host))
    );
}

/**
 * Type guard to safely check if a monitor has a valid port.
 *
 * @param monitor - The monitor configuration to check
 *
 * @returns True if the monitor has a valid port, false otherwise
 */
export function hasValidPort(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { port: number } {
    return (
        typeof monitor.port === "number" &&
        monitor.port >= 1 &&
        monitor.port <= 65_535
    );
}

/**
 * Type guard to safely check if a monitor has a valid URL using validator.
 *
 * @param monitor - The monitor configuration to check
 *
 * @returns True if the monitor has a valid URL, false otherwise
 */
export function hasValidUrl(
    monitor: Site["monitors"][0]
): monitor is Site["monitors"][0] & { url: string } {
    return isValidUrl(monitor.url);
}
