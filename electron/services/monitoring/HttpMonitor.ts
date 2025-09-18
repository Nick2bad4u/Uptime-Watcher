/**
 * Provides HTTP/HTTPS monitoring for web endpoint health checks using Axios and
 * robust retry logic.
 *
 * @remarks
 * Implements the {@link IMonitorService} contract for HTTP monitoring. Uses a
 * custom-configured Axios instance with timing interceptors for precise
 * response time measurement, per-monitor timeout, and status code
 * interpretation. All requests are performed with retry logic and exponential
 * backoff via {@link withOperationalHooks}. Errors are handled and standardized
 * for frontend consumption.
 *
 * @example
 *
 * ```typescript
 * const httpMonitor = new HttpMonitor({ timeout: 5000 });
 * const result = await httpMonitor.check({
 *     id: "mon_1",
 *     type: "http",
 *     url: "https://example.com",
 *     status: "pending",
 * });
 * console.log(
 *     `Status: ${result.status}, Response time: ${result.responseTime}ms`
 * );
 * ```
 *
 * @public
 *
 * @see {@link IMonitorService}
 * @see {@link MonitorConfig}
 * @see {@link MonitorCheckResult}
 */

import type { Site } from "@shared/types";
import type { AxiosInstance, AxiosResponse } from "axios";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorConfig,
} from "./types";

import {
    DEFAULT_REQUEST_TIMEOUT,
    RETRY_BACKOFF,
    USER_AGENT,
} from "../../constants";
import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withOperationalHooks } from "../../utils/operationalHooks";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
    validateMonitorUrl,
} from "./shared/monitorServiceHelpers";
import { handleCheckError } from "./utils/errorHandling";
import { createHttpClient } from "./utils/httpClient";
import { determineMonitorStatus } from "./utils/httpStatusUtils";

/**
 * Lightweight in-memory rate limiter for HTTP monitor requests.
 *
 * @remarks
 * Provides coarse-grained protection against flooding a single host with
 * requests. Not persisted; resets per process start. Intentionally simple to
 * avoid introducing heavy dependencies.
 */
class SimpleRateLimiter {
    private readonly lastInvocation = new Map<string, number>();

    private active = 0;

    private readonly maxConcurrent: number;

    private readonly minIntervalMs: number;

    private readonly maxWaitMs: number;

    public async schedule<T>(url: string, fn: () => Promise<T>): Promise<T> {
        const key = this.getKey(url);
        const sleep = async (ms: number): Promise<void> =>
            new Promise((resolve) => {
                // Timer will complete when Promise resolves, cleanup not needed
                // eslint-disable-next-line clean-timer/assign-timer-id -- Timer completes with Promise resolution
                setTimeout(resolve, ms);
            });

        const startTime = Date.now();
        let shouldContinue = true;
        while (shouldContinue) {
            const now = Date.now();

            // Prevent infinite waiting - max wait time safety check
            if (now - startTime > this.maxWaitMs) {
                logger.warn(
                    `[SimpleRateLimiter] Max wait time exceeded for ${url}, proceeding anyway`
                );
                shouldContinue = false;
            } else {
                const last = this.lastInvocation.get(key) ?? 0;
                const since = now - last;
                const needDelay = since < this.minIntervalMs;
                if (this.active < this.maxConcurrent && !needDelay) {
                    shouldContinue = false;
                } else {
                    const waitFor = needDelay ? this.minIntervalMs - since : 25;
                    // eslint-disable-next-line no-await-in-loop -- Rate limiting requires sequential delays in monitoring loop
                    await sleep(waitFor);
                }
            }
        }
        this.active += 1;
        this.lastInvocation.set(key, Date.now());
        try {
            return await fn();
        } finally {
            this.active -= 1;
        }
    }

    public constructor(
        maxConcurrent: number,
        minIntervalMs: number,
        maxWaitMs = 30_000
    ) {
        this.maxConcurrent = maxConcurrent;
        this.minIntervalMs = minIntervalMs;
        this.maxWaitMs = maxWaitMs;
    }

    private getKey(url: string): string {
        try {
            const u = new URL(url);
            return `${u.protocol}//${u.host}`;
        } catch {
            return "global";
        }
    }
}

