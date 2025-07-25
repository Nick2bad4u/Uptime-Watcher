/**
 * Provides HTTP/HTTPS monitoring for web endpoint health checks.
 *
 * @remarks
 * This module implements the {@link IMonitorService} contract for HTTP monitoring.
 * It uses Axios with custom interceptors for precise response time measurement,
 * per-monitor timeout configuration, and intelligent status code interpretation.
 * All requests are performed with retry logic and exponential backoff via {@link withOperationalHooks}.
 *
 * @see {@link IMonitorService}
 * @see {@link MonitorConfig}
 * @see {@link MonitorCheckResult}
 * @example
 * ```typescript
 * const httpMonitor = new HttpMonitor({ timeout: 5000 });
 * const result = await httpMonitor.check({
 *   id: "mon_1",
 *   type: "http",
 *   url: "https://example.com",
 *   status: "pending",
 * });
 * console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
 * ```
 * @public
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
 * Extends Axios types to support timing metadata for monitoring.
 *
 * @remarks
 * Declaration merging is used to add response time fields to AxiosError,
 * AxiosResponse, and InternalAxiosRequestConfig for accurate timing.
 * These fields are populated by Axios interceptors in {@link createHttpClient}.
 * @see {@link createHttpClient}
 * @internal
 */
declare module "axios" {
    /**
     * Axios error extended with optional response time.
     * @remarks
     * Used to record the elapsed time at the point of failure.
     */
    interface AxiosError {
        /** Response time at point of failure (milliseconds, if available) */
        responseTime?: number;
    }

    /**
     * Axios response extended with calculated response time.
     * @remarks
     * Populated by Axios response interceptor for monitoring.
     */
    interface AxiosResponse {
        /** Calculated response time in milliseconds */
        responseTime?: number;
    }

    /**
     * Axios request config extended with timing metadata.
     * @remarks
     * Used internally to record request start time for timing calculation.
     */
    interface InternalAxiosRequestConfig {
        metadata?: {
            /** High-precision start time for response time calculation */
            startTime: number;
        };
    }
}

/**
 * HTTP/HTTPS monitoring service implementing {@link IMonitorService}.
 *
 * @remarks
 * Provides endpoint health checks with retry logic, timing, and error handling.
 * Uses Axios for requests, with custom interceptors for timing.
 * All configuration is managed via shallow merging and validated on update.
 * @public
 */
export class HttpMonitor implements IMonitorService {
    /**
     * Axios instance configured for monitoring.
     * @remarks
     * Includes interceptors for timing and error handling.
     * @internal
     */
    private axiosInstance: AxiosInstance;

    /**
     * Configuration for HTTP monitoring.
     * @remarks
     * Includes timeout, user agent, and other settings.
     * @internal
     */
    private config: MonitorConfig;

    /**
     * Constructs a new HttpMonitor.
     *
     * @param config - Optional configuration overrides for HTTP monitoring.
     * @remarks
     * Initializes Axios instance with timing interceptors and merged configuration.
     * @defaultValue timeout: DEFAULT_REQUEST_TIMEOUT, userAgent: USER_AGENT
     * @public
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
     * Performs an HTTP health check for the given monitor.
     *
     * @param monitor - Monitor configuration object (must be type "http").
     * @returns Promise resolving to {@link MonitorCheckResult} with status and timing.
     * @throws Error if monitor type is not "http".
     * @remarks
     * Uses per-monitor timeout and retryAttempts if provided, otherwise falls back to defaults.
     * All requests use retry logic and exponential backoff via {@link withOperationalHooks}.
     * @example
     * ```typescript
     * const result = await httpMonitor.check({ type: "http", url: "https://example.com" });
     * ```
     * @public
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
     * Returns the current configuration for this monitor.
     *
     * @returns A shallow copy of the current {@link MonitorConfig}.
     * @public
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }

    /**
     * Returns the monitor type handled by this service.
     *
     * @returns The string "http".
     * @public
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
    }

    /**
     * Updates the configuration for this monitor.
     *
     * @param config - Partial configuration to merge with existing settings.
     * @throws Error if config contains invalid property types.
     * @remarks
     * Performs a shallow merge and recreates the Axios instance.
     * Only validates types, not value ranges.
     * @public
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
     * Makes an HTTP GET request using Axios.
     *
     * @param url - The URL to request.
     * @param timeout - Request timeout in milliseconds.
     * @returns Promise resolving to Axios response with timing metadata.
     * @remarks
     * Uses the configured Axios instance with per-request timeout.
     * Timing metadata is injected by interceptors.
     * @throws AxiosError if the request fails.
     * @internal
     */
    private async makeRequest(url: string, timeout: number): Promise<AxiosResponse> {
        // Use our configured Axios instance with specific timeout override
        return this.axiosInstance.get(url, {
            timeout,
        });
    }

    /**
     * Performs a health check with retry logic and exponential backoff.
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @param maxRetries - Number of additional retry attempts after the initial attempt.
     * @returns Promise resolving to {@link MonitorCheckResult}.
     * @throws Error if all attempts fail.
     * @remarks
     * Uses {@link withOperationalHooks} for retry logic.
     * Development mode enables debug logging on retries.
     * @see {@link withOperationalHooks}
     * @internal
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
     * Performs a single health check attempt (no retry).
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @returns Promise resolving to {@link MonitorCheckResult}.
     * @throws AxiosError if the request fails.
     * @remarks
     * Uses timing metadata from Axios interceptors for accurate response time.
     * Status is determined from HTTP status code.
     * @internal
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
