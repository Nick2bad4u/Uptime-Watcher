/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes in
 * multiple files.
 */

import type {
    Monitor,
    MonitorFieldDefinition,
    MonitorType,
} from "@shared/types";
import type { UnknownRecord } from "type-fest";
import type * as z from "zod";

import { MONITOR_STATUS } from "@shared/types";
// Import shared validation schemas
import { withErrorHandling } from "@shared/utils/errorHandling";
import {
    httpHeaderMonitorSchema,
    httpJsonMonitorSchema,
    httpKeywordMonitorSchema,
    httpLatencyMonitorSchema,
    httpStatusMonitorSchema,
    monitorSchemas,
} from "@shared/validation/schemas";

import type { IMonitorService } from "./types";

import { logger } from "../../utils/logger";
import { DnsMonitor } from "./DnsMonitor";
import { HttpHeaderMonitor } from "./HttpHeaderMonitor";
import { HttpJsonMonitor } from "./HttpJsonMonitor";
import { HttpKeywordMonitor } from "./HttpKeywordMonitor";
import { HttpLatencyMonitor } from "./HttpLatencyMonitor";
import { HttpMonitor } from "./HttpMonitor";
import { HttpStatusMonitor } from "./HttpStatusMonitor";
import {
    createMigrationOrchestrator,
    exampleMigrations,
    migrationRegistry,
    versionManager,
} from "./MigrationSystem";
import { PingMonitor } from "./PingMonitor";
import { PortMonitor } from "./PortMonitor";
import { SslMonitor } from "./SslMonitor";

// Base monitor type definition
/**
 * Configuration contract for a monitor type in the monitoring system.
 *
 * @remarks
 * Each monitor type (e.g., HTTP, Port) must provide a configuration object
 * describing its metadata, validation schema, UI display options, and service
 * factory. This enables dynamic registration, validation, and UI rendering for
 * new monitor types.
 *
 * @param description - Description of what this monitor checks.
 * @param displayName - Human-readable display name for UI.
 * @param fields - Field definitions for dynamic form generation.
 * @param serviceFactory - Factory function to create monitor service instances.
 * @param type - Unique identifier for the monitor type.
 * @param uiConfig - Optional UI display configuration for analytics, history,
 *   and help texts.
 * @param validationSchema - Zod validation schema for this monitor type.
 * @param version - Version of the monitor implementation.
 *
 * @public
 */
export interface BaseMonitorConfig {
    /** Description of what this monitor checks */
    readonly description: string;
    /** Human-readable display name */
    readonly displayName: string;
    /** Field definitions for dynamic form generation */
    readonly fields: MonitorFieldDefinition[];
    /** Factory function to create monitor service instances */
    readonly serviceFactory: () => IMonitorService;
    /** Unique identifier for the monitor type */
    readonly type: string;
    /** UI display configuration */
    readonly uiConfig?: {
        /** Detail label formatter for different contexts */
        detailFormats?: {
            /** Format for analytics display */
            analyticsLabel?: string;
            /** Format for history detail column */
            historyDetail?: (details: string) => string;
        };
        /** Display preferences */
        display?: {
            showAdvancedMetrics?: boolean;
            showUrl?: boolean;
        };
        /**
         * Function to format detail display in history (e.g., "Port: 80",
         * "Response Code: 200")
         */
        formatDetail?: (details: string) => string;
        /**
         * Function to format title suffix for history charts (e.g., "
         * (https://example.com)")
         */
        formatTitleSuffix?: (monitor: Monitor) => string;
        /** Help text for form fields */
        helpTexts?: {
            primary?: string;
            secondary?: string;
        };
        /** Whether this monitor type supports advanced analytics */
        supportsAdvancedAnalytics?: boolean;
        /** Whether this monitor type supports response time analytics */
        supportsResponseTime?: boolean;
    };
    /** Zod validation schema for this monitor type */
    readonly validationSchema: z.ZodType;
    /** Version of the monitor implementation */
    readonly version: string;
}