/**
 * Extends Axios types to support timing metadata for monitoring.
 *
 * @remarks
 * Declaration merging is used to add response time fields to {@link AxiosError},
 * {@link AxiosResponse}, and {@link InternalAxiosRequestConfig} for accurate
 * timing. These fields are populated by Axios interceptors in
 * {@link createHttpClient}.
 *
 * @internal
 *
 * @see {@link createHttpClient}
 */
declare module "axios" {
    /**
     * Axios error extended with optional response time.
     *
     * @remarks
     * Used to record the elapsed time at the point of failure for accurate
     * diagnostics.
     */
    interface AxiosError {
        /** Response time at point of failure (milliseconds, if available) */
        responseTime?: number;
    }

    /**
     * Axios response extended with calculated response time.
     *
     * @remarks
     * Populated by Axios response interceptor for monitoring. Used for
     * reporting precise response times in health checks.
     */
    interface AxiosResponse {
        /** Calculated response time in milliseconds */
        responseTime?: number;
    }

    /**
     * Axios request config extended with timing metadata.
     *
     * @remarks
     * Used internally to record request start time for timing calculation.
     * Populated by timing interceptors.
     */
    interface InternalAxiosRequestConfig {
        metadata?: {
            /** High-precision start time for response time calculation */
            startTime: number;
        };
    }
}

/**
 * HTTP/HTTPS monitoring service implementing {@link IMonitorService} for
 * endpoint health checks.
 *
 * @remarks
 * Provides endpoint health checks with retry logic, timing, and error handling.
 * Uses Axios for requests, with custom interceptors for timing. All
 * configuration is managed via shallow merging and validated on update. All
 * errors are standardized for frontend consumption.
 *
 * @public
 */
export class HttpMonitor implements IMonitorService {
    private static readonly rateLimiter = new SimpleRateLimiter(
        Number.parseInt(
            HttpMonitor.getEnv("UW_HTTP_MAX_CONCURRENT", "8"),
            10
        ) || 8,
        Number.parseInt(
            HttpMonitor.getEnv("UW_HTTP_MIN_INTERVAL_MS", "200"),
            10
        ) || 200
    );

    private axiosInstance: AxiosInstance;

    private config: MonitorConfig;

    private static getEnv(name: string, fallback: string): string {
        // eslint-disable-next-line n/no-process-env -- centralized access
        const val = process.env[name];
        return val === undefined || val === "" ? fallback : val;
    }
    /**
     * Axios instance configured for monitoring.
     *
     * @remarks
     * Includes interceptors for timing and error handling. Recreated on config
     * updates.
     *
     * @internal
     */
    /**
     * Configuration for HTTP monitoring.
     *
     * @remarks
     * Includes timeout, user agent, and other settings. Used for all requests
     * unless overridden per-monitor.
     */

