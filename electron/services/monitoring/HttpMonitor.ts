import axios, { AxiosInstance, AxiosError } from "axios";
import http from "http";
import https from "https";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF, USER_AGENT } from "../../constants";
import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { withRetry } from "../../utils/retry";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";

/**
 * Declaration merging to extend Axios types with timing metadata.
 */
declare module "axios" {
    interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number;
        };
    }

    interface AxiosResponse {
        responseTime?: number;
    }

    interface AxiosError {
        responseTime?: number;
    }
}

/**
 * Service for performing HTTP/HTTPS monitoring checks.
 * Leverages advanced Axios features for optimal performance and reliability:
 * - Precise response time measurement with interceptors and performance.now()
 * - Proper per-monitor timeout configuration support
 * - Manual status code handling for monitoring logic (2xx/4xx = up, 5xx = down)
 * - Connection pooling with HTTP/HTTPS agents for better performance
 * - Request/response size limits for security
 * - Comprehensive error handling with network and timeout detection
 * Note: Retry logic intentionally disabled for immediate failure detection
 */
export class HttpMonitor implements IMonitorService {
    private config: MonitorConfig;
    private axiosInstance: AxiosInstance;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            userAgent: USER_AGENT,
            ...config,
        };

        // Create Axios instance with advanced configuration (best practices)
        this.axiosInstance = axios.create({
            headers: {
                "User-Agent": this.config.userAgent,
            },
            // Connection pooling for better performance
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
            maxBodyLength: 1024, // 1KB request limit (monitoring shouldn't send much data)
            maxContentLength: 10 * 1024 * 1024, // 10MB response limit
            maxRedirects: 5,
            responseType: "text", // We only need status codes, not parsed data
            timeout: this.config.timeout,
            // Custom status validation - all HTTP responses (including errors) are "successful" for axios
            // This allows us to handle status code logic manually in our monitoring logic
            validateStatus: () => {
                /* v8 ignore next 4 */
                // Always treat as successful so we get response in success path, not error path
                // We'll manually determine up/down status based on status codes
                return true;
            },
        });

        // Set up interceptors for timing measurement
        this.setupInterceptors();
    }

    /**
     * Get the monitor type this service handles.
     */
    public getType(): Site["monitors"][0]["type"] {
        return "http";
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
            return this.createErrorResult("HTTP monitor missing URL", 0);
        }

        const timeout = monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT;
        const retryAttempts = monitor.retryAttempts ?? 0;

        return await this.performHealthCheckWithRetry(monitor.url, timeout, retryAttempts);
    }

    /**
     * Perform health check with retry logic.
     */
    private async performHealthCheckWithRetry(
        url: string,
        timeout: number,
        maxRetries: number
    ): Promise<MonitorCheckResult> {
        // Convert maxRetries (additional attempts) to totalAttempts for withRetry utility
        const totalAttempts = maxRetries + 1;

        return await withRetry(() => this.performSingleHealthCheck(url, timeout), {
            delayMs: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts,
            onError: (error, attempt) => {
                if (isDev()) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.debug(
                        `[HttpMonitor] URL ${url} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                    );
                }
            },
            operationName: `HTTP check for ${url}`,
        }).catch((error) => this.handleCheckError(error, url));
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
        const status = this.determineMonitorStatus(response.status);

        return {
            details: String(response.status),
            responseTime,
            status,
            ...(status === "down" && { error: `HTTP ${response.status}` }),
        };
    }

    /**
     * Determine monitor status based on HTTP status code.
     */
    private determineMonitorStatus(httpStatus: number): "up" | "down" {
        // 2xx = success (up)
        if (httpStatus >= 200 && httpStatus < 300) {
            return "up";
        }

        // 4xx = client error but site is responding (up)
        if (httpStatus >= 400 && httpStatus < 500) {
            return "up";
        }

        // 5xx = server error (down)
        if (httpStatus >= 500) {
            return "down";
        }

        // 3xx redirects or other unexpected codes (up - site is responding)
        return "up";
    }

    /**
     * Handle errors that occur during health checks.
     */
    private handleCheckError(error: unknown, url: string): MonitorCheckResult {
        const responseTime = axios.isAxiosError(error) && error.responseTime ? error.responseTime : 0;

        if (axios.isAxiosError(error)) {
            return this.handleAxiosError(error as AxiosError, url, responseTime);
        }

        // Non-Axios errors (shouldn't happen, but just in case)
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        /* v8 ignore next */
        logger.error(`[HttpMonitor] Unexpected error checking ${url}`, error);
        return this.createErrorResult(errorMessage, responseTime);
    }

    /**
     * Handle Axios-specific errors.
     */
    private handleAxiosError(error: AxiosError, url: string, responseTime: number): MonitorCheckResult {
        // With validateStatus: () => true, we should only get network errors here
        // HTTP response errors are handled in the success path

        // Network errors, timeouts, DNS failures, etc.
        const errorMessage = error.message || "Network error";
        if (isDev()) {
            logger.debug(`[HttpMonitor] Network error for ${url}: ${errorMessage}`);
        }
        return this.createErrorResult(errorMessage, responseTime);
    }

    /**
     * Make the actual HTTP request using Axios.
     */
    private async makeRequest(url: string, timeout: number) {
        // Use our configured Axios instance with specific timeout override
        return await this.axiosInstance.get(url, {
            timeout,
        });
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
     * Recreates the Axios instance with updated configuration.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = { ...this.config, ...config };

        // Recreate Axios instance with updated configuration
        this.axiosInstance = axios.create({
            headers: {
                "User-Agent": this.config.userAgent,
            },
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
            maxBodyLength: 1024,
            maxContentLength: 10 * 1024 * 1024,
            maxRedirects: 5,
            responseType: "text",
            timeout: this.config.timeout,
            validateStatus: () => true,
        });

        // Re-add interceptors for timing
        this.setupInterceptors();
    }

    /**
     * Set up request and response interceptors for timing measurement.
     */
    private setupInterceptors(): void {
        // Add request interceptor to record start time
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Use a more precise timing method
                config.metadata = { startTime: performance.now() };
                return config;
            },
            (error) => {
                return Promise.reject(error instanceof Error ? error : new Error(String(error)));
            }
        );

        // Add response interceptor to calculate duration
        this.axiosInstance.interceptors.response.use(
            (response) => {
                if (response.config.metadata?.startTime) {
                    const duration = performance.now() - response.config.metadata.startTime;
                    response.responseTime = Math.round(duration);
                }
                return response;
            },
            (error) => {
                // Also calculate timing for error responses
                if (error.config?.metadata?.startTime) {
                    const duration = performance.now() - error.config.metadata.startTime;
                    error.responseTime = Math.round(duration);
                }
                return Promise.reject(error instanceof Error ? error : new Error(String(error)));
            }
        );
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }
}
