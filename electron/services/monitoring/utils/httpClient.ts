/**
 * Axios configuration utilities for HTTP monitoring.
 *
 * @remarks
 * Provides standardized HTTP client setup and interceptors for precise timing and connection pooling.
 * All HTTP responses are treated as "successful" for manual status code handling in monitoring logic.
 *
 * @see {@link setupTimingInterceptors}
 * @see {@link MonitorConfig}
 * @public
 */

import axios, { AxiosInstance } from "axios";
import * as http from "node:http";
import * as https from "node:https";

import { MonitorConfig } from "../types";

/**
 * Creates a configured Axios instance optimized for HTTP monitoring.
 *
 * @remarks
 * Sets up connection pooling, custom status validation, and timing measurement.
 * All HTTP responses are treated as "successful" for manual status code handling
 * in monitoring logic. This allows proper evaluation of HTTP error codes as
 * legitimate monitoring results rather than Axios errors.
 * The 10KB request limit is suitable for monitoring scenarios which typically
 * send minimal data (headers, basic payloads). Response limit is 10MB to handle
 * larger pages if needed.
 *
 * @param config - The monitor configuration containing timeout, userAgent, etc.
 * @returns A configured Axios instance with timing interceptors and connection pooling.
 *
 * @example
 * ```typescript
 * const client = createHttpClient({ timeout: 5000, userAgent: "UptimeWatcher/1.0" });
 * const response = await client.get("https://example.com");
 * ```
 *
 * @see {@link MonitorConfig}
 * @see {@link setupTimingInterceptors}
 * @public
 */
export function createHttpClient(config: MonitorConfig): AxiosInstance {
    const headers: Record<string, string> = {};
    if (config.userAgent !== undefined) {
        headers["User-Agent"] = config.userAgent;
    }

    const createConfig: Record<string, unknown> = {
        headers,
        // Connection pooling for better performance
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        maxBodyLength: 10 * 1024, // 10KB request limit - sufficient for monitoring data
        maxContentLength: 10 * 1024 * 1024, // 10MB response limit for larger pages
        maxRedirects: 5,
        // Text response minimizes parsing overhead; status codes are sufficient for monitoring
        responseType: "text",
        /**
         * Custom status validation for monitoring logic.
         *
         * @returns Always true to treat all HTTP responses as "successful"
         *
         * @remarks
         * Always treats responses as successful so we get response data in success path
         * rather than error path. This allows manual status code evaluation in monitoring
         * logic where 404, 500, etc. are legitimate results to track, not errors.
         */
        validateStatus: () => {
            return true;
        },
    };

    if (config.timeout !== undefined) {
        createConfig.timeout = config.timeout;
    }

    const axiosInstance = axios.create(createConfig);

    // Set up interceptors for timing measurement
    setupTimingInterceptors(axiosInstance);

    return axiosInstance;
}

/**
 * Sets up request and response interceptors for precise timing measurement on an Axios instance.
 *
 * @remarks
 * Uses `performance.now()` for high-precision timing measurement. Adds metadata
 * to request config and calculates duration in response interceptor.
 * Also handles timing for error responses to ensure consistent measurement.
 * The timing data is attached to response/error objects via declaration merging
 * defined in HttpMonitor.ts for type safety.
 *
 * @param axiosInstance - The Axios instance to configure with timing interceptors.
 *
 * @example
 * ```typescript
 * const client = axios.create();
 * setupTimingInterceptors(client);
 * ```
 *
 * @see {@link createHttpClient}
 * @public
 */
export function setupTimingInterceptors(axiosInstance: AxiosInstance): void {
    // Add request interceptor to record start time
    axiosInstance.interceptors.request.use(
        (config) => {
            // Use a more precise timing method
            config.metadata = {
                startTime: performance.now(),
            };
            return config;
        },
        (error) => {
            return Promise.reject(ensureErrorInstance(error));
        }
    );

    // Add response interceptor to calculate duration
    axiosInstance.interceptors.response.use(
        (response) => {
            if (response.config.metadata?.startTime) {
                const duration = performance.now() - response.config.metadata.startTime;
                response.responseTime = Math.round(duration);
            }
            return response;
        },
        (error) => {
            // Also calculate timing for error responses
            const err = error as { config?: { metadata?: { startTime?: number } }; responseTime?: number };
            if (err.config?.metadata?.startTime) {
                const duration = performance.now() - err.config.metadata.startTime;
                err.responseTime = Math.round(duration);
            }
            return Promise.reject(ensureErrorInstance(error));
        }
    );
}

/**
 * Ensures an unknown value is an Error instance.
 *
 * @remarks
 * Converts non-Error values to Error instances for consistent error handling.
 *
 * @param error - The unknown error value.
 * @returns An Error instance for consistent error handling.
 *
 * @example
 * ```typescript
 * throw ensureErrorInstance("Something went wrong");
 * ```
 *
 * @public
 */
function ensureErrorInstance(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}
