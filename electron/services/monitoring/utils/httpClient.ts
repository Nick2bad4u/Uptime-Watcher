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
 * @see {@link MonitorServiceConfig}
 */

import type { AxiosInstance, AxiosRequestConfig } from "axios";

import { readNumberEnv } from "@shared/utils/environment";
import { ensureRecordLike, isRecord  } from "@shared/utils/typeHelpers";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import axios from "axios";
import * as http from "node:http";
import * as https from "node:https";

import type { MonitorServiceConfig } from "../types";

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
    return error instanceof Error
        ? error
        : new Error(getUserFacingErrorDetail(error));
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
            const errorRecord = ensureRecordLike(error);
            const config = errorRecord ? ensureRecordLike(errorRecord["config"]) : undefined;
            const metadata = config ? ensureRecordLike(config["metadata"]) : undefined;
            const startTime =
                metadata && typeof metadata["startTime"] === "number"
                    ? metadata["startTime"]
                    : undefined;

            if (startTime !== undefined && errorRecord) {
                const duration = performance.now() - startTime;
                Reflect.set(errorRecord, "responseTime", Math.round(duration));
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
 * @param config - The {@link MonitorServiceConfig} containing timeout,
 *   userAgent, and other HTTP options.
 * @param signal - Optional AbortSignal for request cancellation.
 *
 * @returns A configured {@link AxiosInstance} with timing interceptors and
 *   connection pooling.
 *
 * @public
 *
 * @see {@link MonitorServiceConfig}
 * @see {@link setupTimingInterceptors}
 */
// Security / performance tunables (can be overridden via env for emergency mitigation)
const DEFAULT_MAX_REDIRECTS = readNumberEnv("UW_HTTP_MAX_REDIRECTS", 3);
const DEFAULT_MAX_CONTENT_LENGTH = readNumberEnv(
    "UW_HTTP_MAX_CONTENT_LENGTH",
    1 * 1024 * 1024
); // 1MB
const DEFAULT_MAX_BODY_LENGTH = readNumberEnv(
    "UW_HTTP_MAX_BODY_LENGTH",
    8 * 1024
); // 8KB request body cap

const DEFAULT_AGENT_MAX_SOCKETS = readNumberEnv("UW_HTTP_MAX_SOCKETS", 32);
const DEFAULT_AGENT_MAX_FREE_SOCKETS = readNumberEnv(
    "UW_HTTP_MAX_FREE_SOCKETS",
    8
);
const DEFAULT_AGENT_KEEP_ALIVE_MSECS = readNumberEnv(
    "UW_HTTP_KEEP_ALIVE_MSECS",
    1000
);

function normalizePositiveInteger(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
        return fallback;
    }

    return Math.trunc(value);
}

const sharedAgents: {
    http: http.Agent | null;
    https: https.Agent | null;
} = {
    http: null,
    https: null,
};

function getSharedHttpAgent(): http.Agent {
    if (sharedAgents.http) {
        return sharedAgents.http;
    }

    sharedAgents.http = new http.Agent({
        keepAlive: true,
        keepAliveMsecs: normalizePositiveInteger(
            DEFAULT_AGENT_KEEP_ALIVE_MSECS,
            1000
        ),
        maxFreeSockets: normalizePositiveInteger(
            DEFAULT_AGENT_MAX_FREE_SOCKETS,
            8
        ),
        maxSockets: normalizePositiveInteger(DEFAULT_AGENT_MAX_SOCKETS, 32),
        scheduling: "lifo",
    });

    return sharedAgents.http;
}

function getSharedHttpsAgent(): https.Agent {
    if (sharedAgents.https) {
        return sharedAgents.https;
    }

    sharedAgents.https = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: normalizePositiveInteger(
            DEFAULT_AGENT_KEEP_ALIVE_MSECS,
            1000
        ),
        maxFreeSockets: normalizePositiveInteger(
            DEFAULT_AGENT_MAX_FREE_SOCKETS,
            8
        ),
        maxSockets: normalizePositiveInteger(DEFAULT_AGENT_MAX_SOCKETS, 32),
        scheduling: "lifo",
    });

    return sharedAgents.https;
}

const ALLOWED_REDIRECT_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Prevent following redirects to unsupported schemes (e.g. file:, javascript:)
 * or redirects that include credentials.
 */
function enforceRedirectSafety(options: unknown): void {
    if (!isRecord(options)) {
        return;
    }

    const protocol =
        typeof options["protocol"] === "string" ? options["protocol"] : "";
    const auth = typeof options["auth"] === "string" ? options["auth"] : "";

    if (protocol.length > 0 && !ALLOWED_REDIRECT_PROTOCOLS.has(protocol)) {
        const error = new Error(`Unsupported redirect protocol: ${protocol}`);
        Reflect.set(error, "code", "UW_UNSUPPORTED_REDIRECT_PROTOCOL");
        throw error;
    }

    if (auth.length > 0) {
        const error = new Error("Redirect URL must not include credentials");
        Reflect.set(error, "code", "UW_UNSUPPORTED_REDIRECT_AUTH");
        throw error;
    }
}

/**
 * Creates a hardened Axios HTTP client instance suitable for monitor services.
 *
 * @param config - Normalized monitor configuration containing HTTP transport
 *   options.
 *
 * @returns Configured Axios instance with pooling, bounds, and timing
 *   interceptors enabled.
 */
export function createHttpClient(config: MonitorServiceConfig): AxiosInstance {
    const headers: Record<string, string> = {};
    if (config.userAgent !== undefined) {
        headers["User-Agent"] = config.userAgent;
    }

    // Add Accept header to handle content negotiation properly
    // Accept all content types to avoid 406 Not Acceptable responses
    headers["Accept"] = "*/*";

    const createConfig: AxiosRequestConfig = {
        beforeRedirect: enforceRedirectSafety,
        headers,
        // Connection pooling for better performance
        httpAgent: getSharedHttpAgent(),
        httpsAgent: getSharedHttpsAgent(),
        maxBodyLength: DEFAULT_MAX_BODY_LENGTH, // Bounded request size
        maxContentLength: DEFAULT_MAX_CONTENT_LENGTH, // Bounded response size
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        // Text response minimizes parsing overhead; status codes are
        // sufficient for monitoring
        responseType: "text",
        /**
         * Status validation strategy for monitoring.
         *
         * For monitoring purposes, ALL HTTP responses (including 4xx and 5xx)
         * should be treated as successful Axios responses so we can analyze the
         * status code in our monitoring logic. This prevents 4xx/5xx responses
         * from being thrown as Axios errors.
         */
        validateStatus: (): boolean => true,
    };

    if (config.timeout !== undefined) {
        createConfig.timeout = config.timeout;
    }

    const axiosInstance = axios.create(createConfig);

    // Set up interceptors for timing measurement
    setupTimingInterceptors(axiosInstance);

    return axiosInstance;
}
