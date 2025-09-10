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
 * console.log(
 *     `Status: ${result.status}, Response time: ${result.responseTime}ms`
 * );
 * ```
 *
 * @public
 *
 * @see {@link IMonitorService} - Interface contract for monitor services
 * @see {@link MonitorConfig} - Configuration options for monitors
 * @see {@link performDnsCheckWithRetry} - Core DNS checking functionality
 */

import type { MonitorType, Site } from "@shared/types";

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
    MonitorConfig,
} from "./types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import {
    createMonitorErrorResult,
    extractMonitorConfig,
} from "./shared/monitorServiceHelpers";

/**
 * Service for performing DNS monitoring checks.
 *
 * @remarks
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
 *     console.log(`DNS resolution successful: ${result.responseTime}ms`);
 * }
 * ```
 *
 * @public
 */
export class DnsMonitor implements IMonitorService {
    private config: MonitorConfig;

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
     * console.log(
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
     * @see {@link extractMonitorConfig} - Config extraction utility
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
        const { retryAttempts, timeout } = extractMonitorConfig(
            monitor,
            this.config.timeout
        );

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
                    await new Promise<void>((resolve) => {
                        // Timer will complete when Promise resolves, cleanup not needed
                        // eslint-disable-next-line clean-timer/assign-timer-id -- Timer completes with Promise resolution
                        setTimeout(
                            () => {
                                resolve();
                            },
                            2 ** attemptNumber * 1000
                        );
                    });
                    return attemptDnsCheck(attemptNumber + 1);
                }

                // Final attempt failed
                const responseTime = performance.now() - startTime;
                return {
                    details: "DNS resolution failed after retries",
                    error:
                        error instanceof Error ? error.message : String(error),
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
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
            // Timer used in Promise.race, cleanup not practical
            // eslint-disable-next-line clean-timer/assign-timer-id -- Timer used in race condition
            setTimeout(() => {
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

            // Format result based on record type and check expected value
            return this.formatDnsResult(result, recordType, expectedValue);
        } catch (error) {
            return {
                details: `DNS resolution failed for ${recordType} record`,
                error: error instanceof Error ? error.message : String(error),
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
    public constructor(config: MonitorConfig = {}) {
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
    public getConfig(): MonitorConfig {
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
    public updateConfig(config: Partial<MonitorConfig>): void {
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

            switch (recordType.toUpperCase()) {
                case "A":
                case "AAAA": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js DNS resolution for A/AAAA records returns string arrays as documented
                        actualValues = result as string[];
                        details = `${recordType} records: ${actualValues.join(", ")}`;
                    } else {
                        details = `No ${recordType} records found`;
                    }
                    break;
                }

                case "ANY": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js DNS ANY resolution returns objects with type field as documented
                        const anyRecords = result as Array<{ type: string }>;
                        details = `ANY records (${anyRecords.length} items)`;
                        actualValues = anyRecords.map((r) => JSON.stringify(r));
                    } else {
                        details = "No ANY records found";
                    }
                    break;
                }

                case "CAA": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js CAA resolution returns objects with critical/iodef/issue fields as documented
                        const caa = result as Array<{
                            critical: number;
                            iodef?: string;
                            issue?: string;
                        }>;
                        details = `CAA records: ${caa.length}`;
                        actualValues = caa
                            .map((r) => r.issue ?? r.iodef)
                            .filter(
                                (value): value is string =>
                                    typeof value === "string"
                            );
                    } else {
                        details = "No CAA records found";
                    }
                    break;
                }

                case "CNAME": {
                    if (Array.isArray(result) && result.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js CNAME resolution returns string arrays as documented
                        actualValues = result as string[];
                        details = `CNAME record: ${actualValues[0]}`;
                    } else {
                        details = "No CNAME records found";
                    }
                    break;
                }

                case "MX": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js MX resolution returns objects with exchange/priority fields as documented
                        const mxRecords = result as Array<{
                            exchange: string;
                            priority: number;
                        }>;
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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js NAPTR resolution returns objects with flags/regexp/replacement/service fields as documented
                        const naptr = result as Array<{
                            flags: string;
                            regexp: string;
                            replacement: string;
                            service: string;
                        }>;
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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js NS resolution returns string arrays as documented
                        actualValues = result as string[];
                        details = `NS records: ${actualValues.join(", ")}`;
                    } else {
                        details = "No NS records found";
                    }
                    break;
                }

                case "PTR": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js PTR resolution returns string arrays as documented
                        actualValues = result as string[];
                        details = `PTR records: ${actualValues.join(", ")}`;
                    } else {
                        details = "No PTR records found";
                    }
                    break;
                }

                case "SOA": {
                    if (result && typeof result === "object") {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js SOA resolution returns object with hostmaster/nsname/serial fields as documented
                        const soa = result as {
                            hostmaster: string;
                            nsname: string;
                            serial: number;
                        };
                        details = `SOA: ${soa.nsname} ${soa.hostmaster} (serial ${soa.serial})`;
                        actualValues = [soa.nsname, soa.hostmaster];
                    } else {
                        details = "No SOA record found";
                    }
                    break;
                }

                case "SRV": {
                    if (Array.isArray(result)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js SRV resolution returns objects with name/port/priority/weight fields as documented
                        const srvRecords = result as Array<{
                            name: string;
                            port: number;
                            priority: number;
                            weight: number;
                        }>;
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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js TLSA resolution returns objects with certUsage/match/selector fields as documented
                        const tlsa = result as Array<{
                            certUsage: number;
                            match: number;
                            selector: number;
                        }>;
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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Node.js TXT resolution returns array of string arrays as documented
                        const txtRecords = result as string[][];
                        const flatRecords = txtRecords.flat();
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
                error: error instanceof Error ? error.message : String(error),
                success: false,
            };
        }
    }
}
