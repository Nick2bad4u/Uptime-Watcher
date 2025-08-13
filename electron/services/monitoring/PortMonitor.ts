/**
 * TCP/UDP port monitoring service for network connectivity health checks.
 *
 * @remarks
 * Provides comprehensive port monitoring capabilities for TCP and UDP
 * endpoints with configurable timeouts, retry logic, and intelligent
 * connection handling. Designed for reliable network connectivity verification
 * across various protocols.
 *
 * @public
 *
 * @see {@link IMonitorService} for interface contract
 * @see {@link MonitorConfig} for configuration options
 *
 * @example
 * ```typescript
 * const portMonitor = new PortMonitor({ timeout: 5000 });
 * const result = await portMonitor.check({
 *   id: "mon_1",
 *   type: "port",
 *   host: "example.com",
 *   port: 443,
 *   status: "pending",
 *   // ... other monitor properties
 * });
 * console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
 * ```
 *
 * @packageDocumentation
 */

import type { MonitorType, Site } from "@shared/types";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    validateMonitorHostAndPort,
} from "./shared/monitorServiceHelpers";
import { performPortCheckWithRetry } from "./utils/portRetry";

/**
 * Service for performing port monitoring checks.
 *
 * @remarks
 * Implements the IMonitorService interface to provide TCP/UDP port
 * connectivity monitoring with advanced features for reliability and
 * performance. Uses native Node.js networking APIs with custom timeout and
 * retry logic.
 *
 * The service automatically handles different types of network failures and
 * provides detailed error reporting for troubleshooting connectivity issues.
 */
export class PortMonitor implements IMonitorService {
    private config: MonitorConfig;

    /**
     * Perform a port connectivity check on the given monitor.
     *
     * @param monitor - Monitor configuration of type {@link Site}["monitors"][0] containing host, port, and connection settings
     * @returns Promise resolving to check result with status and timing data
     *
     * @throws {@link Error} when monitor type is not "port"
     *
     * @remarks
     * Uses per-monitor retry attempts and timeout configuration for robust
     * connectivity checking. Falls back to service defaults when
     * monitor-specific values are not provided. Validates monitor
     * configuration before attempting connection and provides detailed error
     * information for failures.
     *
     * Now uses type guards to safely handle potentially undefined
     * configuration values.
     *
     * The check will use the monitor's configured timeout if available,
     * falling back to the service default. Response time includes the full
     * connection establishment time for accurate performance metrics.
     */
    public async check(
        monitor: Site["monitors"][0]
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "port") {
            throw new Error(
                `PortMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const hostPortError = validateMonitorHostAndPort(monitor);
        if (hostPortError) {
            return createMonitorErrorResult(hostPortError, 0);
        }

        // Host and port are guaranteed to be valid at this point due to
        // validation above
        if (!monitor.host || !monitor.port) {
            return createMonitorErrorResult(
                "Port monitor missing valid host or port",
                0
            );
        }

        // Use type-safe utility functions instead of type assertions
        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout
        );

        return performPortCheckWithRetry(
            monitor.host,
            monitor.port,
            timeout,
            retryAttempts
        );
    }

    /**
     * Create a new PortMonitor instance.
     *
     * @param config - Configuration options for the monitor
     *
     * @remarks
     * Initializes the monitor with default timeout values and merges any
     * provided configuration options. Safe to instantiate multiple times
     * with different configurations for various monitoring needs.
     */
    public constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT, // Use consistent default timeout
            ...config,
        };
    }

    /**
     * Get the current configuration.
     *
     * @returns A shallow copy of the current monitor configuration
     *
     * @remarks
     * Returns a defensive shallow copy of the current configuration to prevent
     * external modification. This ensures configuration immutability and
     * prevents accidental state corruption. Note that this is a shallow copy -
     * only the top-level properties are copied. If nested objects are added to
     * MonitorConfig in the future, they would be referenced, not cloned.
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
        return "port";
    }

    /**
     * Update the configuration for this monitor.
     *
     * @param config - Partial configuration to merge with existing settings
     *
     * @remarks
     * Updates the monitor's configuration by performing a shallow merge of the
     * provided partial configuration with existing settings. This allows
     * dynamic reconfiguration of timeout values and other parameters without
     * recreating the monitor instance.
     *
     * The merge is shallow - nested objects are not deeply merged. Only
     * validates that provided values are of correct types but does not
     * validate ranges or other business logic constraints.
     *
     * Note: Only validates port-relevant configuration properties.
     *
     * @throws {@link Error} if config contains invalid property types
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        // Basic validation of config properties - only validate relevant ones
        // for port monitoring
        if (
            config.timeout !== undefined &&
            (typeof config.timeout !== "number" || config.timeout <= 0)
        ) {
            throw new Error("Invalid timeout: must be a positive number");
        }

        // Note: userAgent is not relevant for port monitoring, so we don't
        // validate it This fixes the configuration validation inconsistency
        // identified in the review

        this.config = {
            ...this.config,
            ...config,
        };
    }
}
