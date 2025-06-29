import axios, { AxiosInstance } from "axios";

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
    private axiosInstance: AxiosInstance;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            retries: 1,
            timeout: 10000, // 10 seconds default
            userAgent: "Uptime-Watcher/1.0",
            ...config,
        };

        // Create Axios instance with default configuration (best practice)
        this.axiosInstance = axios.create({
            headers: {
                "User-Agent": this.config.userAgent,
            },
            maxRedirects: 5,
            timeout: this.config.timeout,
        });
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
            return this.createErrorResult("HTTP monitor missing URL", 0);
        }

        const startTime = Date.now();

        try {
            if (isDev()) {
                logger.debug(`[HttpMonitor] Checking URL: ${monitor.url}`);
            }

            const response = await this.makeRequest(monitor.url);
            const responseTime = Date.now() - startTime;

            if (isDev()) {
                logger.debug(
                    `[HttpMonitor] URL ${monitor.url} responded with status ${response.status} in ${responseTime}ms`
                );
            }

            return {
                details: String(response.status),
                responseTime,
                status: "up",
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return this.handleRequestError(error, monitor.url, responseTime);
        }
    }

    /**
     * Make the actual HTTP request using Axios.
     */
    private async makeRequest(url: string) {
        // Use our configured Axios instance
        return await this.axiosInstance.get(url);
    }

    /**
     * Handle Axios request errors and convert them to MonitorCheckResult.
     */
    private handleRequestError(error: unknown, url: string, responseTime: number): MonitorCheckResult {
        // Use Axios built-in error detection (simplified approach)
        if (axios.isAxiosError(error)) {
            // Handle timeout and cancellation errors
            if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
                if (isDev()) {
                    logger.debug(`[HttpMonitor] URL ${url} timed out after ${responseTime}ms`);
                }
                return this.createErrorResult("Timeout", responseTime);
            }

            // Handle HTTP response errors (5xx are down, 4xx are up with error details)
            if (error.response) {
                return this.handleHttpError(error.response.status, url, responseTime);
            }

            // Network errors (DNS, connection refused, etc.)
            const errorMessage = error.message || "Network error";
            if (isDev()) {
                logger.debug(`[HttpMonitor] Network error for ${url}: ${errorMessage}`);
            }
            return this.createErrorResult(errorMessage, responseTime);
        }

        // Non-Axios errors (shouldn't happen, but just in case)
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.error(`[HttpMonitor] Unexpected error checking ${url}`, error);
        return this.createErrorResult(errorMessage, responseTime);
    }

    /**
     * Handle HTTP status code errors.
     */
    private handleHttpError(status: number, url: string, responseTime: number): MonitorCheckResult {
        if (isDev()) {
            logger.debug(`[HttpMonitor] URL ${url} returned HTTP ${status} in ${responseTime}ms`);
        }

        // 5xx server errors are considered "down"
        if (status >= 500) {
            return {
                details: String(status),
                error: `HTTP ${status}`,
                responseTime,
                status: "down",
            };
        }

        // 4xx client errors are considered "up" (site is responding)
        return {
            details: String(status),
            responseTime,
            status: "up",
        };
    }

    /**
     * Create a standard error result.
     */
    private createErrorResult(error: string, responseTime: number): MonitorCheckResult {
        return {
            details: "0",
            error,
            responseTime,
            status: "down",
        };
    }

    /**
     * Update the configuration for this monitor.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = { ...this.config, ...config };
        
        // Recreate Axios instance with updated configuration
        this.axiosInstance = axios.create({
            headers: {
                "User-Agent": this.config.userAgent,
            },
            maxRedirects: 5,
            timeout: this.config.timeout,
        });
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }
}
