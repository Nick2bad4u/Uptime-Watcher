import { AxiosInstance } from "axios";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF, USER_AGENT } from "../../constants";
import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger, withRetry } from "../../utils/index";

import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { determineMonitorStatus, handleCheckError, createHttpClient, createErrorResult } from "./utils";

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
        this.axiosInstance = createHttpClient({
            timeout: DEFAULT_REQUEST_TIMEOUT,
            userAgent: USER_AGENT,
            ...config,
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
     * Uses per-monitor retry attempts and timeout configuration.
     */
    public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
        if (monitor.type !== "http") {
            throw new Error(`HttpMonitor cannot handle monitor type: ${monitor.type}`);
        }

        if (!monitor.url) {
            return createErrorResult("HTTP monitor missing URL", 0);
        }

        const timeout = monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT;
        const retryAttempts = monitor.retryAttempts ?? 0;

        return this.performHealthCheckWithRetry(monitor.url, timeout, retryAttempts);
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

        return withRetry(() => this.performSingleHealthCheck(url, timeout), {
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
        }).catch((error) => handleCheckError(error, url));
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
     * Update the configuration for this monitor.
     * Recreates the Axios instance with updated configuration.
     */
    public updateConfig(config: Partial<MonitorConfig>): void {
        this.config = { ...this.config, ...config };

        // Recreate Axios instance with updated configuration
        this.axiosInstance = createHttpClient(this.config);
    }

    /**
     * Get the current configuration.
     */
    public getConfig(): MonitorConfig {
        return { ...this.config };
    }
}
