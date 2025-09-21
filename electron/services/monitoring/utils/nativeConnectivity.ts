/**
 * Native connectivity checking without external dependencies Replaces the ping
 * package entirely with TCP, DNS, and HTTP checks
 *
 * @remarks
 * This module provides reliable connectivity checking without requiring
 * elevated privileges or external system utilities. It uses Node.js built-in
 * modules (net, dns, fetch) to perform connectivity tests that are more
 * reliable and cross-platform compatible than ICMP ping.
 *
 * Key advantages over ping package:
 *
 * - No elevated privileges required
 * - Better cross-platform consistency
 * - More control over timeout/retry logic
 * - No shell command security risks
 * - Can check specific services (not just ICMP)
 * - Built-in HTTP/HTTPS connectivity checks
 *
 * @packageDocumentation
 */

import * as dns from "node:dns/promises";
import * as net from "node:net";
import { performance } from "node:perf_hooks";

import type { MonitorCheckResult } from "../types";

/**
 * Configuration options for connectivity checking
 */
export interface ConnectivityOptions {
    /** Check method to use (TCP port scanning, DNS resolution, or HTTP) */
    method?: "dns" | "http" | "tcp";
    /** Array of ports to try for TCP connectivity */
    ports?: number[];
    /** Number of retry attempts */
    retries?: number;
    /** Delay between retry attempts in milliseconds */
    retryDelay?: number;
    /** Timeout for each connectivity attempt in milliseconds */
    timeout?: number;
}

/**
 * Default configuration for connectivity checks
 */
const DEFAULT_OPTIONS: Required<ConnectivityOptions> = {
    method: "tcp",
    ports: [
        443,
        80,
        8080,
        3000,
        22,
        21,
        25,
        53,
        110,
        143,
        993,
        995,
    ],
    retries: 3,
    retryDelay: 1000,
    timeout: 5000,
};

/**
 * Result of a TCP port connectivity check
 */
interface TcpCheckResult {
    alive: boolean;
    port?: number;
    responseTime: number;
}

/**
 * Result of a DNS resolution check
 */
interface DnsCheckResult {
    addresses?: string[];
    alive: boolean;
    responseTime: number;
}

/**
 * Main connectivity check function that replaces ping.promise.probe
 *
 * @example
 *
 * ```typescript
 * // Basic TCP connectivity check
 * const result = await checkConnectivity("google.com");
 *
 * // HTTP connectivity check with custom timeout
 * const result = await checkConnectivity("https://api.example.com", {
 *     method: "http",
 *     timeout: 10000,
 * });
 *
 * // TCP check on specific ports
 * const result = await checkConnectivity("example.com", {
 *     method: "tcp",
 *     ports: [443, 80],
 *     timeout: 3000,
 * });
 * ```
 *
 * @param host - Target hostname or IP address to check
 * @param options - Configuration options for the connectivity check
 *
 * @returns Promise resolving to MonitorCheckResult with connectivity status
 *
 * @throws Error if the connectivity check encounters an unexpected error
 */
export async function checkConnectivity(
    host: string,
    options: ConnectivityOptions = {}
): Promise<MonitorCheckResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = performance.now();

    try {
        // Remove protocol if present for non-HTTP checks
        const cleanHost = host.replace(/^https?:\/\//v, "");

        // Handle HTTP/HTTPS URLs directly
        if (/^https?:\/\//v.test(host)) {
            return await checkHttpConnectivity(host, opts.timeout);
        }

        // Try TCP connectivity on multiple ports
        if (opts.method === "tcp" || opts.method === "http") {
            for (const port of opts.ports) {
                const result = await checkTcpPort(
                    cleanHost,
                    port,
                    opts.timeout
                );
                if (result.alive) {
                    return {
                        details: `TCP connection successful on port ${port}`,
                        responseTime: Math.round(result.responseTime),
                        status: "up",
                    };
                }
            }
        }

        // If TCP fails or method is DNS, try DNS resolution as fallback
        if (opts.method === "dns" || opts.method === "tcp") {
            const dnsResult = await checkDnsResolution(cleanHost, opts.timeout);
            if (dnsResult.alive) {
                // DNS resolution works but no TCP ports are accessible - degraded state
                return {
                    details:
                        "DNS resolution successful, but no open ports found",
                    responseTime: Math.round(dnsResult.responseTime),
                    status: "degraded",
                };
            }
        }

        // All checks failed
        return {
            details: `Failed to connect to ${host}`,
            error: "Host unreachable - all connectivity checks failed",
            responseTime: Math.round(performance.now() - startTime),
            status: "down",
        };
    } catch (error) {
        return {
            details: `Connectivity check failed for ${host}`,
            error: error instanceof Error ? error.message : String(error),
            responseTime: Math.round(performance.now() - startTime),
            status: "down",
        };
    }
}

/**
 * TCP port connectivity check using Node.js net module
 *
 * @param host - Target hostname or IP address
 * @param port - Port number to connect to
 * @param timeout - Connection timeout in milliseconds
 *
 * @returns Promise resolving to TcpCheckResult
 *
 * @internal
 */
