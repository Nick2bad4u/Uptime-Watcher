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

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { isValidUrl } from "@shared/validation/validatorUtils";
import * as dns from "node:dns/promises";
import * as net from "node:net";
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";

import type { MonitorCheckResult } from "../types";

import { createTimeoutSignal } from "../shared/abortSignalUtils";

/* eslint-disable @microsoft/sdl/no-insecure-url -- Scheme literals are used only for stripping input; they are not used as navigated/executed URLs. */

const stripHttpScheme = (value: string): string => {
    const normalized = value.trim();
    const lower = normalized.toLowerCase();

    if (lower.startsWith("https://")) {
        return normalized.slice("https://".length);
    }

    if (lower.startsWith("http://")) {
        return normalized.slice("http://".length);
    }

    return normalized;
};

/* eslint-enable @microsoft/sdl/no-insecure-url -- End scheme stripping section. */

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
    timeout: number,
    signal?: AbortSignal
): Promise<TcpCheckResult> {
    const startTime = performance.now();

    return new Promise((resolve) => {
        const socket = new net.Socket();
        let resolved = false;

        const cleanup = (listener?: () => void): void => {
            if (!resolved) {
                resolved = true;
                socket.removeAllListeners();
                socket.destroy();
                if (signal && listener) {
                    signal.removeEventListener("abort", listener);
                }
            }
        };

        const resolveFailure = (listener?: () => void): void => {
            cleanup(listener);
            resolve({
                alive: false,
                responseTime: performance.now() - startTime,
            });
        };

        const abortListener = (): void => {
            resolveFailure(abortListener);
        };

        if (signal?.aborted) {
            abortListener();
            return;
        }

        if (signal) {
            signal.addEventListener("abort", abortListener, { once: true });
        }

        const handleConnect = (): void => {
            cleanup(abortListener);
            resolve({
                alive: true,
                port,
                responseTime: performance.now() - startTime,
            });
        };

        const handleTimeout = (): void => {
            resolveFailure(abortListener);
        };

        const handleError = handleTimeout;

        socket.setTimeout(timeout);
        socket.on("connect", handleConnect);
        socket.on("timeout", handleTimeout);
        socket.on("error", handleError);

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
    timeout: number,
    signal?: AbortSignal
): Promise<DnsCheckResult> {
    const startTime = performance.now();

    const timeoutSignal = AbortSignal.timeout(timeout);
    const combinedSignal = signal
        ? AbortSignal.any([timeoutSignal, signal])
        : timeoutSignal;
    let abortReject: ((reason?: unknown) => void) | undefined = undefined;

    const handleAbort = (): void => {
        const error = signal?.aborted
            ? new Error("Operation was aborted")
            : new Error(`DNS resolution timeout after ${timeout}ms`);

        abortReject?.(error);
    };

    try {
        const abortPromise = new Promise<string[]>((_resolve, reject): void => {
            abortReject = reject;

            if (combinedSignal.aborted) {
                handleAbort();
                return;
            }

            combinedSignal.addEventListener("abort", handleAbort, {
                once: true,
            });
        });

        const addresses = await Promise.race([
            dns.resolve4(host),
            abortPromise,
        ]);

        return {
            addresses,
            alive: true,
            responseTime: performance.now() - startTime,
        };
    } catch {
        return {
            alive: false,
            responseTime: performance.now() - startTime,
        };
    } finally {
        abortReject = undefined;
        combinedSignal.removeEventListener("abort", handleAbort);
    }
}

/**
 * Checks multiple TCP ports sequentially without await-in-loop
 *
 * @param host - Target host to check
 * @param ports - Array of ports to check
 * @param timeout - Timeout for each port check
 *
 * @returns Promise resolving to MonitorCheckResult if any port is open, null
 *   otherwise
 *
 * @internal
 */
async function checkTcpPorts(
    host: string,
    ports: number[],
    timeout: number,
    signal?: AbortSignal
): Promise<MonitorCheckResult | null> {
    // Check ports sequentially using recursion to avoid await-in-loop
    const checkPortsRecursively = async (
        portIndex: number
    ): Promise<MonitorCheckResult | null> => {
        if (portIndex >= ports.length) {
            return null;
        }

        const port = ports[portIndex];
        if (port === undefined) {
            return null;
        }
        const result = await checkTcpPort(host, port, timeout, signal);

        if (result.alive) {
            return {
                details: `TCP connection successful on port ${port}`,
                responseTime: Math.round(result.responseTime),
                status: "up",
            };
        }

        // Recursively check next port
        return checkPortsRecursively(portIndex + 1);
    };

    return checkPortsRecursively(0);
}

/**
 * HTTP/HTTPS connectivity check using fetch API
 *
 * @example
 *
 * ```typescript
 * import { monitorLogger } from "../../../utils/logger";
 *
 * const result = await checkHttpConnectivity(
 *     "https://api.example.com/health"
 * );
 * if (result.status === "up") {
 *     monitorLogger.info("Server responded", {
 *         responseTime: result.responseTime,
 *         status: result.status,
 *     });
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
    timeout: number = 5000,
    signal?: AbortSignal
): Promise<MonitorCheckResult> {
    const startTime = performance.now();

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Uptime-Watcher/15.4.0",
            },
            method: "HEAD",
            signal: createTimeoutSignal(timeout, signal),
        });
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
            error: getUserFacingErrorDetail(error),
            responseTime: Math.round(performance.now() - startTime),
            status: "down",
        };
    }
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
    options: ConnectivityOptions = {},
    signal?: AbortSignal
): Promise<MonitorCheckResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = performance.now();

    const normalizedHost: string = host.trim();

    if (isValidUrl(normalizedHost)) {
        return checkHttpConnectivity(normalizedHost, opts.timeout, signal);
    }

    const cleanHost: string = stripHttpScheme(normalizedHost);

    if (opts.method === "tcp" || opts.method === "http") {
        try {
            const tcpResult = await checkTcpPorts(
                cleanHost,
                opts.ports,
                opts.timeout,
                signal
            );

            if (tcpResult) {
                return tcpResult;
            }
        } catch (error) {
            return {
                details: `Connectivity check failed for ${String(normalizedHost)}`,
                error: getUserFacingErrorDetail(error),
                responseTime: Math.round(performance.now() - startTime),
                status: "down",
            };
        }
    }

    if (opts.method === "dns" || opts.method === "tcp") {
        const dnsResult = await checkDnsResolution(
            cleanHost,
            opts.timeout,
            signal
        );

        if (dnsResult.alive) {
            return {
                details: "DNS resolution successful, but no open ports found",
                responseTime: Math.round(dnsResult.responseTime),
                status: "degraded",
            };
        }
    }

    return {
        details: `Failed to connect to ${String(normalizedHost)}`,
        error: "Host unreachable - all connectivity checks failed",
        responseTime: Math.round(performance.now() - startTime),
        status: "down",
    };
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
    options: ConnectivityOptions = {},
    signal?: AbortSignal
): Promise<MonitorCheckResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const attemptCheck = async (
        attemptsLeft: number
    ): Promise<MonitorCheckResult> => {
        if (signal?.aborted) {
            throw new Error("Operation was aborted");
        }

        try {
            const result = await checkConnectivity(host, {
                ...opts,
                retries: 0, // Prevent nested retries
            }, signal);

            if (result.status === "up" || attemptsLeft === 0) {
                return result;
            }

            // Wait before retry
            const retryDelayMs =
                opts.retryDelay * (opts.retries - attemptsLeft + 2);
            if (signal) {
                await delay(retryDelayMs, undefined, { signal });
            } else {
                await delay(retryDelayMs);
            }

            return await attemptCheck(attemptsLeft - 1);
        } catch (error) {
            if (signal?.aborted) {
                throw new Error("Operation was aborted", { cause: error });
            }
            const errorResult: MonitorCheckResult = {
                details: `Check failed on attempt ${opts.retries - attemptsLeft + 2}`,
                error: getUserFacingErrorDetail(error),
                responseTime: opts.timeout,
                status: "down",
            };

            if (attemptsLeft === 0) {
                return errorResult;
            }

            // Wait before retry
            const retryDelayMs =
                opts.retryDelay * (opts.retries - attemptsLeft + 2);
            if (signal) {
                await delay(retryDelayMs, undefined, { signal });
            } else {
                await delay(retryDelayMs);
            }

            return attemptCheck(attemptsLeft - 1);
        }
    };

    return attemptCheck(opts.retries);
}
