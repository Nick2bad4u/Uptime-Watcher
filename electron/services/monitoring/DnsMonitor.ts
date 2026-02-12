/**
 * DNS resolution monitoring service for domain name system checks.
 *
 * @remarks
 * Provides comprehensive DNS monitoring capabilities for various record types
 * with configurable timeouts, retry logic, and detailed response time
 * measurement. Designed for reliable DNS resolution verification across
 * different record types including A, AAAA, CNAME, MX, TXT, NS, and SRV.
 *
 * The service uses the native Node.js dns module for cross-platform DNS
 * resolution, ensuring consistent behavior across Windows, macOS, and Linux
 * platforms. Supports all common DNS record types with proper error handling
 * and response formatting.
 *
 * @example
 *
 * ```typescript
 * const dnsMonitor = new DnsMonitor({ timeout: 5000, retryAttempts: 3 });
 * const result = await dnsMonitor.check({
 *     id: "monitor_123",
 *     type: "dns",
 *     hostname: "example.com",
 *     recordType: "A",
 *     expectedValue: "192.168.1.1",
 *     status: "pending",
 *     monitoring: true,
 *     checkInterval: 300000,
 *     retryAttempts: 3,
 *     timeout: 5000,
 *     responseTime: -1,
 *     history: [],
 * });
 * logger.info(
 *     `Status: ${result.status}, Response time: ${result.responseTime}ms`
 * );
 * ```
 *
 * @public
 *
 * @see {@link IMonitorService} - Interface contract for monitor services
 * @see {@link MonitorServiceConfig} - Service-level configuration defaults
 * @see {@link performDnsCheckWithRetry} - Core DNS checking functionality
 */

import type { MonitorType, Site } from "@shared/types";

import { createAbortError, isAbortError } from "@shared/utils/abortError";
import { raceWithTimeout } from "@shared/utils/abortUtils";
import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import {
    resolve4,
    resolve6,
    resolveAny,
    resolveCaa,
    resolveCname,
    resolveMx,
    resolveNaptr,
    resolveNs,
    resolvePtr,
    resolveSoa,
    resolveSrv,
    resolveTlsa,
    resolveTxt,
} from "node:dns/promises";

import type {
    IMonitorService,
    MonitorCheckResult,
    MonitorServiceConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT, RETRY_BACKOFF  } from "../../constants";
import { withOperationalHooks } from "../../utils/operationalHooks";
import { createMonitorRetryPlan } from "./shared/monitorRetryUtils";
import {
    createMonitorConfig,
    createMonitorErrorResult,
    validateMonitorHost,
} from "./shared/monitorServiceHelpers";
import { parseDnsResolutionResult } from "./utils/dnsRecordParsing";

class DnsAttemptFailedError extends Error {
    public readonly details: string;

    public constructor(details: string, message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "DnsAttemptFailedError";
        this.details = details;
    }
}

function isDnsAttemptFailedError(error: unknown): error is DnsAttemptFailedError {
    return error instanceof DnsAttemptFailedError;
}

/**
 * Service for performing DNS monitoring checks.
 *
 * Implements the {@link IMonitorService} interface to provide DNS resolution
 * monitoring with advanced features for reliability and performance. Uses the
 * native Node.js dns module for cross-platform DNS resolution.
 *
 * The service automatically handles different types of DNS failures and
 * provides detailed error reporting for troubleshooting resolution issues. All
 * DNS operations support various record types and optional value matching.
 *
 * Key features:
 *
 * - Cross-platform DNS resolution using Node.js dns module
 * - Support for A, AAAA, CNAME, MX, TXT, NS, and SRV record types
 * - Configurable timeout and retry behavior
 * - Detailed response time measurement
 * - Optional expected value matching for verification
 * - Comprehensive error handling with meaningful messages
 *
 * @example
 *
 * ```typescript
 * const monitor = new DnsMonitor({
 *     timeout: 10000,
 *     retryAttempts: 3,
 * });
 *
 * const result = await monitor.check(dnsMonitorData);
 * if (result.status === "up") {
 *     logger.info(`DNS resolution successful: ${result.responseTime}ms`);
 * }
 * ```
 *
 * @public
 */
