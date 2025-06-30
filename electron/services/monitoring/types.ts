import { Site } from "../../types";

/**
 * Result of a monitor check operation.
 */
export interface MonitorCheckResult {
    status: "up" | "down";
    responseTime: number;
    details?: string;
    error?: string;
}

/**
 * Interface for monitor services that perform health checks.
 */
export interface IMonitorService {
    /**
     * Perform a health check on a monitor.
     */
    check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult>;

    /**
     * Get the type of monitor this service handles.
     */
    getType(): Site["monitors"][0]["type"];
}

/**
 * Configuration for monitor checks.
 */
export interface MonitorConfig {
    timeout?: number;
    userAgent?: string;
}