async function checkTcpPort(
    host: string,
    port: number,
    timeout: number
): Promise<TcpCheckResult> {
    const startTime = performance.now();

    return new Promise((resolve) => {
        const socket = new net.Socket();
        let resolved = false;

        const cleanup = () => {
            if (!resolved) {
                resolved = true;
                socket.destroy();
            }
        };

        socket.setTimeout(timeout);

        socket.on("connect", () => {
            cleanup();
            resolve({
                alive: true,
                port,
                responseTime: performance.now() - startTime,
            });
        });

        socket.on("timeout", () => {
            cleanup();
            resolve({
                alive: false,
                responseTime: performance.now() - startTime,
            });
        });

        socket.on("error", () => {
            cleanup();
            resolve({
                alive: false,
                responseTime: performance.now() - startTime,
            });
        });

        socket.connect(port, host);
    });
}

/**
 * DNS resolution check using Node.js dns module
 *
 * @param host - Target hostname to resolve
 * @param timeout - Resolution timeout in milliseconds
 *
 * @returns Promise resolving to DnsCheckResult
 *
 * @internal
 */
async function checkDnsResolution(
    host: string,
    timeout: number
): Promise<DnsCheckResult> {
    const startTime = performance.now();

    try {
        // Create timeout promise that rejects after specified time
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
            const timerId = setTimeout(() => {
                reject(new Error(`DNS resolution timeout after ${timeout}ms`));
            }, timeout);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Timer ID captured for linting compliance
            timerId;
        });

        // Race between DNS resolution and timeout
        const addresses = await Promise.race([
            dns.resolve4(host),
            timeoutPromise,
        ]);

        return {
            addresses,
            alive: true,
            responseTime: performance.now() - startTime,
        };
    } catch {
        // DNS resolution failed or timed out
        return {
            alive: false,
            responseTime: performance.now() - startTime,
        };
    }
}

/**
 * HTTP/HTTPS connectivity check using fetch API
 *
 * @example
 *
 * ```typescript
 * const result = await checkHttpConnectivity(
 *     "https://api.example.com/health"
 * );
 * if (result.status === "up") {
 *     console.log(`Server responded in ${result.responseTime}ms`);
 * }
 * ```
 *
 * @param url - Complete URL to check (including protocol)
 * @param timeout - Request timeout in milliseconds
 *
 * @returns Promise resolving to MonitorCheckResult
 */
export async function checkHttpConnectivity(
    url: string,
    timeout: number = 5000
): Promise<MonitorCheckResult> {
    const startTime = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Uptime-Watcher/15.4.0",
            },
            method: "HEAD",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Math.round(performance.now() - startTime);

        if (response.ok) {
            return {
                details: `HTTP ${response.status} - ${response.statusText}`,
                responseTime,
                status: "up",
            };
        } else if (response.status >= 500) {
            // Server errors indicate the service is down
            return {
                details: `HTTP ${response.status} - ${response.statusText}`,
                error: `Server error: ${response.status}`,
                responseTime,
                status: "down",
            };
        }
        // Client errors (4xx) indicate service is reachable but degraded
        return {
            details: `HTTP ${response.status} - ${response.statusText}`,
            responseTime,
            status: "degraded",
        };
    } catch (error) {
        return {
            details: "HTTP request failed",
            error: error instanceof Error ? error.message : String(error),
            responseTime: Math.round(performance.now() - startTime),
            status: "down",
        };
    }
}

/**
 * Performs a connectivity check with automatic retry logic
 *
 * @example
 *
 * ```typescript
 * // Check with retries and exponential backoff
 * const result = await checkConnectivityWithRetry("unstable-server.com", {
 *     retries: 3,
 *     retryDelay: 1000,
 *     timeout: 5000,
 * });
 * ```
 *
 * @param host - Target hostname or IP address to check
 * @param options - Configuration options including retry settings
 *
 * @returns Promise resolving to MonitorCheckResult
 */
export async function checkConnectivityWithRetry(
    host: string,
    options: ConnectivityOptions = {}
): Promise<MonitorCheckResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: MonitorCheckResult | null = null;

    for (let attempt = 1; attempt <= opts.retries + 1; attempt++) {
        try {
            const result = await checkConnectivity(host, {
                ...opts,
                retries: 0, // Prevent nested retries
            });

            if (result.status === "up") {
                return result;
            }

            lastError = result;

            // Wait before retry (except on last attempt)
            if (attempt <= opts.retries) {
                await new Promise((resolve) =>
                    setTimeout(resolve, opts.retryDelay * attempt)
                );
            }
        } catch (error) {
            lastError = {
                details: `Check failed on attempt ${attempt}`,
                error: error instanceof Error ? error.message : String(error),
                responseTime: opts.timeout,
                status: "down",
            };
        }
    }

    return (
        lastError || {
            details: `Failed after ${opts.retries + 1} attempts`,
            error: "All connectivity checks failed",
            responseTime: opts.timeout,
            status: "down",
        }
    );
}