export class DnsMonitor implements IMonitorService {
    private config: MonitorServiceConfig;

    /**
     * Performs a DNS resolution check on the specified monitor.
     *
     * @remarks
     * Validates the monitor configuration before performing the DNS check,
     * ensuring the monitor type is "dns" and a valid hostname is provided. Uses
     * monitor-specific timeout and retry settings when available, falling back
     * to service defaults.
     *
     * The check process:
     *
     * 1. Validates monitor type and required fields
     * 2. Extracts timeout and retry configuration
     * 3. Performs DNS resolution with retry logic
     * 4. Returns standardized result with status, response time, and details
     *
     * Response time measurement includes the complete DNS resolution duration,
     * from query initiation to completion or failure.
     *
     * @example
     *
     * ```typescript
     * const monitor = {
     *     id: "dns_001",
     *     type: "dns" as const,
     *     hostname: "example.com",
     *     recordType: "A",
     *     timeout: 5000,
     *     retryAttempts: 3,
     *     // ... other required monitor properties
     * };
     *
     * const result = await dnsMonitor.check(monitor);
     * logger.info(
     *     `DNS ${monitor.hostname}: ${result.status} (${result.responseTime}ms)`
     * );
     * ```
     *
     * @param monitor - Monitor configuration containing hostname and DNS
     *   settings
     *
     * @returns Promise resolving to {@link MonitorCheckResult} with status,
     *   timing, and error data
     *
     * @throws {@link Error} When monitor validation fails (wrong type or
     *   missing hostname)
     *
     * @see {@link electron/services/monitoring/shared/monitorServiceHelpers#validateMonitorHost} - Host validation utility
     * @see {@link createMonitorConfig} - Config normalization utility
     * @see {@link performDnsCheckWithRetry} - Core DNS functionality
     */
    public async check(
        monitor: Site["monitors"][0],
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "dns") {
            throw new Error(
                `DnsMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        const hostError = validateMonitorHost(monitor);
        if (hostError) {
            return createMonitorErrorResult(hostError, 0);
        }

        // Host is guaranteed to be valid at this point due to validation above
        if (!monitor.host) {
            return createMonitorErrorResult("Monitor missing valid host", 0);
        }

        const host = monitor.host.trim();

        // Validate recordType field
        const recordTypeRaw = monitor.recordType;
        if (typeof recordTypeRaw !== "string" || recordTypeRaw.trim().length === 0) {
            return createMonitorErrorResult(
                "Monitor missing valid recordType",
                0
            );
        }

        const recordType = recordTypeRaw.trim();

        // Use type-safe utility functions to extract configuration
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        return this.performDnsCheckWithRetry(
            host,
            recordType,
            monitor.expectedValue,
            timeout,
            retryAttempts,
            signal
        );
    }

    /**
     * Performs DNS resolution check with retry logic.
     *
     * @remarks
     * Executes DNS resolution for the specified record type with comprehensive
     * error handling and response formatting. Supports retry logic for handling
     * transient DNS failures.
     *
     * @private
     *
     * @param host - The hostname to resolve
     * @param recordType - The DNS record type to query
     * @param expectedValue - Optional expected value for verification
     * @param timeout - Timeout in milliseconds
     * @param retryAttempts - Number of retry attempts
     *
     * @returns Promise resolving to MonitorCheckResult
     */
    private async performDnsCheckWithRetry(
        host: string,
        recordType: string,
        expectedValue: string | undefined,
        timeout: number,
        retryAttempts: number,
        signal?: AbortSignal
    ): Promise<MonitorCheckResult> {
        const startTime = performance.now();
        const { additionalRetries, totalAttempts } = createMonitorRetryPlan(retryAttempts);

        const resolver = this.getDnsResolver(recordType);
        if (!resolver) {
            const responseTime = performance.now() - startTime;
            return {
                details: `Unsupported record type: ${recordType}`,
                error: `Record type ${recordType} is not supported`,
                responseTime: Math.round(responseTime),
                status: "down",
            };
        }

        try {
            const details = await withOperationalHooks(
                async () =>
                    this.performSingleDnsCheck(
                        host,
                        resolver,
                        recordType,
                        expectedValue,
                        timeout,
                        signal
                    ),
                {
                    failureLogLevel: "warn",
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: totalAttempts,
                    // Keep operation name stable to prevent log/event
                    // cardinality explosions.
                    operationName: "dns-resolution-check",
                    ...(signal ? { signal } : {}),
                }
            );

            const responseTime = performance.now() - startTime;
            return {
                details,
                error: "",
                responseTime: Math.round(responseTime),
                status: "up",
            };
        } catch (error) {
            const normalizedError = ensureError(error);

            if (isAbortError(normalizedError)) {
                return {
                    details: "Error",
                    error: "Request canceled",
                    responseTime: 0,
                    status: "down",
                };
            }

            let resolvedDetails = `DNS resolution failed after ${additionalRetries} retries`;

            if (isDnsAttemptFailedError(normalizedError)) {
                resolvedDetails = normalizedError.details;
            } else if (normalizedError.message.includes("timeout")) {
                resolvedDetails = normalizedError.message;
            }

            const responseTime = performance.now() - startTime;
            return {
                details: resolvedDetails,
                error: getUserFacingErrorDetail(normalizedError),
                responseTime: Math.round(responseTime),
                status: "down",
            };
        }
    }

    /**
     * Performs a single DNS resolution check.
     *
     * @remarks
     * Executes the actual DNS resolution based on the record type and formats
     * the response appropriately. Handles timeout and error conditions.
     *
     * @private
     *
     * @param host - The hostname to resolve
     * @param recordType - The DNS record type to query
     * @param expectedValue - Optional expected value for verification
     * @param timeout - Timeout in milliseconds
     *
     * @returns Promise resolving to check result with success flag and details
     */
    private async performSingleDnsCheck(
        host: string,
        resolver: (host: string) => Promise<unknown>,
        recordType: string,
        expectedValue: string | undefined,
        timeout: number,
        signal?: AbortSignal
    ): Promise<string> {
        if (signal?.aborted) {
            throw createAbortError({ cause: Reflect.get(signal, "reason") });
        }

        const result = await raceWithTimeout(resolver(host), {
            timeoutMessage: `DNS resolution timeout after ${timeout}ms`,
            timeoutMs: timeout,
            unrefTimer: true,
            ...(signal ? { signal } : {}),
        });

        const formatted = this.formatDnsResult(
            result,
            recordType,
            expectedValue
        );

        if (formatted.success) {
            return formatted.details;
        }

        throw new DnsAttemptFailedError(
            formatted.details,
            `DNS record verification failed for ${recordType}`
        );
    }

    /**
     * Creates a new DnsMonitor instance with the specified configuration.
     *
     * @remarks
     * Initializes the monitor with default timeout and retry values, merging
     * any provided configuration options. The monitor uses sensible defaults if
     * no configuration is provided, making it safe to instantiate without
     * parameters.
     *
     * Default configuration:
     *
     * - Timeout: 30000ms (30 seconds)
     * - RetryAttempts: 3
     *
     * @example
     *
     * ```typescript
     * // Use default configuration
     * const monitor = new DnsMonitor();
     *
     * // Custom configuration
     * const monitor = new DnsMonitor({
     *     timeout: 5000,
     *     retryAttempts: 5,
     * });
     * ```
     *
     * @param config - Configuration options for the monitor service
     */
    public constructor(config: MonitorServiceConfig = {}) {
        this.config = {
            timeout: DEFAULT_REQUEST_TIMEOUT,
            ...config,
        };
    }

    /**
     * Get the current configuration.
     *
     * @remarks
     * Returns a defensive shallow copy of the current configuration to prevent
     * external modification. This ensures configuration immutability and
     * prevents accidental state corruption.
     *
     * @returns A shallow copy of the current monitor configuration
     */
    public getConfig(): MonitorServiceConfig {
        return { ...this.config };
    }

    /**
     * Get the monitor type this service handles.
     *
     * @remarks
     * Returns the string identifier used to route monitoring requests to this
     * service implementation. Uses the {@link MonitorType} union type for type
     * safety and consistency across the application.
     *
     * @returns The monitor type identifier
     */
    public getType(): MonitorType {
        return "dns";
    }

    /**
     * Update the configuration for this monitor service.
     *
     * @remarks
     * Merges the provided configuration with the existing configuration. Only
     * specified properties are updated; undefined properties are ignored. Used
     * for runtime configuration updates without service recreation.
     *
     * @param config - Partial configuration to update
     */
    public updateConfig(config: Partial<MonitorServiceConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
    }

    /**
     * Gets the appropriate DNS resolver function based on record type.
     *
     * @private
     *
     * @param host - The hostname to resolve
     * @param recordType - The DNS record type to query
     *
     * @returns Promise for DNS resolution or null if unsupported
     */
    private getDnsResolver(
        recordType: string
    ): ((host: string) => Promise<unknown>) | null {
        switch (recordType.toUpperCase()) {
            case "A": {
                return (hostValue) => resolve4(hostValue);
            }
            case "AAAA": {
                return (hostValue) => resolve6(hostValue);
            }
            case "ANY": {
                return (hostValue) => resolveAny(hostValue);
            }
            case "CAA": {
                return (hostValue) => resolveCaa(hostValue);
            }
            case "CNAME": {
                return (hostValue) => resolveCname(hostValue);
            }
            case "MX": {
                return (hostValue) => resolveMx(hostValue);
            }
            case "NAPTR": {
                return (hostValue) => resolveNaptr(hostValue);
            }
            case "NS": {
                return (hostValue) => resolveNs(hostValue);
            }
            case "PTR": {
                return (hostValue) => resolvePtr(hostValue);
            }
            case "SOA": {
                return (hostValue) => resolveSoa(hostValue);
            }
            case "SRV": {
                return (hostValue) => resolveSrv(hostValue);
            }
            case "TLSA": {
                return (hostValue) => resolveTlsa(hostValue);
            }
            case "TXT": {
                return (hostValue) => resolveTxt(hostValue);
            }
            default: {
                return null;
            }
        }
    }

    /**
     * Formats DNS resolution results and checks expected values.
     *
     * @remarks
     * Converts raw DNS resolution results into user-friendly display format and
     * performs optional expected value matching for verification.
     *
     * @private
     *
     * @param result - Raw DNS resolution result
     * @param recordType - The DNS record type that was queried
     * @param expectedValue - Optional expected value for verification
     *
     * @returns Formatted result with success flag and details
     */
    private formatDnsResult(
        result: unknown,
        recordType: string,
        expectedValue?: string
    ): { details: string; success: boolean } {
        try {
            const parsed = parseDnsResolutionResult(result, recordType);

            const {
                actualValues,
                details: parsedDetails,
                hasRecords,
                skipExpectedValueCheck,
            } = parsed;
            let details = parsedDetails;

            // Check expected value if provided (skip for ANY which returns heterogeneous records)
            let success = true;
            if (
                expectedValue &&
                !skipExpectedValueCheck &&
                actualValues.length > 0
            ) {
                success = actualValues.some(
                    (value) =>
                        value
                            .toLowerCase()
                            .includes(expectedValue.toLowerCase()) ||
                        expectedValue
                            .toLowerCase()
                            .includes(value.toLowerCase())
                );

                if (!success) {
                    details += ` (Expected: ${expectedValue})`;
                }
            }

            return {
                details,
                success: success && hasRecords,
            };
        } catch {
            return {
                details: "Failed to format DNS result",
                success: false,
            };
        }
    }
}
