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

import { sleepUnref } from "@shared/utils/abortUtils";
import { isRecord } from "@shared/utils/typeHelpers";
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

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import {
    createMonitorConfig,
    createMonitorErrorResult,
} from "./shared/monitorServiceHelpers";

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
     * @see {@link validateMonitorHost} - Host validation utility
     * @see {@link createMonitorConfig} - Config normalization utility
     * @see {@link performDnsCheckWithRetry} - Core DNS functionality
     */
    public async check(
        monitor: Site["monitors"][0]
    ): Promise<MonitorCheckResult> {
        if (monitor.type !== "dns") {
            throw new Error(
                `DnsMonitor cannot handle monitor type: ${monitor.type}`
            );
        }

        // Validate host field (DNS monitors use host like other monitor types)
        if (!monitor.host || typeof monitor.host !== "string") {
            return createMonitorErrorResult("Monitor missing valid host", 0);
        }

        // Validate recordType field
        if (!monitor.recordType || typeof monitor.recordType !== "string") {
            return createMonitorErrorResult(
                "Monitor missing valid recordType",
                0
            );
        }

        // Use type-safe utility functions to extract configuration
        const { retryAttempts, timeout } = createMonitorConfig(monitor, {
            timeout: this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT,
        });

        return this.performDnsCheckWithRetry(
            monitor.host,
            monitor.recordType,
            monitor.expectedValue,
            timeout,
            retryAttempts
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
        retryAttempts: number
    ): Promise<MonitorCheckResult> {
        const startTime = performance.now();

        // Use a different approach to avoid await-in-loop
        const attemptDnsCheck = async (
            attemptNumber: number
        ): Promise<MonitorCheckResult> => {
            try {
                const result = await this.performSingleDnsCheck(
                    host,
                    recordType,
                    expectedValue,
                    timeout
                );

                const responseTime = performance.now() - startTime;
                return {
                    details: result.details ?? "DNS resolution completed",
                    error: result.error ?? "",
                    responseTime: Math.round(responseTime),
                    status: result.success ? "up" : "down",
                };
            } catch (error) {
                // If we have retries left, wait and try again
                if (attemptNumber < retryAttempts) {
                    await sleepUnref(2 ** attemptNumber * 1000);
                    return attemptDnsCheck(attemptNumber + 1);
                }

                // Final attempt failed
                const responseTime = performance.now() - startTime;
                return {
                    details: "DNS resolution failed after retries",
                    error: getUserFacingErrorDetail(error),
                    responseTime: Math.round(responseTime),
                    status: "down",
                };
            }
        };

        return attemptDnsCheck(0);
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
        recordType: string,
        expectedValue: string | undefined,
        timeout: number
    ): Promise<{ details?: string; error?: string; success: boolean }> {
        // Create timeout promise with cleanup capability
        let timeoutId: NodeJS.Timeout | undefined = undefined;
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`DNS resolution timeout after ${timeout}ms`));
            }, timeout);
        });

        try {
            // Select appropriate DNS resolution method based on record type
            const resolvePromise = this.getDnsResolver(host, recordType);

            if (!resolvePromise) {
                return {
                    details: `Unsupported record type: ${recordType}`,
                    error: `Record type ${recordType} is not supported`,
                    success: false,
                };
            }

            // Race between DNS resolution and timeout
            const result = await Promise.race([resolvePromise, timeoutPromise]);

            // Clear timeout since operation completed successfully
            clearTimeout(timeoutId);

            // Format result based on record type and check expected value
            return this.formatDnsResult(result, recordType, expectedValue);
        } catch (error) {
            // Clear timeout in case of error
            clearTimeout(timeoutId);

            return {
                details: `DNS resolution failed for ${recordType} record`,
                error: getUserFacingErrorDetail(error),
                success: false,
            };
        }
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
        host: string,
        recordType: string
    ): null | Promise<unknown> {
        switch (recordType.toUpperCase()) {
            case "A": {
                return resolve4(host);
            }
            case "AAAA": {
                return resolve6(host);
            }
            case "ANY": {
                return resolveAny(host);
            }
            case "CAA": {
                return resolveCaa(host);
            }
            case "CNAME": {
                return resolveCname(host);
            }
            case "MX": {
                return resolveMx(host);
            }
            case "NAPTR": {
                return resolveNaptr(host);
            }
            case "NS": {
                return resolveNs(host);
            }
            case "PTR": {
                return resolvePtr(host);
            }
            case "SOA": {
                return resolveSoa(host);
            }
            case "SRV": {
                return resolveSrv(host);
            }
            case "TLSA": {
                return resolveTlsa(host);
            }
            case "TXT": {
                return resolveTxt(host);
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
    // eslint-disable-next-line sonarjs/cognitive-complexity -- DNS result formatting requires complex parsing logic for different record types
    private formatDnsResult(
        result: unknown,
        recordType: string,
        expectedValue?: string
    ): { details?: string; error?: string; success: boolean } {
        try {
            let details = "";
            let actualValues: string[] = [];

            const isString = (value: unknown): value is string =>
                typeof value === "string";

            const pickNumber = (
                primary: unknown,
                fallback: unknown
            ): number | undefined => {
                if (typeof primary === "number") {
                    return primary;
                }

                if (typeof fallback === "number") {
                    return fallback;
                }

                return undefined;
            };

            switch (recordType.toUpperCase()) {
                case "A":
                case "AAAA": {
                    if (Array.isArray(result)) {
                        actualValues = result.filter(isString);
                        details = `${recordType} records: ${actualValues.join(", ")}`;
                    } else {
                        details = `No ${recordType} records found`;
                    }
                    break;
                }

                case "ANY": {
                    if (Array.isArray(result)) {
                        const anyRecords = result.filter(isRecord);
                        details = `ANY records (${anyRecords.length} items)`;
                        actualValues = anyRecords.map((record) =>
                            JSON.stringify(record)
                        );
                    } else {
                        details = "No ANY records found";
                    }
                    break;
                }

                case "CAA": {
                    if (Array.isArray(result)) {
                        const caaRecords = result.filter(isRecord);
                        details = `CAA records: ${caaRecords.length}`;
                        actualValues = caaRecords.flatMap((record) => {
                            const { iodef, issue } = record;
                            if (typeof issue === "string") {
                                return [issue];
                            }
                            if (typeof iodef === "string") {
                                return [iodef];
                            }
                            return [];
                        });
                    } else {
                        details = "No CAA records found";
                    }
                    break;
                }

                case "CNAME": {
                    if (Array.isArray(result) && result.length > 0) {
                        actualValues = result.filter(isString);
                        details =
                            actualValues.length > 0
                                ? `CNAME record: ${actualValues[0]}`
                                : "No CNAME records found";
                    } else {
                        details = "No CNAME records found";
                    }
                    break;
                }

                case "MX": {
                    if (Array.isArray(result)) {
                        const mxRecords = result
                            .filter(isRecord)
                            .flatMap((record) => {
                                const { exchange, priority } = record;
                                if (
                                    typeof exchange === "string" &&
                                    typeof priority === "number" &&
                                    Number.isFinite(priority)
                                ) {
                                    return [{ exchange, priority }];
                                }
                                return [];
                            });
                        const formattedRecords = mxRecords
                            .map(
                                (record) =>
                                    `${record.priority} ${record.exchange}`
                            )
                            .join(", ");
                        details = `MX records: ${formattedRecords}`;
                        actualValues = mxRecords.map(
                            (record) => record.exchange
                        );
                    } else {
                        details = "No MX records found";
                    }
                    break;
                }

                case "NAPTR": {
                    if (Array.isArray(result)) {
                        const naptr = result
                            .filter(isRecord)
                            .flatMap((record) => {
                                const { flags, regexp, replacement, service } =
                                    record;
                                if (
                                    typeof flags === "string" &&
                                    typeof regexp === "string" &&
                                    typeof replacement === "string" &&
                                    typeof service === "string"
                                ) {
                                    return [
                                        {
                                            flags,
                                            regexp,
                                            replacement,
                                            service,
                                        },
                                    ];
                                }
                                return [];
                            });
                        details = `NAPTR records: ${naptr
                            .map(
                                (r) =>
                                    `${r.flags} ${r.service} ${r.replacement}`
                            )
                            .join(", ")}`;
                        actualValues = naptr.map((r) => r.replacement);
                    } else {
                        details = "No NAPTR records found";
                    }
                    break;
                }

                case "NS": {
                    if (Array.isArray(result)) {
                        actualValues = result.filter(isString);
                        details = `NS records: ${actualValues.join(", ")}`;
                    } else {
                        details = "No NS records found";
                    }
                    break;
                }

                case "PTR": {
                    if (Array.isArray(result)) {
                        actualValues = result.filter(isString);
                        details = `PTR records: ${actualValues.join(", ")}`;
                    } else {
                        details = "No PTR records found";
                    }
                    break;
                }

                case "SOA": {
                    if (isRecord(result)) {
                        const { hostmaster, nsname, serial } = result;
                        if (
                            typeof hostmaster === "string" &&
                            typeof nsname === "string" &&
                            typeof serial === "number" &&
                            Number.isFinite(serial)
                        ) {
                            details = `SOA: ${nsname} ${hostmaster} (serial ${serial})`;
                            actualValues = [nsname, hostmaster];
                        } else {
                            details = "No SOA record found";
                        }
                    } else {
                        details = "No SOA record found";
                    }
                    break;
                }

                case "SRV": {
                    if (Array.isArray(result)) {
                        const srvRecords = result
                            .filter(isRecord)
                            .flatMap((record) => {
                                const { name, port, priority, weight } = record;
                                if (
                                    typeof name === "string" &&
                                    typeof port === "number" &&
                                    Number.isFinite(port) &&
                                    typeof priority === "number" &&
                                    Number.isFinite(priority) &&
                                    typeof weight === "number" &&
                                    Number.isFinite(weight)
                                ) {
                                    return [
                                        {
                                            name,
                                            port,
                                            priority,
                                            weight,
                                        },
                                    ];
                                }
                                return [];
                            });
                        const formattedRecords = srvRecords
                            .map(
                                (record) =>
                                    `${record.priority} ${record.weight} ${record.port} ${record.name}`
                            )
                            .join(", ");
                        details = `SRV records: ${formattedRecords}`;
                        actualValues = srvRecords.map((record) => record.name);
                    } else {
                        details = "No SRV records found";
                    }
                    break;
                }

                case "TLSA": {
                    if (Array.isArray(result)) {
                        const tlsa = result
                            .filter(isRecord)
                            .flatMap((record) => {
                                const {
                                    certUsage,
                                    match,
                                    matchingType,
                                    selector,
                                    usage,
                                } = record;

                                const resolvedCertUsage = pickNumber(
                                    certUsage,
                                    usage
                                );
                                const resolvedMatch = pickNumber(
                                    match,
                                    matchingType
                                );

                                if (
                                    typeof resolvedCertUsage === "number" &&
                                    typeof resolvedMatch === "number" &&
                                    typeof selector === "number"
                                ) {
                                    return [
                                        {
                                            certUsage: resolvedCertUsage,
                                            match: resolvedMatch,
                                            selector,
                                        },
                                    ];
                                }
                                return [];
                            });
                        details = `TLSA records: ${tlsa.length}`;
                        actualValues = tlsa.map(
                            (r) => `${r.certUsage}:${r.selector}:${r.match}`
                        );
                    } else {
                        details = "No TLSA records found";
                    }
                    break;
                }

                case "TXT": {
                    if (Array.isArray(result)) {
                        const txtRecords = result.filter(
                            (entry): entry is unknown[] => Array.isArray(entry)
                        );
                        const flatRecords = txtRecords.flatMap((entry) =>
                            entry.filter(isString)
                        );
                        details = `TXT records: ${flatRecords.join(", ")}`;
                        actualValues = flatRecords;
                    } else {
                        details = "No TXT records found";
                    }
                    break;
                }

                default: {
                    details = `Unknown record type: ${recordType}`;
                    break;
                }
            }

            // Check expected value if provided (skip for ANY which returns heterogeneous records)
            let success = true;
            if (
                expectedValue &&
                recordType.toUpperCase() !== "ANY" &&
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
                success:
                    success &&
                    (recordType.toUpperCase() === "ANY"
                        ? Array.isArray(result) && result.length > 0
                        : actualValues.length > 0),
            };
        } catch (error) {
            return {
                details: "Failed to format DNS result",
                error: getUserFacingErrorDetail(error),
                success: false,
            };
        }
    }
}
