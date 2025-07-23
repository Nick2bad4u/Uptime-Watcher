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

import { AxiosInstance, AxiosResponse } from "axios";

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
     *
     * @param monitor - Monitor configuration of type {@link Site}["monitors"][0] containing URL and settings
     * @returns Promise resolving to check result with status and timing data
     *
     * @throws Error when monitor type is not "http"
     *
     * @remarks
     * Uses per-monitor retry attempts and timeout configuration for robust
     * connectivity checking. Falls back to service defaults when monitor-specific
     * values are not provided. Utilizes operational hooks for retry logic and
     * comprehensive error handling.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(`HttpMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.url) {
            return createErrorResult("HTTP monitor missing URL", 0);
        }

        // Note: Despite type definitions, these values can be undefined in practice (see tests)
        const timeout = (monitor.timeout as number | undefined) ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT;
        const retryAttempts = (monitor.retryAttempts as number | undefined) ?? 3; // Default retry attempts

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
     *
     * @param config - Partial configuration to merge with existing settings
     *
     * @remarks
     * Updates the monitor's configuration by performing a shallow merge of the provided
     * partial configuration with existing settings. This recreates the underlying Axios
     * instance with the updated configuration to ensure all changes take effect.
     *
     * The merge is shallow - nested objects are not deeply merged. Only validates
     * that provided values are of correct types but does not validate ranges or
     * other business logic constraints.
     *
     * @throws Error if config contains invalid property types
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        // Basic validation of config properties
        if (config.timeout !== undefined && (typeof config.timeout !== "number" || config.timeout <= 0)) {
            throw new Error("Invalid timeout: must be a positive number");
        }
        if (config.userAgent !== undefined && typeof config.userAgent !== "string") {
            throw new Error("Invalid userAgent: must be a string");
        }

        this.config = {
            ...this.config,
            ...config,
        };

        // Recreate Axios instance with updated configuration
        this.axiosInstance = createHttpClient(this.config);
    }

    /**
     * Make the actual HTTP request using Axios.
     *
     * @param url - The URL to request
     * @param timeout - Request timeout in milliseconds
     * @returns Promise resolving to Axios response with timing metadata
     *
     * @remarks
     * Uses the configured Axios instance with per-request timeout override.
     * The response includes timing metadata injected by request interceptors.
     */
    private async makeRequest(url: string, timeout: number): Promise<AxiosResponse> {
        // Use our configured Axios instance with specific timeout override
        return this.axiosInstance.get(url, {
            timeout,
        });
    }

    /**
     * Perform health check with retry logic using operational hooks.
     *
     * @param url - The URL to health check
     * @param timeout - Request timeout in milliseconds
     * @param maxRetries - Maximum number of retry attempts (additional to initial attempt)
     * @returns Promise resolving to monitor check result
     *
     * @remarks
     * Uses {@link withOperationalHooks} for sophisticated retry logic with exponential backoff.
     * The maxRetries parameter represents additional attempts after the initial attempt,
     * so maxRetries=3 results in 4 total attempts (1 initial + 3 retries).
     *
     * Handles all HTTP errors and network failures, converting them to appropriate
     * monitor status results. Uses development logging when in dev mode for debugging.
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
     *
     * @param url - The URL to health check
     * @param timeout - Request timeout in milliseconds
     * @returns Promise resolving to monitor check result
     *
     * @remarks
     * Performs a single HTTP request attempt with comprehensive error handling.
     * Uses precise timing from Axios interceptors for accurate performance measurements.
     * Errors are propagated to the retry logic for handling.
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
