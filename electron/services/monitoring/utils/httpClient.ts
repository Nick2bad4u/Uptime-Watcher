/**
 * Axios configuration utilities for HTTP monitoring.
 * Provides standardized HTTP client setup and interceptors.
 */

import axios, { AxiosInstance } from "axios";
import * as http from "node:http";
import * as https from "node:https";

import { MonitorConfig } from "../types";

/**
 * Create a configured Axios instance optimized for HTTP monitoring.
 *
 * @param config - Monitor configuration containing timeout, userAgent, etc.
 * @returns Configured Axios instance with timing interceptors and connection pooling
 *
 * @remarks
 * Sets up connection pooling, custom status validation, and timing measurement.
 * All HTTP responses are treated as "successful" for manual status code handling
 * in monitoring logic. This allows proper evaluation of HTTP error codes as
 * legitimate monitoring results rather than Axios errors.
 *
 * The 10KB request limit is suitable for monitoring scenarios which typically
 * send minimal data (headers, basic payloads). Response limit is 10MB to handle
 * larger pages if needed.
 *
 * @see {@link MonitorConfig} for available configuration options
 * @see {@link setupTimingInterceptors} for timing measurement details
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
 * Set up request and response interceptors for precise timing measurement.
 *
 * @param axiosInstance - Axios instance to configure with timing interceptors
 *
 * @remarks
 * Uses performance.now() for high-precision timing measurement. Adds metadata
 * to request config and calculates duration in response interceptor.
 * Also handles timing for error responses to ensure consistent measurement.
 *
 * The timing data is attached to response/error objects via declaration merging
 * defined in HttpMonitor.ts for type safety.
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
 * Ensure an unknown value is an Error instance.
 *
 * @param error - Unknown error value
 * @returns Error instance for consistent error handling
 */
function ensureErrorInstance(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}
