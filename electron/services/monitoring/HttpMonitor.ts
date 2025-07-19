/**
 * HTTP/HTTPS monitoring service for web endpoint health checks.
 *
 * @remarks
 * Provides comprehensive HTTP monitoring capabilities with advanced Axios features
 * for optimal performance and reliability. Supports precise response time measurement,
 * per-monitor timeout configuration, and intelligent status code interpretation.
 *
 * @public
 *
 * @see {@link IMonitorService} for interface contract
 * @see {@link MonitorConfig} for configuration options
 * @see {@link MonitorCheckResult} for result types
 *
 * @example
 * ```typescript
 * const httpMonitor = new HttpMonitor({ timeout: 5000 });
 * const result = await httpMonitor.check({
 *   id: "mon_1",
 *   type: "http",
 *   url: "https://example.com",
 *   status: "pending",
 *   // ... other monitor properties
 * });
 * console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
 * ```
 *
 * @packageDocumentation
 */

import { AxiosInstance } from "axios";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF, USER_AGENT } from "../../constants";
import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { createErrorResult, handleCheckError } from "./utils/errorHandling";
import { createHttpClient } from "./utils/httpClient";
import { determineMonitorStatus } from "./utils/httpStatusUtils";

/**
 * Declaration merging to extend Axios types with timing metadata.
 *
 * @remarks
 * Extends Axios request/response interfaces to support precise timing measurements
 * through request interceptors and response metadata.
 */
declare module "axios" {
    /** Extended error with response time (if available) */
    interface AxiosError {
        /** Response time at point of failure (if available) */
        responseTime?: number;
    }

    /** Extended response with calculated response time */
    interface AxiosResponse {
        /** Calculated response time in milliseconds */
        responseTime?: number;
    }

    /** Extended request config with timing metadata */
    interface InternalAxiosRequestConfig {
        metadata?: {
            /** High-precision start time for response time calculation */
            startTime: number;
        };
    }
}

/**
 * Service for performing HTTP/HTTPS monitoring checks.
 *
 * @remarks
 * Implements the IMonitorService interface to provide HTTP endpoint monitoring
 * with advanced features for reliability and performance. Uses Axios with custom
 * interceptors for precise timing and comprehensive error handling.
 *
 * The service is designed for monitoring use cases where response time accuracy
 * and failure detection are critical. It includes intelligent status code
 * interpretation suitable for uptime monitoring scenarios.
 */
export class HttpMonitor implements IMonitorService {
    /** Axios instance with custom interceptors and configuration */
    private axiosInstance: AxiosInstance;
    /** Configuration for HTTP monitoring behavior */
    private config: MonitorConfig;

    /**
     * Initialize the HTTP monitor with optional configuration.
     *
     * @param config - Optional configuration overrides for HTTP monitoring
     *
     * @remarks
     * Creates an Axios instance with optimized settings for monitoring,
     * including timing interceptors, appropriate timeouts, and security limits.
     */
    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            userAgent: USER_AGENT,
            ...config,
        };

        // Create Axios instance with advanced configuration (best practices)
        this.axiosInstance = createHttpClient({
            timeout: DEFAULT_REQUEST_TIMEOUT,
            userAgent: USER_AGENT,
            ...config,
        });
    }

    /**
     * Perform an HTTP health check on the given monitor.
     * Uses per-monitor retry attempts and timeout configuration.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(`HttpMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.url) {
            return createErrorResult("HTTP monitor missing URL", 0);
        }

        const timeout = monitor.timeout;
        const retryAttempts = monitor.retryAttempts;

        return this.performHealthCheckWithRetry(monitor.url, timeout, retryAttempts);
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }

    /**
     * Get the monitor type this service handles.
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
    }

    /**
     * Update the configuration for this monitor.
     * Recreates the Axios instance with updated configuration.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };

        // Recreate Axios instance with updated configuration
        this.axiosInstance = createHttpClient(this.config);
    }

    /**
     * Make the actual HTTP request using Axios.
     */
    private async makeRequest(url: string, timeout: number) {
        // Use our configured Axios instance with specific timeout override
        return this.axiosInstance.get(url, {
            timeout,
        });
    }

    /**
     * Perform health check with retry logic.
     */
    private async performHealthCheckWithRetry(
        url: string,
        timeout: number,
        maxRetries: number
    ): Promise<MonitorCheckResult> {
        try {
            // maxRetries parameter is "additional retries after first attempt"
            // withOperationalHooks expects "total attempts"
            // So if maxRetries=3, we want 4 total attempts (1 initial + 3 retries)
            const totalAttempts = maxRetries + 1;

            return await withOperationalHooks(() => this.performSingleHealthCheck(url, timeout), {
                initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                maxRetries: totalAttempts,
                operationName: `HTTP check for ${url}`,
                ...(isDev() && {
                    onRetry: (attempt: number, error: Error) => {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logger.debug(
                            `[HttpMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                        );
                    },
                }),
            });
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    /**
     * Perform a single health check attempt without retry logic.
     */
    private async performSingleHealthCheck(url: string, timeout: number): Promise<MonitorCheckResult> {
        if (isDev()) {
            logger.debug(`[HttpMonitor] Checking URL: ${url} with timeout: ${timeout}ms`);
        }

        const response = await this.makeRequest(url, timeout);
        const responseTime = response.responseTime ?? 0;

        if (isDev()) {
            logger.debug(`[HttpMonitor] URL ${url} responded with status ${response.status} in ${responseTime}ms`);
        }

        // Determine status based on HTTP status code
        const status = determineMonitorStatus(response.status);

        return {
            details: String(response.status),
            responseTime,
            status,
            ...(status === "down" && { error: `HTTP ${response.status}` }),
        };
    }
}
