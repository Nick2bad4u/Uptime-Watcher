import type { Site } from "@shared/types";
/**
 * TCP port monitoring service for network connectivity health checks.
 *
 * @remarks
 * Provides port monitoring capabilities for TCP endpoints with configurable
 * timeouts and retry logic.
 *
 * @example
 *
 * ```typescript
 * const portMonitor = new PortMonitor({ timeout: 5000 });
 * const result = await portMonitor.check({
 *     id: "mon_1",
 *     type: "port",
 *     host: "example.com",
 *     port: 443,
 *     status: "pending",
 *     // ... other monitor properties
 * });
 * logger.info(
 *     `Status: ${result.status}, Response time: ${result.responseTime}ms`
 * );
 * ```
 *
 * @public
 *
 * @packageDocumentation
 *
 * @see `IMonitorService` for interface contract
 * @see {@link MonitorServiceConfig} for configuration options
 */

import type { MonitorCheckResult, MonitorServiceConfig } from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { ConfigurableMonitorServiceBase } from "./shared/configurableMonitorServiceBase";
import { assertPositiveTimeoutConfigUpdate } from "./shared/monitorServiceConfigMerging";
import {
    createMonitorConfig,
    createMonitorErrorResult,
    validateMonitorHostAndPort,
} from "./shared/monitorServiceHelpers";
import { performPortCheckWithRetry } from "./utils/portRetry";

/**
 * Service for performing port monitoring checks.
 *
 * @remarks
 * Implements the IMonitorService interface to provide TCP/UDP port connectivity
 * monitoring with advanced features for reliability and performance. Uses
 * native Node.js networking APIs with custom timeout and retry logic.
 *
 * The service automatically handles different types of network failures and
 * provides detailed error reporting for troubleshooting connectivity issues.
 */
export class PortMonitor extends ConfigurableMonitorServiceBase<"port"> {
    /**
     * Perform a port connectivity check on the given monitor.
     *
     * @remarks
     * Uses per-monitor retry attempts and timeout configuration for robust
     * connectivity checking. Falls back to service defaults when
     * monitor-specific values are not provided. Validates monitor configuration
     * before attempting connection and provides detailed error information for
     * failures.
     *
     * Now uses type guards to safely handle potentially undefined configuration
     * values.
     *
     * The check will use the monitor's configured timeout if available, falling
     * back to the service default. Response time includes the full connection
     * establishment time for accurate performance metrics.
     *
     * @param monitor - Monitor configuration of type {@link Site}["monitors"][0]
     *   containing host, port, and connection settings
     *
     * @returns Promise resolving to check result with status and timing data
     *
     * @throws `Error` when monitor type is not "port"
     */
    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
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

        const host = monitor.host.trim();

        // Use type-safe utility functions instead of type assertions
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        return performPortCheckWithRetry(
            host,
            monitor.port,
            timeout,
            retryAttempts,
            signal
        );
    }

    /**
     * Create a new PortMonitor instance.
     *
     * @remarks
     * Initializes the monitor with default timeout values and merges any
     * provided configuration options. Safe to instantiate multiple times with
     * different configurations for various monitoring needs.
     *
     * @param config - Configuration options for the monitor
     */
    public constructor(config: MonitorServiceConfig = {}) {
        super({
            config,
            defaultTimeoutMs: DEFAULT_REQUEST_TIMEOUT,
            type: "port",
        });
    }

    protected override validateConfigUpdate(
        config: Partial<MonitorServiceConfig>
    ): void {
        assertPositiveTimeoutConfigUpdate(config);
    }
}