// UI configuration for monitor type display
export interface MonitorUIConfig {
    /** Chart data formatters */
    chartFormatters?: {
        advanced?: boolean;
        responseTime?: boolean;
        uptime?: boolean;
    };
    /** Detail label formatter function name */
    detailLabelFormatter?: string;
    /** Display preferences */
    display?: {
        showAdvancedMetrics?: boolean;
        showPort?: boolean;
        showUrl?: boolean;
    };
    /** Help text for form fields */
    helpTexts?: {
        primary?: string;
        secondary?: string;
    };
}

/**
 * Internal registry for all monitor types and their configurations.
 *
 * @remarks
 * Used by registry functions to store and retrieve monitor type definitions.
 * Not exported.
 *
 * @internal
 */
const monitorTypes = new Map<string, BaseMonitorConfig>();

function toZodType(schema: z.ZodType): z.ZodType {
    return schema;
}

/**
 * Gets the configuration object for a given monitor type.
 *
 * @remarks
 * Returns the {@link BaseMonitorConfig} for the specified type, or undefined if
 * not registered.
 *
 * @param type - The monitor type identifier.
 *
 * @returns Monitor configuration object or undefined if the type is not
 *   registered.
 *
 * @public
 */
export function getMonitorTypeConfig(
    type: string
): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
}

/**
 * Gets all registered monitor type identifiers.
 *
 * @remarks
 * Returns an array of all monitor type string identifiers currently registered
 * in the system.
 *
 * @returns Array of registered monitor type strings.
 *
 * @public
 */
export function getRegisteredMonitorTypes(): readonly string[] {
    return Array.from(monitorTypes.keys());
}

/**
 * Checks if a monitor type is registered in the system.
 *
 * @remarks
 * Returns true if the specified monitor type identifier is registered, false
 * otherwise.
 *
 * @param type - The monitor type identifier to check.
 *
 * @returns True if the type is registered, false otherwise.
 *
 * @public
 */
export function isValidMonitorType(type: string): boolean {
    return monitorTypes.has(type);
}

/**
 * Simple monitor type validation for internal use.
 *
 * @remarks
 * Breaks circular dependency with EnhancedTypeGuards by providing basic
 * validation. Used internally by registry functions that need type validation
 * without importing external validation utilities.
 *
 * Validation logic:
 *
 * - Checks if type is a string
 * - Verifies type is registered in the monitor registry
 * - Returns structured result compatible with type guard patterns
 *
 * @param type - The monitor type to validate.
 *
 * @returns Validation result compatible with EnhancedTypeGuard interface.
 *
 * @internal
 */
function validateMonitorTypeInternal(type: unknown): {
    error?: string;
    success: boolean;
    value?: MonitorType;
} {
    if (typeof type !== "string") {
        return {
            error: "Monitor type must be a string",
            success: false,
        };
    }

    if (!isValidMonitorType(type)) {
        const validTypes = getRegisteredMonitorTypes();
        return {
            error: `Invalid monitor type: ${type}. Valid types: ${validTypes.join(", ")}`,
            success: false,
        };
    }

    return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Type validated by isValidMonitorType check above
        value: type as MonitorType,
    };
}

/**
 * Gets all registered monitor types with their configurations.
 *
 * @remarks
 * Returns an array of all monitor type configuration objects currently
 * registered in the system.
 *
 * @returns Array of {@link BaseMonitorConfig} objects for all registered monitor
 *   types.
 *
 * @public
 */
export function getAllMonitorTypeConfigs(): BaseMonitorConfig[] {
    return Array.from(monitorTypes.values());
}

/**
 * Gets the service factory function for a given monitor type.
 *
 * @remarks
 * Returns the factory function for creating monitor service instances for the
 * specified type, or undefined if not registered.
 *
 * @param type - The monitor type identifier.
 *
 * @returns Service factory function or undefined if the type is not registered.
 *
 * @public
 */
export function getMonitorServiceFactory(
    type: string
): (() => IMonitorService) | undefined {
    const config = getMonitorTypeConfig(type);
    return config?.serviceFactory;
}

