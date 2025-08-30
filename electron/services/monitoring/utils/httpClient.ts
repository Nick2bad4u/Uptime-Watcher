/**
 * Axios configuration utilities for HTTP monitoring.
 *
 * @remarks
 * Provides standardized HTTP client setup and interceptors for precise timing
 * and connection pooling. All HTTP responses are treated as "successful" for
 * manual status code handling in monitoring logic. All exported functions are
 * type-safe and never throw.
 *
 * @public
 *
 * @see {@link setupTimingInterceptors}
 * @see {@link MonitorConfig}
 */

import type { AxiosInstance } from "axios";
import type { UnknownRecord } from "type-fest";

import axios from "axios";
import * as http from "node:http";
import * as https from "node:https";

import type { MonitorConfig } from "../types";

/**
 * Ensures an unknown value is an Error instance.
 *
 * @remarks
 * Converts non-Error values to Error instances for consistent error handling.
 * Used internally by interceptors to guarantee error type safety.
 *
 * @example
 *
 * ```typescript
 * throw ensureErrorInstance("Something went wrong");
 * ```
 *
 * @param error - The unknown error value.
 *
 * @returns An {@link Error} instance for consistent error handling.
 *
 * @public
 */
function ensureErrorInstance(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

/**
 * Sets up request and response interceptors for precise timing measurement on
 * an Axios instance.
 *
 * @remarks
 * Uses `performance.now()` for high-precision timing measurement. Adds metadata
 * to request config and calculates duration in response interceptor. Also
 * handles timing for error responses to ensure consistent measurement. The
 * timing data is attached to response/error objects via declaration merging
 * defined in HttpMonitor.ts for type safety. This function mutates the provided
 * Axios instance.
 *
 * @example
 *
 * ```typescript
 * const client = axios.create();
 * setupTimingInterceptors(client);
 * ```
 *
 * @param axiosInstance - The {@link AxiosInstance} to configure with timing
 *   interceptors.
 *
 * @public
 *
 * @see {@link createHttpClient}
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
        // eslint-disable-next-line promise/no-promise-in-callback -- Standard axios interceptor pattern
        (error) => Promise.reject(ensureErrorInstance(error))
    );

    // Add response interceptor to calculate duration
    axiosInstance.interceptors.response.use(
        (response) => {
            if (response.config.metadata?.startTime) {
                const duration =
                    performance.now() - response.config.metadata.startTime;
                response.responseTime = Math.round(duration);
            }
            return response;
        },
        (error) => {
            // Also calculate timing for error responses
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Axios error object structure is stable and well-documented for metadata access
            const err = error as {
                config?: { metadata?: { startTime?: number } };
                responseTime?: number;
            };
            if (err.config?.metadata?.startTime) {
                const duration =
                    performance.now() - err.config.metadata.startTime;
                err.responseTime = Math.round(duration);
            }
            return Promise.reject(ensureErrorInstance(error));
        }
    );
}

/**
 * Creates a configured Axios instance optimized for HTTP monitoring.
 *
 * @remarks
 * Sets up connection pooling, custom status validation, and timing measurement.
 * All HTTP responses are treated as "successful" for manual status code
 * handling in monitoring logic. This allows proper evaluation of HTTP error
 * codes as legitimate monitoring results rather than Axios errors. The 10KB
 * request limit is suitable for monitoring scenarios which typically send
 * minimal data (headers, basic payloads). Response limit is 10MB to handle
 * larger pages if needed.
 *
 * @example
 *
 * ```typescript
 * const client = createHttpClient({
 *     timeout: 5000,
 *     userAgent: "UptimeWatcher/1.0",
 * });
 * const response = await client.get("https://example.com", {
 *     signal: AbortSignal.timeout(3000),
 * });
 * ```
 *
 * @param config - The {@link MonitorConfig} containing timeout, userAgent, and
 *   other HTTP options.
 * @param signal - Optional AbortSignal for request cancellation.
 *
 * @returns A configured {@link AxiosInstance} with timing interceptors and
 *   connection pooling.
 *
 * @public
 *
 * @see {@link MonitorConfig}
 * @see {@link setupTimingInterceptors}
 */
// Security / performance tunables (can be overridden via env for emergency mitigation)
// Centralized accessor to satisfy lint rules about environment usage
function getEnv(name: string, fallback: string): string {
    // eslint-disable-next-line n/no-process-env -- Controlled, centralized access
    const val = process.env[name];
    return val === undefined || val === "" ? fallback : val;
}

const DEFAULT_MAX_REDIRECTS =
    Number.parseInt(getEnv("UW_HTTP_MAX_REDIRECTS", "3"), 10) || 3;
const DEFAULT_MAX_CONTENT_LENGTH =
    Number.parseInt(
        getEnv("UW_HTTP_MAX_CONTENT_LENGTH", `${1 * 1024 * 1024}`),
        10
    ) || 1 * 1024 * 1024; // 1MB
const DEFAULT_MAX_BODY_LENGTH =
    Number.parseInt(getEnv("UW_HTTP_MAX_BODY_LENGTH", `${8 * 1024}`), 10) ||
    8 * 1024; // 8KB request body cap
export function createHttpClient(config: MonitorConfig): AxiosInstance {
    const forceStrictStatus =
        getEnv("UW_HTTP_STRICT_STATUS", "true").toLowerCase() === "true";
    const headers: Record<string, string> = {};
    if (config.userAgent !== undefined) {
        headers["User-Agent"] = config.userAgent;
    }

    const createConfig: UnknownRecord = {
        headers,
        // Connection pooling for better performance
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        maxBodyLength: DEFAULT_MAX_BODY_LENGTH, // bounded request size
        maxContentLength: DEFAULT_MAX_CONTENT_LENGTH, // bounded response size
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        // Text response minimizes parsing overhead; status codes are
        // sufficient for monitoring
        responseType: "text",
        /**
         * Status validation strategy.
         *
         * - Strict mode (default): Only status codes 200-399 are treated as
         *   success.
         * - Lenient mode (opt-out): All responses treated as success and
         *   interpreted by upstream logic.
         *
         * Controlled via UW_HTTP_STRICT_STATUS environment variable.
         */
        validateStatus: forceStrictStatus
            ? (status: number): boolean => status >= 200 && status < 400
            : (): true => true,
    };

    if (config.timeout !== undefined) {
        createConfig["timeout"] = config.timeout;
    }

    const axiosInstance = axios.create(createConfig);

    // Set up interceptors for timing measurement
    setupTimingInterceptors(axiosInstance);

    return axiosInstance;
}
