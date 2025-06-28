import isPortReachable from "is-port-reachable";

import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";

/**
 * Service for performing port monitoring checks.
 * Handles TCP port connectivity checks with configurable timeouts.
 */
export class PortMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            retries: 1,
            timeout: 5000, // 5 seconds default for port checks
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

        const startTime = Date.now();

        try {
            if (isDev()) {
                logger.debug(`[PortMonitor] Checking port: ${monitor.host}:${monitor.port}`);
            }

            const isReachable = await isPortReachable(monitor.port, {
                host: monitor.host,
                timeout: this.config.timeout,
            });

            const responseTime = Date.now() - startTime;

            if (isReachable) {
                if (isDev()) {
                    logger.debug(
                        `[PortMonitor] Port ${monitor.host}:${monitor.port} is reachable in ${responseTime}ms`
                    );
                }
                return {
                    details: String(monitor.port),
                    responseTime,
                    status: "up",
                };
            } else {
                if (isDev()) {
                    logger.debug(
                        `[PortMonitor] Port ${monitor.host}:${monitor.port} is not reachable after ${responseTime}ms`
                    );
                }
                return {
                    details: String(monitor.port),
                    error: "Port not reachable",
                    responseTime,
                    status: "down",
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            if (isDev()) {
                logger.debug(`[PortMonitor] Error checking port ${monitor.host}:${monitor.port}: ${errorMessage}`);
            }

            return {
                details: String(monitor.port),
                error: errorMessage,
                responseTime,
                status: "down",
            };
        }
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
