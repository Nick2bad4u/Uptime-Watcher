/**
 * Provides HTTP/HTTPS monitoring for web endpoint health checks using Axios and robust retry logic.
 *
 * @remarks
 * Implements the {@link IMonitorService} contract for HTTP monitoring. Uses a custom-configured Axios instance with timing interceptors for precise response time measurement, per-monitor timeout, and status code interpretation. All requests are performed with retry logic and exponential backoff via {@link withOperationalHooks}. Errors are handled and standardized for frontend consumption.
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

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "../../../shared/utils/logTemplates";
import {
    DEFAULT_REQUEST_TIMEOUT,
    RETRY_BACKOFF,
    USER_AGENT,
} from "../../constants";
import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { createErrorResult, handleCheckError } from "./utils/errorHandling";
import { createHttpClient } from "./utils/httpClient";
import { determineMonitorStatus } from "./utils/httpStatusUtils";
import {
    getMonitorRetryAttempts,
    getMonitorTimeout,
    hasValidUrl,
} from "./utils/monitorTypeGuards";

/**
 * Extends Axios types to support timing metadata for monitoring.
 *
 * @remarks
 * Declaration merging is used to add response time fields to {@link AxiosError},
 * {@link AxiosResponse}, and {@link InternalAxiosRequestConfig} for accurate timing.
 * These fields are populated by Axios interceptors in {@link createHttpClient}.
 *
 * @see {@link createHttpClient}
 * @internal
 */
declare module "axios" {
    /**
     * Axios error extended with optional response time.
     *
     * @remarks
     * Used to record the elapsed time at the point of failure for accurate diagnostics.
     */
    interface AxiosError {
        /** Response time at point of failure (milliseconds, if available) */
        responseTime?: number;
    }

    /**
     * Axios response extended with calculated response time.
     *
     * @remarks
     * Populated by Axios response interceptor for monitoring. Used for reporting precise response times in health checks.
     */
    interface AxiosResponse {
        /** Calculated response time in milliseconds */
        responseTime?: number;
    }

    /**
     * Axios request config extended with timing metadata.
     *
     * @remarks
     * Used internally to record request start time for timing calculation. Populated by timing interceptors.
     */
    interface InternalAxiosRequestConfig {
        metadata?: {
            /** High-precision start time for response time calculation */
            startTime: number;
        };
    }
}

/**
 * HTTP/HTTPS monitoring service implementing {@link IMonitorService} for endpoint health checks.
 *
 * @remarks
 * Provides endpoint health checks with retry logic, timing, and error handling. Uses Axios for requests, with custom interceptors for timing. All configuration is managed via shallow merging and validated on update. All errors are standardized for frontend consumption.
 *
 * @public
 */
export class HttpMonitor implements IMonitorService {
    /**
     * Axios instance configured for monitoring.
     *
     * @remarks
     * Includes interceptors for timing and error handling. Recreated on config updates.
     * @internal
     */
    private axiosInstance: AxiosInstance;

    /**
     * Configuration for HTTP monitoring.
     *
     * @remarks
     * Includes timeout, user agent, and other settings. Used for all requests unless overridden per-monitor.
     * @internal
     */
    private config: MonitorConfig;