/**
 * Registers a new monitor type with its configuration.
 *
 * @remarks
 * Adds the provided {@link BaseMonitorConfig} to the internal registry, making
 * it available for use in the system.
 *
 * @param config - The monitor type configuration object to register.
 *
 * @public
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
}

// Register existing monitor types with their field definitions and schemas
registerMonitorType({
    description:
        "Monitors HTTP/HTTPS endpoints for availability and response time",
    displayName: "HTTP (Website/API)",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "url",
        },
    ],
    serviceFactory: () => new HttpMonitor(),
    type: "http",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "HTTP Response Time",
            historyDetail: (details: string) => `Response Code: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => `Response Code: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "http") {
                return monitor.url ? ` (${monitor.url})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter the full URL including http:// or https://",
            secondary:
                "The monitor will check this URL according to your monitoring interval",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.http,
    version: "1.0.0",
});

registerMonitorType({
    description:
        "Validates that an HTTP/HTTPS response includes a specific header value.",
    displayName: "HTTP Header Match",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "https://example.com",
            required: true,
            type: "url",
        },
        {
            helpText:
                "Header to inspect in the HTTP response (case-insensitive).",
            label: "Header Name",
            name: "headerName",
            placeholder: "x-powered-by",
            required: true,
            type: "text",
        },
        {
            helpText:
                "Expected value for the header after trimming whitespace.",
            label: "Expected Header Value",
            name: "expectedHeaderValue",
            placeholder: "Express",
            required: true,
            type: "text",
        },
    ],
    serviceFactory: () => new HttpHeaderMonitor(),
    type: "http-header",
    uiConfig: {
        detailFormats: {
            historyDetail: (details: string) => details,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => details,
        formatTitleSuffix: (monitor: Monitor) =>
            monitor.url ? ` (${monitor.url})` : "",
        helpTexts: {
            primary:
                "Provide the response header name and expected value to monitor.",
            secondary:
                "Comparison is case-sensitive after trimming whitespace from both values.",
        },
        supportsResponseTime: true,
    },

    validationSchema: toZodType(httpHeaderMonitorSchema),
    version: "1.0.0",
});

registerMonitorType({
    description:
        "Monitors HTTP/HTTPS endpoints and ensures the response body contains a required keyword.",
    displayName: "HTTP Keyword Match",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "url",
        },
        {
            helpText:
                "Enter the keyword that must appear in the response body (case-insensitive)",
            label: "Keyword",
            name: "bodyKeyword",
            placeholder: "status: ok",
            required: true,
            type: "text",
        },
    ],
    serviceFactory: () => new HttpKeywordMonitor(),
    type: "http-keyword",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "HTTP Keyword Response Time",
            historyDetail: (details: string) => `Keyword Check: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => details,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "http-keyword") {
                return monitor.url ? ` (${monitor.url})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter the keyword to look for in the response body",
            secondary:
                "The response body is searched case-insensitively for the provided keyword.",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },

    validationSchema: httpKeywordMonitorSchema,
    version: "1.0.0",
});

registerMonitorType({
    description:
        "Validates JSON responses from HTTP/HTTPS endpoints by comparing values at specific paths.",
    displayName: "HTTP JSON Match",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "https://api.example.com/status",
            required: true,
            type: "url",
        },
        {
            helpText:
                "Use dot notation with optional indexes (e.g., data.items[0].status).",
            label: "JSON Path",
            name: "jsonPath",
            placeholder: "data.status",
            required: true,
            type: "text",
        },
        {
            helpText:
                "Expected value at the specified JSON path after trimming whitespace.",
            label: "Expected Value",
            name: "expectedJsonValue",
            placeholder: "ok",
            required: true,
            type: "text",
        },
    ],
    serviceFactory: () => new HttpJsonMonitor(),
    type: "http-json",
    uiConfig: {
        detailFormats: {
            historyDetail: (details: string) => details,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => details,
        formatTitleSuffix: (monitor: Monitor) =>
            monitor.url ? ` (${monitor.url})` : "",
        helpTexts: {
            primary:
                "Provide the JSON path and expected value to validate in the response body.",
            secondary:
                "Paths support nested properties and numeric indexes such as metadata.servers[0].status.",
        },
        supportsResponseTime: true,
    },

    validationSchema: toZodType(httpJsonMonitorSchema),
    version: "1.0.0",
});

registerMonitorType({
    description:
        "Monitors HTTP/HTTPS endpoints and verifies the response status code matches the expected value.",
    displayName: "HTTP Status Code",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "url",
        },
        {
            helpText: "Enter the expected HTTP status code (100-599)",
            label: "Expected Status Code",
            max: 599,
            min: 100,
            name: "expectedStatusCode",
            placeholder: "200",
            required: true,
            type: "number",
        },
    ],
    serviceFactory: () => new HttpStatusMonitor(),
    type: "http-status",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "HTTP Status Response Time",
            historyDetail: (details: string) => `Status Check: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => details,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "http-status") {
                return monitor.url ? ` (${monitor.url})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter the expected HTTP status code for this endpoint",
            secondary:
                "The monitor compares the response status with the expected status each run.",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },

    validationSchema: httpStatusMonitorSchema,
    version: "1.0.0",
});

registerMonitorType({
    description:
        "Tracks HTTP/HTTPS response times and warns when latency exceeds a configurable threshold.",
    displayName: "HTTP Latency Threshold",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "https://status.example.com",
            required: true,
            type: "url",
        },
        {
            helpText:
                "Maximum allowable response time in milliseconds before the monitor is marked degraded.",
            label: "Max Response Time (ms)",
            name: "maxResponseTime",
            placeholder: "1500",
            required: true,
            type: "number",
        },
    ],
    serviceFactory: () => new HttpLatencyMonitor(),
    type: "http-latency",
    uiConfig: {
        detailFormats: {
            historyDetail: (details: string) => details,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => details,
        formatTitleSuffix: (monitor: Monitor) =>
            monitor.url ? ` (${monitor.url})` : "",
        helpTexts: {
            primary:
                "Set the response time threshold that should trigger a degraded status.",
            secondary:
                "Response times at or below the threshold report as healthy; higher values are degraded.",
        },
        supportsResponseTime: true,
    },

    validationSchema: toZodType(httpLatencyMonitorSchema),
    version: "1.0.0",
});

registerMonitorType({
    description: "Monitors TCP port connectivity",
    displayName: "Port (Host/Port)",
    fields: [
        {
            helpText: "Enter a valid host (domain or IP)",
            label: "Host",
            name: "host",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "text",
        },
        {
            helpText: "Enter a port number (1-65535)",
            label: "Port",
            max: 65_535,
            min: 1,
            name: "port",
            placeholder: "80",
            required: true,
            type: "number",
        },
    ],
    serviceFactory: () => new PortMonitor(),
    type: "port",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "Port Response Time",
            historyDetail: (details: string) => `Port: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: false,
        },
        formatDetail: (details: string) => `Port: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "port") {
                return monitor.host && monitor.port
                    ? ` (${monitor.host}:${monitor.port})`
                    : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary: "Enter a port number (1-65535)",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.port,
    version: "1.0.0",
});

registerMonitorType({
    description: "Monitors network connectivity via ping",
    displayName: "Ping (Host)",
    fields: [
        {
            helpText: "Enter a valid host (domain or IP)",
            label: "Host",
            name: "host",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "text",
        },
    ],
    serviceFactory: () => new PingMonitor(),
    type: "ping",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "Ping Response Time",
            historyDetail: (details: string) => `Ping: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: false,
        },
        formatDetail: (details: string) => `Ping: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "ping") {
                return monitor.host ? ` (${monitor.host})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary:
                "The monitor will ping this host according to your monitoring interval",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.ping,
    version: "1.0.0",
});

registerMonitorType({
    description: "Monitors DNS record resolution for domains",
    displayName: "DNS (Domain Resolution)",
    fields: [
        {
            helpText: "Enter a valid domain name",
            label: "Host",
            name: "host",
            placeholder: "example.com",
            required: true,
            type: "text",
        },
        {
            helpText: "DNS record type to monitor",
            label: "Record Type",
            name: "recordType",
            options: [
                { label: "A (IPv4 Address)", value: "A" },
                { label: "AAAA (IPv6 Address)", value: "AAAA" },
                { label: "ANY (All Records)", value: "ANY" },
                {
                    label: "CAA (Certificate Authority Authorization)",
                    value: "CAA",
                },
                { label: "CNAME (Canonical Name)", value: "CNAME" },
                { label: "MX (Mail Exchange)", value: "MX" },
                {
                    label: "NAPTR (Naming Authority Pointer)",
                    value: "NAPTR",
                },
                { label: "NS (Name Server)", value: "NS" },
                { label: "PTR (Pointer)", value: "PTR" },
                { label: "SOA (Start of Authority)", value: "SOA" },
                { label: "SRV (Service Record)", value: "SRV" },
                { label: "TLSA (TLS Authentication)", value: "TLSA" },
                { label: "TXT (Text Record)", value: "TXT" },
            ],
            placeholder: "Select record type",
            required: true,
            type: "select",
        },
        {
            helpText:
                "Expected value in DNS response (optional). Ignored for ANY.",
            label: "Expected Value",
            name: "expectedValue",
            placeholder: "e.g., 192.168.1.1 or mail.example.com",
            required: false,
            type: "text",
        },
    ],
    serviceFactory: () => new DnsMonitor(),
    type: "dns",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "DNS Response Time",
            historyDetail: (details: string) => `DNS: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: false,
        },
        formatDetail: (details: string) => `DNS: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "dns") {
                return monitor.host && monitor.recordType
                    ? ` (${monitor.recordType} ${monitor.host})`
                    : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary: "Select the DNS record type to monitor",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.dns,
    version: "1.0.0",
});

registerMonitorType({
    description: "Monitors TLS certificates for validity and expiry windows",
    displayName: "SSL Certificate",
    fields: [
        {
            helpText: "Enter the host name that serves the certificate",
            label: "Host",
            name: "host",
            placeholder: "example.com",
            required: true,
            type: "text",
        },
        {
            helpText: "Port used for the TLS handshake (defaults to 443)",
            label: "Port",
            max: 65_535,
            min: 1,
            name: "port",
            placeholder: "443",
            required: true,
            type: "number",
        },
        {
            helpText:
                "Days before expiry to warn and mark the monitor as degraded",
            label: "Expiry Warning (days)",
            max: 365,
            min: 1,
            name: "certificateWarningDays",
            placeholder: "30",
            required: true,
            type: "number",
        },
    ],
    serviceFactory: () => new SslMonitor(),
    type: "ssl",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "SSL Handshake Time",
            historyDetail: (details: string) => `Certificate: ${details}`,
        },
        display: {
            showAdvancedMetrics: false,
            showUrl: false,
        },
        formatDetail: (details: string) => `Certificate: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type !== "ssl") {
                return "";
            }

            const hostValue = monitor.host ?? "";
            if (hostValue.trim().length === 0) {
                return "";
            }

            const portSegment =
                monitor.port === undefined ? "" : `:${monitor.port}`;
            return ` (${hostValue}${portSegment})`;
        },
        helpTexts: {
            primary:
                "Provide the host and port of the TLS endpoint you want to monitor",
            secondary:
                "Set the warning threshold to receive degraded alerts before the certificate expires",
        },
        supportsAdvancedAnalytics: false,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.ssl,
    version: "1.0.0",
});

// Register example migrations for the migration system
migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);

// Set current versions for existing monitor types
versionManager.setVersion("dns", "1.0.0");
versionManager.setVersion("ssl", "1.0.0");
versionManager.setVersion("http", "1.0.0");
versionManager.setVersion("http-header", "1.0.0");
versionManager.setVersion("http-json", "1.0.0");
versionManager.setVersion("http-keyword", "1.0.0");
versionManager.setVersion("http-latency", "1.0.0");
versionManager.setVersion("http-status", "1.0.0");
versionManager.setVersion("ping", "1.0.0");
versionManager.setVersion("port", "1.0.0");

/**
 * Create monitor object with runtime type validation.
 *
 * @remarks
 * Provides runtime type safety by validating monitor type and creating properly
 * structured monitor objects with sensible defaults.
 *
 * Process:
 *
 * 1. Validates monitor type using internal validation
 * 2. Creates monitor object with default values
 * 3. Merges provided data with defaults
 * 4. Returns structured result for error handling
 *
 * @example
 *
 * ```typescript
 * const result = createMonitorWithTypeGuards("http", {
 *     url: "https://example.com",
 * });
 * if (result.success) {
 *     console.log("Created monitor:", result.monitor);
 * } else {
 *     console.error("Validation errors:", result.errors);
 * }
 * ```
 *
 * @param type - Monitor type string to validate
 * @param data - Monitor data to merge with defaults
 *
 * @returns Validation result with created monitor or errors
 */
