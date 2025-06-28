import axios from "axios";

import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";

/**
 * Service for performing HTTP/HTTPS monitoring checks.
 * Handles URL health checks with configurable timeouts and error handling.
 */
export class HttpMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            retries: 1,
            timeout: 10000, // 10 seconds default
            userAgent: "Uptime-Watcher/1.0",
            ...config,
        };
    }

    /**
     * Get the monitor type this service handles.
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
    }

    /**
     * Perform an HTTP health check on the given monitor.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(`HttpMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.url) {
            return {
                details: "HTTP monitor missing URL",
                error: "HTTP monitor missing URL",
                responseTime: 0,
                status: "down",
            };
        }

        const startTime = Date.now();

        try {
            if (isDev()) {
                logger.debug(`[HttpMonitor] Checking URL: ${monitor.url}`);
            }

            const response = await axios.get(monitor.url, {
                headers: {
                    "User-Agent": this.config.userAgent,
                },
                // Disable redirects for more accurate response time
                maxRedirects: 5,
                timeout: this.config.timeout,
                validateStatus: (status: number) => status < 500, // Accept 1xx-4xx as "up"
            });

            const responseTime = Date.now() - startTime;
            const status = response.status;

            if (isDev()) {
                logger.debug(`[HttpMonitor] URL ${monitor.url} responded with status ${status} in ${responseTime}ms`);
            }

            return {
                details: String(status),
                responseTime,
                status: "up",
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            // Check if it's a timeout error
            if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                    if (isDev()) {
                        logger.debug(`[HttpMonitor] URL ${monitor.url} timed out after ${responseTime}ms`);
                    }
                    return {
                        details: "0",
                        error: "Timeout",
                        responseTime,
                        status: "down",
                    };
                }

                // Handle specific HTTP errors
                if (error.response) {
                    const status = error.response.status;
                    if (isDev()) {
                        logger.debug(`[HttpMonitor] URL ${monitor.url} returned HTTP ${status} in ${responseTime}ms`);
                    }

                    // 5xx errors are considered "down"
                    if (status >= 500) {
                        return {
                            details: String(status),
                            error: `HTTP ${status}`,
                            responseTime,
                            status: "down",
                        };
                    }

                    // 4xx errors are considered "up" but with error details
                    return {
                        details: String(status),
                        responseTime,
                        status: "up",
                    };
                }

                // Network errors
                if (isDev()) {
                    logger.debug(`[HttpMonitor] Network error for ${monitor.url}: ${errorMessage}`);
                }
                return {
                    details: "0",
                    error: errorMessage,
                    responseTime,
                    status: "down",
                };
            }

            logger.error(`[HttpMonitor] Unexpected error checking ${monitor.url}`, error);
            return {
                details: "0",
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
