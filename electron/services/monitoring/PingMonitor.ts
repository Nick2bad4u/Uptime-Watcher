/**
 * Network connectivity monitoring service for host/endpoint reachability.
 *
 * @remarks
 * Despite the historical "Ping" naming, this monitor uses **native TCP/DNS/HTTP
 * connectivity checks** (via {@link performPingCheckWithRetry}) rather than ICMP
 * ping. This keeps behaviour consistent across platforms and avoids relying on
 * privileged ICMP sockets or external system utilities.
 *
 * The check auto-detects URL targets (HTTP/HTTPS) vs host targets (TCP/DNS) and
 * applies retry/backoff behaviour through the operational hooks layer.
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
 * @see `IMonitorService` - Interface contract for monitor services
 * @see {@link MonitorServiceConfig} - Service-level configuration options
 * @see {@link performPingCheckWithRetry} - Core ping checking functionality
 */

import type { Site } from "@shared/types";

import type { MonitorCheckResult, MonitorServiceConfig } from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";
import { createMonitorConfig } from "./createMonitorConfig";
import { ConfigurableMonitorServiceBase } from "./shared/configurableMonitorServiceBase";
import { resolveMonitorHost } from "./shared/monitorServiceHelpers";
import { performPingCheckWithRetry } from "./utils/pingRetry";

/**
 * Service for performing ping monitoring checks.
 *
 * @remarks
 * Implements the `IMonitorService` interface to provide ICMP ping
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
 *     logger.info("Ping successful", {
 *         responseTime: result.responseTime,
 *     });
 * }
 * ```
 *
 * @public
 */
export class PingMonitor extends ConfigurableMonitorServiceBase<"ping"> {
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
     * @throws `Error` when monitor validation fails (wrong type or
     *   missing host)
     *
     * @see {@link resolveMonitorHost} - Host validation utility
     * @see {@link createMonitorConfig} - Timeout and retry normalization utility
     * @see {@link performPingCheckWithRetry} - Core ping functionality
     */
    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "ping") {
            throw new Error(
                `PingMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const hostResolution = resolveMonitorHost(monitor);
        if (!hostResolution.ok) {
            return hostResolution.result;
        }

        const { host } = hostResolution;

        // Normalize effective config (timeout, retryAttempts, interval)
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            retryAttempts: DEFAULT_RETRY_ATTEMPTS,
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        return performPingCheckWithRetry(host, timeout, retryAttempts, signal);
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
        super({
            config,
            defaultTimeoutMs: DEFAULT_REQUEST_TIMEOUT,
            type: "ping",
        });
    }
}