export function createMonitorWithTypeGuards(
    type: string,
    data: UnknownRecord
): {
    errors: string[];
    monitor?: UnknownRecord;
    success: boolean;
} {
    // Use internal type validation to avoid circular dependency
    const validationResult = validateMonitorTypeInternal(type);
    if (!validationResult.success) {
        return {
            errors: [validationResult.error ?? "Invalid monitor type"],
            success: false,
        };
    }

    const validMonitorType = validationResult.value;

    // Create monitor object with proper validation
    const monitor: UnknownRecord = {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: MONITOR_STATUS.PENDING,
        timeout: 10_000,
        type: validMonitorType,
        ...data,
    };

    return {
        errors: [],
        monitor,
        success: true,
    };
}

// Type guard for runtime validation
export function isValidMonitorTypeGuard(type: unknown): type is string {
    return typeof type === "string" && isValidMonitorType(type);
}

/**
 * Migrate monitor data between versions with comprehensive error handling.
 *
 * @remarks
 * Provides version migration support for monitor configurations using the
 * migration system. Handles both data transformations and version updates.
 *
 * Migration process:
 *
 * 1. Validates monitor type using internal validation
 * 2. Checks if migration is needed (version comparison)
 * 3. Uses migration orchestrator for data transformation
 * 4. Returns structured result with applied migrations
 *
 * Error handling:
 *
 * - Invalid monitor types return validation errors
 * - Missing migration paths return migration errors
 * - Transform failures include original error details
 * - All errors are logged for debugging
 *
 * @example
 *
 * ```typescript
 * const result = await migrateMonitorType(
 *     "http",
 *     "1.0.0",
 *     "1.1.0",
 *     monitorData
 * );
 * if (result.success) {
 *     console.log("Applied migrations:", result.appliedMigrations);
 *     return result.data;
 * } else {
 *     console.error("Migration failed:", result.errors);
 * }
 * ```
 *
 * @param monitorType - Type of monitor to migrate
 * @param fromVersion - Source version of the data
 * @param toVersion - Target version for migration
 * @param data - Optional monitor data to migrate
 *
 * @returns Migration result with transformed data or errors
 */
