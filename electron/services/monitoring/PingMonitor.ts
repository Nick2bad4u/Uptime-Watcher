/**
 * Network connectivity monitoring service using ICMP ping for network
 * reachability checks.
 *
 * @remarks
 * Provides comprehensive ping monitoring capabilities for network hosts and
 * endpoints with configurable timeouts, retry logic, and detailed response time
 * measurement. Designed for reliable network connectivity verification using
 * native system ping utilities.
 *
 * The service uses the node-ping wrapper around system ping utilities for
 * cross-platform compatibility, ensuring consistent behavior across Windows,
 * macOS, and Linux platforms. Only cross-platform ping options are used to
 * maximize compatibility.
 *
 * @example
 *
 * ```typescript
 * const pingMonitor = new PingMonitor({ timeout: 5000, retryAttempts: 3 });
 * const result = await pingMonitor.check({
 *     id: "monitor_123",
 *     type: "ping",
 *     host: "example.com",
 *     status: "pending",
 *     monitoring: true,
 *     checkInterval: 300000,
 *     retryAttempts: 3,
 *     timeout: 5000,
 *     responseTime: -1,
 *     history: [],
 * });
 * logger.info(
 *     `Status: ${result.status}, Response time: ${result.responseTime}ms`
 * );
 * ```
 *
 * @public
 *
 * @see {@link IMonitorService} - Interface contract for monitor services
 * @see {@link MonitorServiceConfig} - Service-level configuration options
 * @see {@link performPingCheckWithRetry} - Core ping checking functionality
 */

import type { MonitorType, Site } from "@shared/types";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";
import { createMonitorConfig } from "./createMonitorConfig";
// Type guard utilities are available but PingMonitor retains explicit check here
import {
    createMonitorErrorResult,
    validateMonitorHost,
} from "./shared/monitorServiceHelpers";
import { performPingCheckWithRetry } from "./utils/pingRetry";

/**
 * Service for performing ping monitoring checks.
 *
 * @remarks
 * Implements the {@link IMonitorService} interface to provide ICMP ping
 * connectivity monitoring with advanced features for reliability and
 * performance. Uses the node-ping wrapper around system ping utilities for
 * cross-platform compatibility.
 *
 * The service automatically handles different types of network failures and
 * provides detailed error reporting for troubleshooting connectivity issues.
 * All ping operations use only cross-platform options for maximum
 * compatibility.
 *
 * Key features:
 *
 * - Cross-platform ping execution using only compatible options
 * - Configurable timeout and retry behavior
 * - Detailed response time measurement
 * - Comprehensive error handling with meaningful messages
 * - Integration with operational hooks for monitoring and debugging
 *
 * @example
 *
 * ```typescript
 * const monitor = new PingMonitor({
 *     timeout: 10000,
 *     retryAttempts: 3,
 * });
 *
 * const result = await monitor.check(pingMonitorData);
 * if (result.status === "up") {
 *     logger.info(`Ping successful: ${result.responseTime}ms`);
 * }
 * ```
 *
 * @public
 */
export class PingMonitor implements IMonitorService {
    private config: MonitorServiceConfig;

    /**
     * Performs a ping connectivity check on the specified monitor.
     *
     * @remarks
     * Validates the monitor configuration before performing the ping check,
     * ensuring the monitor type is "ping" and a valid host is provided. Uses
     * monitor-specific timeout and retry settings when available, falling back
     * to service defaults.
     *
     * The check process:
     *
     * 1. Validates monitor type and required fields
     * 2. Extracts timeout and retry configuration
     * 3. Performs ping with retry logic using {@link performPingCheckWithRetry} 4.
     *    Returns standardized result with status, response time, and details
     *
     * Response time measurement includes the complete ping operation duration,
     * from initiation to completion or failure.
     *
     * @example
     *
     * ```typescript
     * const monitor = {
     *     id: "ping_001",
     *     type: "ping" as const,
     *     host: "google.com",
     *     timeout: 5000,
     *     retryAttempts: 3,
     *     // ... other required monitor properties
     * };
     *
     * const result = await pingMonitor.check(monitor);
     * logger.info(
     *     `Ping ${monitor.host}: ${result.status} (${result.responseTime}ms)`
     * );
     * ```
     *
     * @param monitor - Monitor configuration containing host and ping settings
     *
     * @returns Promise resolving to {@link MonitorCheckResult} with status,
     *   timing, and error data
     *
     * @throws {@link Error} When monitor validation fails (wrong type or
     *   missing host)
     *
     * @see {@link validateMonitorHost} - Host validation utility
     * @see {@link createMonitorConfig} - Timeout and retry normalization utility
     * @see {@link performPingCheckWithRetry} - Core ping functionality
     */
    public async check(
        monitor: Site["monitors"][0]
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "ping") {
            throw new Error(
                `PingMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const hostError = validateMonitorHost(monitor);
        if (hostError) {
            return createMonitorErrorResult(hostError, 0);
        }

        // Host is guaranteed to be valid at this point due to validation above
        if (!monitor.host) {
            return createMonitorErrorResult("Monitor missing valid host", 0);
        }

        // Normalize effective config (timeout, retryAttempts, interval)
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            retryAttempts: DEFAULT_RETRY_ATTEMPTS,
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        return performPingCheckWithRetry(monitor.host, timeout, retryAttempts);
    }

    /**
     * Creates a new PingMonitor instance with the specified configuration.
     *
     * @remarks
     * Initializes the monitor with default timeout and retry values, merging
     * any provided configuration options. The monitor uses sensible defaults if
     * no configuration is provided, making it safe to instantiate without
     * parameters.
     *
     * Default configuration:
     *
     * - Timeout: 30000ms (30 seconds)
     * - RetryAttempts: 3
     *
     * @example
     *
     * ```typescript
     * // Use default configuration
     * const monitor = new PingMonitor();
     *
     * // Custom configuration
     * const monitor = new PingMonitor({
     *     timeout: 5000,
     *     retryAttempts: 5,
     * });
     * ```
     *
     * @param config - Configuration options for the monitor service
     */
    public constructor(config: MonitorServiceConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    /**
     * Get the current configuration.
     *
     * @remarks
     * Returns a defensive shallow copy of the current configuration to prevent
     * external modification. This ensures configuration immutability and
     * prevents accidental state corruption. Note that this is a shallow copy -
     * only the top-level properties are copied. If nested objects are added to
     * MonitorServiceConfig in the future, they would be referenced, not
     * cloned.
     *
     * @returns A shallow copy of the current monitor configuration
     */
    public getConfig(): MonitorServiceConfig {
        return { ...this.config };
    }

    /**
     * Get the monitor type this service handles.
     *
     * @remarks
     * Returns the string identifier used to route monitoring requests to this
     * service implementation. Uses the {@link MonitorType} union type for type
     * safety and consistency across the application.
     *
     * @returns The monitor type identifier
     */
    public getType(): MonitorType {
        return "ping";
    }

    /**
     * Update the configuration for this monitor service.
     *
     * @remarks
     * Merges the provided configuration with the existing configuration. Only
     * specified properties are updated; undefined properties are ignored. Used
     * for runtime configuration updates without service recreation.
     *
     * @param config - Partial configuration to update
     */
    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }
}
