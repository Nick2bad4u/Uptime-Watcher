import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { Site } from "../../types";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { performPortCheckWithRetry } from "./utils";

/**
 * Service for performing port monitoring checks.
 * Handles TCP port connectivity checks with configurable timeouts.
 */
export class PortMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT, // Use consistent default timeout
            ...config,
        };
    }

    /**
     * Get the monitor type this service handles.
     */
    public getType(): Site["monitors"][0]["type"] {
        return "port";
    }

    /**
     * Perform a port connectivity check on the given monitor.
     * Uses per-monitor retry attempts and timeout configuration.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "port") {
            throw new Error(`PortMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.host || !monitor.port) {
            return {
                details: "0",
                error: "Port monitor missing host or port",
                responseTime: 0,
                status: "down",
            };
        }

        const timeout = monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT;
        const retryAttempts = monitor.retryAttempts ?? 0;

        return performPortCheckWithRetry(monitor.host, monitor.port, timeout, retryAttempts);
    }

    /**
     * Update the configuration for this monitor.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }
}