// Database migration helper - properly implemented with basic migration system
export async function migrateMonitorType(
    monitorType: MonitorType,
    fromVersion: string,
    toVersion: string,
    data?: UnknownRecord
): Promise<{
    appliedMigrations: string[];
    data?: UnknownRecord;
    errors: string[];
    success: boolean;
}> {
    try {
        return await withErrorHandling(
            async () => {
                // Validate the monitor type using internal validation
                const validationResult =
                    validateMonitorTypeInternal(monitorType);
                if (!validationResult.success) {
                    return {
                        appliedMigrations: [],
                        errors: [
                            validationResult.error ?? "Invalid monitor type",
                        ],
                        success: false,
                    };
                }

                logger.info(
                    `Migrating monitor type ${monitorType} from ${fromVersion} to ${toVersion}`
                );

                // Check if migration is needed
                if (fromVersion === toVersion) {
                    return {
                        appliedMigrations: [],
                        errors: [],
                        success: true,
                        ...(data && { data }),
                    };
                }

                // If no data provided, just return success for version bump
                if (!data) {
                    return {
                        appliedMigrations: [
                            `${monitorType}_${fromVersion}_to_${toVersion}`,
                        ],
                        errors: [],
                        success: true,
                    };
                }

                // Use the migration orchestrator for data migration
                const migrationOrchestrator = createMigrationOrchestrator();

                const migrationResult =
                    await migrationOrchestrator.migrateMonitorData(
                        monitorType,
                        data,
                        fromVersion,
                        toVersion
                    );

                return {
                    appliedMigrations: migrationResult.appliedMigrations,
                    errors: migrationResult.errors,
                    success: migrationResult.success,
                    ...(migrationResult.data && { data: migrationResult.data }),
                };
            },
            { logger, operationName: "Monitor migration" }
        );
    } catch (error) {
        return {
            appliedMigrations: [],
            errors: [
                `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
            ],
            success: false,
        };
    }
}