    /**
     * Performs an HTTP health check for the given monitor configuration.
     *
     * @remarks
     * Uses per-monitor timeout and retryAttempts if provided, otherwise falls
     * back to defaults. All requests use retry logic and exponential backoff
     * via {@link withOperationalHooks}. Returns a standardized result for all
     * error cases. Now supports AbortSignal for operation cancellation.
     *
     * @example
     *
     * ```typescript
     * const result = await httpMonitor.check({
     *     type: "http",
     *     url: "https://example.com",
     * });
     * ```
     *
     * @param monitor - Monitor configuration object (must be type "http").
     * @param signal - Optional AbortSignal for operation cancellation.
     *
     * @returns Promise resolving to {@link MonitorCheckResult} with status and
     *   timing.
     *
     * @throws {@link Error} If monitor type is not "http".
     *
     * @public
     */
    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(
                `HttpMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        // Check if operation is already aborted
        if (signal?.aborted) {
            throw new Error("Operation was aborted before starting");
        }

        // Validate URL using shared helper
        const validationError = validateMonitorUrl(monitor);
        if (validationError) {
            return createMonitorErrorResult(validationError, 0);
        }

        // Extract monitor configuration using shared helper
        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
        );

        const url = monitor.url ?? "";
        return HttpMonitor.rateLimiter.schedule(url, () =>
            this.performHealthCheckWithRetry(
                url,
                timeout,
                retryAttempts,
                signal
            )
        );
    }

    /**
     * Makes an HTTP GET request using Axios with timing interceptors.
     *
     * @remarks
     * Uses the configured Axios instance with per-request timeout and optional
     * AbortSignal. Timing metadata is injected by interceptors. Throws if the
     * request fails at the network or protocol level.
     *
     * @param url - The URL to request.
     * @param timeout - Request timeout in milliseconds.
     * @param signal - Optional AbortSignal for request cancellation.
     *
     * @returns Promise resolving to {@link AxiosResponse} with timing metadata.
     *
     * @throws {@link AxiosError} If the request fails.
     *
     * @internal
     */
    private async makeRequest(
        url: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<AxiosResponse> {
        // Combine timeout with AbortSignal for comprehensive cancellation
        const signals = [AbortSignal.timeout(timeout)];
        if (signal) {
            signals.push(signal);
        }

        return this.axiosInstance.get(url, {
            signal: AbortSignal.any(signals),
            timeout,
        });
    }

    /**
     * Performs a health check with retry logic and exponential backoff.
     *
     * @remarks
     * Uses {@link withOperationalHooks} for retry logic. Development mode
     * enables debug logging on retries. Returns a standardized error result if
     * all attempts fail. Supports AbortSignal for operation cancellation.
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @param maxRetries - Number of additional retry attempts after the initial
     *   attempt.
     * @param signal - Optional AbortSignal for operation cancellation.
     *
     * @returns Promise resolving to {@link MonitorCheckResult}.
     *
     * @internal
     */
    private async performHealthCheckWithRetry(
        url: string,
        timeout: number,
        maxRetries: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        try {
            // Check if operation is already aborted
            if (signal?.aborted) {
                throw new Error("Operation was aborted");
            }

            // MaxRetries parameter is "additional retries after first attempt"
            // withOperationalHooks expects "total attempts"
            // So if maxRetries=3, we want 4 total attempts (1 initial + 3
            // retries)
            const totalAttempts = maxRetries + 1;

            return await withOperationalHooks(
                () => this.performSingleHealthCheck(url, timeout, signal),
                {
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: totalAttempts,
                    operationName: `HTTP check for ${url}`,
                    ...(isDev() && {
                        onRetry: (attempt: number, error: Error): void => {
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
     * Uses timing metadata from Axios interceptors for accurate response time.
     * Status is determined from HTTP status code. Throws if the request fails
     * at the network or protocol level. Supports AbortSignal for cancellation.
     *
     * @param url - The URL to health check.
     * @param timeout - Request timeout in milliseconds.
     * @param signal - Optional AbortSignal for request cancellation.
     *
     * @returns Promise resolving to {@link MonitorCheckResult}.
     *
     * @throws {@link AxiosError} If the request fails.
     *
     * @internal
     */
    private async performSingleHealthCheck(
        url: string,
        timeout: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (isDev()) {
            logger.debug(
                `[HttpMonitor] Checking URL: ${url} with timeout: ${timeout}ms`
            );
        }

        const response = await this.makeRequest(url, timeout, signal);
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

    /**
     * Constructs a new {@link HttpMonitor} instance.
     *
     * @remarks
     * Initializes Axios instance with timing interceptors and merged
     * configuration. All configuration values are shallow-merged with
     * defaults.
     *
     * @defaultValue timeout: DEFAULT_REQUEST_TIMEOUT, userAgent: USER_AGENT
     *
     * @param config - Optional configuration overrides for HTTP monitoring. See
     *   {@link MonitorConfig}.
     *
     * @public
     */
    public constructor(config: MonitorConfig = {}) {
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
     * Returns the current configuration for this monitor service.
     *
     * @returns A shallow copy of the current {@link MonitorConfig}.
     *
     * @public
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }

    /**
     * Returns the monitor type handled by this service.
     *
     * @remarks
     * Used by the monitor factory to route checks to the appropriate service.
     *
     * @returns The string "http".
     *
     * @public
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
    }

    /**
     * Updates the configuration for this monitor service.
     *
     * @remarks
     * Performs a shallow merge and recreates the Axios instance. Only validates
     * types, not value ranges. Throws if invalid types are provided.
     *
     * @param config - Partial configuration to merge with existing settings.
     *
     * @throws Error if config contains invalid property types.
     *
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
}
