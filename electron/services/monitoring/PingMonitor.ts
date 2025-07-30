/**
 * Network connectivity monitoring service using ICMP ping for network reachability checks.
 *
 * @remarks
 * Provides comprehensive ping monitoring capabilities for network hosts and endpoints
 * with configurable timeouts, retry logic, and detailed response time measurement.
 * Designed for reliable network connectivity verification using native system ping utilities.
 *
 * The service uses the node-ping wrapper around system ping utilities for cross-platform
 * compatibility, ensuring consistent behavior across Windows, macOS, and Linux platforms.
 * Only cross-platform ping options are used to maximize compatibility.
 *
 * @example
 * ```typescript
 * const pingMonitor = new PingMonitor({ timeout: 5000, retryAttempts: 3 });
 * const result = await pingMonitor.check({
 *   id: "monitor_123",
 *   type: "ping",
 *   host: "example.com",
 *   status: "pending",
 *   monitoring: true,
 *   checkInterval: 300000,
 *   retryAttempts: 3,
 *   timeout: 5000,
 *   responseTime: -1,
 *   history: []
 * });
 * console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
 * ```
 *
 * @public
 * @see {@link IMonitorService} - Interface contract for monitor services
 * @see {@link MonitorConfig} - Configuration options for monitors
 * @see {@link performPingCheckWithRetry} - Core ping checking functionality
 */

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { MonitorType, Site } from "../../types";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { getMonitorRetryAttempts, getMonitorTimeout, hasValidHost } from "./utils/monitorTypeGuards";
import { performPingCheckWithRetry } from "./utils/pingRetry";

/**
 * Service for performing ping monitoring checks.
 *
 * @remarks
 * Implements the {@link IMonitorService} interface to provide ICMP ping connectivity
 * monitoring with advanced features for reliability and performance. Uses the
 * node-ping wrapper around system ping utilities for cross-platform compatibility.
 *
 * The service automatically handles different types of network failures and
 * provides detailed error reporting for troubleshooting connectivity issues.
 * All ping operations use only cross-platform options for maximum compatibility.
 *
 * Key features:
 * - Cross-platform ping execution using only compatible options
 * - Configurable timeout and retry behavior
 * - Detailed response time measurement
 * - Comprehensive error handling with meaningful messages
 * - Integration with operational hooks for monitoring and debugging
 *
 * @example
 * ```typescript
 * const monitor = new PingMonitor({
 *   timeout: 10000,
 *   retryAttempts: 3
 * });
 *
 * const result = await monitor.check(pingMonitorData);
 * if (result.status === "up") {
 *   console.log(`Ping successful: ${result.responseTime}ms`);
 * }
 * ```
 *
 * @public
 */
export class PingMonitor implements IMonitorService {
    private config: MonitorConfig;

    /**
     * Creates a new PingMonitor instance with the specified configuration.
     *
     * @param config - Configuration options for the monitor service
     *
     * @remarks
     * Initializes the monitor with default timeout and retry values, merging any
     * provided configuration options. The monitor uses sensible defaults if no
     * configuration is provided, making it safe to instantiate without parameters.
     *
     * Default configuration:
     * - timeout: 30000ms (30 seconds)
     * - retryAttempts: 3
     *
     * @example
     * ```typescript
     * // Use default configuration
     * const monitor = new PingMonitor();
     *
     * // Custom configuration
     * const monitor = new PingMonitor({
     *   timeout: 5000,
     *   retryAttempts: 5
     * });
     * ```
     */
    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    /**
     * Performs a ping connectivity check on the specified monitor.
     *
     * @param monitor - Monitor configuration containing host and ping settings
     * @returns Promise resolving to {@link MonitorCheckResult} with status, timing, and error data
     *
     * @throws {@link Error} When monitor validation fails (wrong type or missing host)
     *
     * @remarks
     * Validates the monitor configuration before performing the ping check, ensuring
     * the monitor type is "ping" and a valid host is provided. Uses monitor-specific
     * timeout and retry settings when available, falling back to service defaults.
     *
     * The check process:
     * 1. Validates monitor type and required fields
     * 2. Extracts timeout and retry configuration
     * 3. Performs ping with retry logic using {@link performPingCheckWithRetry}
     * 4. Returns standardized result with status, response time, and details
     *
     * Response time measurement includes the complete ping operation duration,
     * from initiation to completion or failure.
     *
     * @example
     * ```typescript
     * const monitor = {
     *   id: "ping_001",
     *   type: "ping" as const,
     *   host: "google.com",
     *   timeout: 5000,
     *   retryAttempts: 3,
     *   // ... other required monitor properties
     * };
     *
     * const result = await pingMonitor.check(monitor);
     * console.log(`Ping ${monitor.host}: ${result.status} (${result.responseTime}ms)`);
     * ```
     *
     * @see {@link hasValidHost} - Host validation utility
     * @see {@link getMonitorTimeout} - Timeout extraction utility
     * @see {@link getMonitorRetryAttempts} - Retry attempts extraction utility
     * @see {@link performPingCheckWithRetry} - Core ping functionality
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "ping") {
            throw new Error(`PingMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!hasValidHost(monitor)) {
            return {
                details: "Missing or invalid host configuration",
                error: "Ping monitor missing valid host",
                responseTime: 0,
                status: "down",
            };
        }

        // Use type-safe utility functions instead of type assertions
        const timeout = getMonitorTimeout(monitor, this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT);
        const retryAttempts = getMonitorRetryAttempts(monitor, DEFAULT_RETRY_ATTEMPTS);

        return performPingCheckWithRetry(monitor.host, timeout, retryAttempts);
    }

    /**
     * Get the current configuration.
     *
     * @returns A shallow copy of the current monitor configuration
     *
     * @remarks
     * Returns a defensive shallow copy of the current configuration to prevent
     * external modification. This ensures configuration immutability and prevents
     * accidental state corruption. Note that this is a shallow copy - only the
     * top-level properties are copied. If nested objects are added to MonitorConfig
     * in the future, they would be referenced, not cloned.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }

    /**
     * Get the monitor type this service handles.
     *
     * @returns The monitor type identifier
     *
     * @remarks
     * Returns the string identifier used to route monitoring requests
     * to this service implementation. Uses the {@link MonitorType} union type
     * for type safety and consistency across the application.
     */
    public getType(): MonitorType {
        return "ping";
    }

    /**
     * Update the configuration for this monitor service.
     *
     * @param config - Partial configuration to update
     *
     * @remarks
     * Merges the provided configuration with the existing configuration.
     * Only specified properties are updated; undefined properties are ignored.
     * Used for runtime configuration updates without service recreation.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }
}