    /**
     * Constructs a new {@link HttpMonitor} instance.
     *
     * @param config - Optional configuration overrides for HTTP monitoring. See {@link MonitorConfig}.
     *
     * @remarks
     * Initializes Axios instance with timing interceptors and merged configuration. All configuration values are shallow-merged with defaults.
     *
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
     * Performs an HTTP health check for the given monitor configuration.
     *
     * @remarks
     * Uses per-monitor timeout and retryAttempts if provided, otherwise falls back to defaults.
     * All requests use retry logic and exponential backoff via {@link withOperationalHooks}.
     * Returns a standardized result for all error cases.
     *
     * Now uses type guards to safely handle potentially undefined configuration values.
     *
     * @example
     * ```typescript
     * const result = await httpMonitor.check({ type: "http", url: "https://example.com" });
     * ```
     *
     * @param monitor - Monitor configuration object (must be type "http").
     * @returns Promise resolving to {@link MonitorCheckResult} with status and timing.
     * @throws {@link Error} if monitor type is not "http".
     * @public
     */
    public async check(
        monitor: Site["monitors"][0]
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(
                `HttpMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        if (!hasValidUrl(monitor)) {
            return createErrorResult("HTTP monitor missing or invalid URL", 0);
        }

        // Use type-safe utility functions instead of type assertions
        const timeout = getMonitorTimeout(
            monitor,
            this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
        );
        const retryAttempts = getMonitorRetryAttempts(
            monitor,
            DEFAULT_RETRY_ATTEMPTS
        );

        return this.performHealthCheckWithRetry(
            monitor.url,
            timeout,
            retryAttempts
        );
    }

    /**
     * Returns the current configuration for this monitor service.
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
     * @remarks
     * Used by the monitor factory to route checks to the appropriate service.
     * @public
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
    }

    /**
     * Updates the configuration for this monitor service.
     *
     * @remarks
     * Performs a shallow merge and recreates the Axios instance. Only validates types, not value ranges. Throws if invalid types are provided.
     *
     * @param config - Partial configuration to merge with existing settings.
     * @throws Error if config contains invalid property types.
     * @public
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        // Basic validation of config properties
        if (
            config.timeout !== undefined &&
            (typeof config.timeout !== "number" || config.timeout <= 0)
        ) {
            throw new Error("Invalid timeout: must be a positive number");
        }
        if (
            config.userAgent !== undefined &&
            typeof config.userAgent !== "string"
        ) {
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
     * Makes an HTTP GET request using Axios with timing interceptors.
     *
     * @remarks
     * Uses the configured Axios instance with per-request timeout. Timing metadata is injected by interceptors. Throws if the request fails at the network or protocol level.
     *
     * @param url - The URL to request.
     * @param timeout - Request timeout in milliseconds.
     * @returns Promise resolving to {@link AxiosResponse} with timing metadata.
     * @throws {@link AxiosError} if the request fails.
     * @internal
     */
    private async makeRequest(
        url: string,
        timeout: number
    ): Promise<AxiosResponse> {
        // Use our configured Axios instance with specific timeout override
        return this.axiosInstance.get(url, {
            timeout,
        });
    }

    /**
     * Performs a health check with retry logic and exponential backoff.
     *
     * @remarks
     * Uses {@link withOperationalHooks} for retry logic. Development mode enables debug logging on retries. Returns a standardized error result if all attempts fail.
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @param maxRetries - Number of additional retry attempts after the initial attempt.
     * @returns Promise resolving to {@link MonitorCheckResult}.
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

            return await withOperationalHooks(
                () => this.performSingleHealthCheck(url, timeout),
                {
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: totalAttempts,
                    operationName: `HTTP check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error) => {
                            const errorMessage =
                                error instanceof Error
                                    ? error.message
                                    : String(error);
                            logger.debug(
                                `[HttpMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                            );
                        },
                    }),
                }
            );
        } catch (error) {
            return handleCheckError(error, url);
        }
    }

    /**
     * Performs a single health check attempt (no retry).
     *
     * @remarks
     * Uses timing metadata from Axios interceptors for accurate response time. Status is determined from HTTP status code. Throws if the request fails at the network or protocol level.
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @returns Promise resolving to {@link MonitorCheckResult}.
     * @throws {@link AxiosError} if the request fails.
     * @internal
     */
    private async performSingleHealthCheck(
        url: string,
        timeout: number
    ): Promise<MonitorCheckResult> {
        if (isDev()) {
            logger.debug(
                `[HttpMonitor] Checking URL: ${url} with timeout: ${timeout}ms`
            );
        }

        const response = await this.makeRequest(url, timeout);
        const responseTime = response.responseTime ?? 0;

        if (isDev()) {
            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.MONITOR_RESPONSE_TIME,
                    {
                        responseTime,
                        status: response.status,
                        url,
                    }
                )
            );
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
