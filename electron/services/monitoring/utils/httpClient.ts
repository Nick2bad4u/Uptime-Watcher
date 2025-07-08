/**
 * Axios configuration utilities for HTTP monitoring.
 * Provides standardized HTTP client setup and interceptors.
 */

import axios, { AxiosInstance } from "axios";
import * as http from "node:http";
import * as https from "node:https";

import { MonitorConfig } from "../types";

/**
 * Create a configured Axios instance for HTTP monitoring.
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
        maxBodyLength: 1024, // 1KB request limit (monitoring shouldn't send much data)
        maxContentLength: 10 * 1024 * 1024, // 10MB response limit
        maxRedirects: 5,
        responseType: "text", // We only need status codes, not parsed data
        // Custom status validation - all HTTP responses (including errors) are "successful" for axios
        // This allows us to handle status code logic manually in our monitoring logic
        validateStatus: () => {
            // Always treat as successful so we get response in success path, not error path
            // We'll manually determine up/down status based on status codes
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
 * Set up request and response interceptors for timing measurement.
 */
export function setupTimingInterceptors(axiosInstance: AxiosInstance): void {
    // Add request interceptor to record start time
    axiosInstance.interceptors.request.use(
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
            if (error.config?.metadata?.startTime) {
                const duration = performance.now() - error.config.metadata.startTime;
                error.responseTime = Math.round(duration);
            }
            return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
    );
}
