import isPortReachable from "is-port-reachable";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF } from "../../constants";
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

        return await this.performPortCheckWithRetry(monitor.host, monitor.port, timeout, retryAttempts);
    }

    /**
     * Perform port check with retry logic.
     */
    private async performPortCheckWithRetry(
        host: string,
        port: number,
        timeout: number,
        maxRetries: number
    ): Promise<MonitorCheckResult> {
        const totalAttempts = maxRetries + 1; // Initial attempt + retries

        for (const attempt of Array.from({ length: totalAttempts }, (_, i) => i)) {
            const startTime = performance.now();

            try {
                if (isDev()) {
                    logger.debug(
                        `[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms (attempt ${attempt + 1}/${totalAttempts})`
                    );
                }

                const isReachable = await isPortReachable(port, {
                    host: host,
                    timeout: timeout,
                });

                const responseTime = Math.round(performance.now() - startTime);

                if (isReachable) {
                    if (isDev() && attempt > 0) {
                        logger.debug(
                            `[PortMonitor] Port ${host}:${port} succeeded on attempt ${attempt + 1}/${totalAttempts}`
                        );
                    }
                    if (isDev()) {
                        logger.debug(`[PortMonitor] Port ${host}:${port} is reachable in ${responseTime}ms`);
                    }
                    return {
                        details: String(port),
                        responseTime,
                        status: "up",
                    };
                } else {
                    const responseTime = Math.round(performance.now() - startTime);

                    if (isDev()) {
                        logger.debug(
                            `[PortMonitor] Port ${host}:${port} not reachable on attempt ${attempt + 1}/${totalAttempts}`
                        );
                    }

                    // If this wasn't the last attempt, wait before retrying
                    if (attempt < totalAttempts - 1) {
                        // Simple exponential backoff: 500ms, 1s, 2s, 4s, etc.
                        const delayMs = Math.min(
                            RETRY_BACKOFF.INITIAL_DELAY * Math.pow(2, attempt),
                            RETRY_BACKOFF.MAX_DELAY
                        );
                        await new Promise((resolve) => setTimeout(resolve, delayMs));
                    } else {
                        // Return the final failure result
                        return {
                            details: String(port),
                            error: "Port not reachable",
                            responseTime,
                            status: "down",
                        };
                    }
                }
            } catch (error) {
                const responseTime = Math.round(performance.now() - startTime);

                if (isDev()) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    logger.debug(
                        `[PortMonitor] Error checking port ${host}:${port} on attempt ${attempt + 1}/${totalAttempts}: ${errorMessage}`
                    );
                }

                // If this wasn't the last attempt, wait before retrying
                if (attempt < totalAttempts - 1) {
                    // Simple exponential backoff: 500ms, 1s, 2s, 4s, etc.
                    const delayMs = Math.min(
                        RETRY_BACKOFF.INITIAL_DELAY * Math.pow(2, attempt),
                        RETRY_BACKOFF.MAX_DELAY
                    );
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                } else {
                    // Return the final error result
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    return {
                        details: String(port),
                        error: errorMessage,
                        responseTime,
                        status: "down",
                    };
                }
            }
        }

        // This should never be reached, but TypeScript needs it
        throw new Error("Unexpected end of retry loop");
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
