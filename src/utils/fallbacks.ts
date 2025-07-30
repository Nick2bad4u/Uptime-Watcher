/**
 * Centralized fallback and default value utilities.
 * Provides type-safe fallback handling across the application.
 */

import type { Monitor } from "../types";

import logger from "../services/logger";
import { ensureError, withUtilityErrorHandling } from "./errorHandling";

/**
 * Enhanced null/undefined check utility.
 * Replaces scattered `value === null || value === undefined` patterns.
 *
 * @param value - Value to check
 * @returns Whether value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * Type-safe utility for React async event handlers.
 * Prevents void return type issues with async operations.
 *
 * @param operation - Async operation to execute
 * @param operationName - Name for logging purposes
 * @returns Sync function suitable for React event handlers
 */
export function withAsyncErrorHandling(operation: () => Promise<void>, operationName: string): () => void {
    return () => {
        void withUtilityErrorHandling(operation, operationName, undefined, false);
    };
}

/**
 * Synchronous error handling wrapper for operations that don't return promises.
 * Provides consistent error handling and fallback behavior for sync operations.
 *
 * @param operation - Synchronous operation to execute
 * @param operationName - Name for logging purposes
 * @param fallbackValue - Value to return if operation fails
 * @returns Result of operation or fallback value
 */
export function withSyncErrorHandling<T>(operation: () => T, operationName: string, fallbackValue: T): T {
    try {
        return operation();
    } catch (error) {
        logger.error(`${operationName} failed`, ensureError(error));
        return fallbackValue;
    }
}

export const UiDefaults = {
    // Chart defaults
    chartPeriod: "24h" as const,
    chartPoints: 24,

    // Labels
    errorLabel: "Error",
    // Timeouts defaults
    loadingDelay: 100, // ms before showing loading spinner
    loadingLabel: "Loading...",
    notAvailableLabel: "N/A",

    // Pagination defaults
    pageSize: 10,

    unknownLabel: "Unknown",
} as const;

/**
 * Get value with fallback, checking for null/undefined.
 *
 * @param value - The value to check for null or undefined
 * @param fallback - The fallback value to use if value is null or undefined
 * @returns The original value if not null/undefined, otherwise the fallback
 */
export function withFallback<T>(value: null | T | undefined, fallback: T): T {
    return value ?? fallback;
}

/**
 * Monitor-specific default values.
 */
export const MonitorDefaults = {
    checkInterval: 300_000, // 5 minutes
    responseTime: -1, // Sentinel for "never checked"
    retryAttempts: 3,
    status: "pending" as const,
    timeout: 10_000, // 10 seconds
} as const;

/**
 * Configuration for monitor display identifier generation.
 * Maps monitor types to functions that generate display identifiers.
 */
const MONITOR_IDENTIFIER_GENERATORS = new Map<string, (monitor: Monitor) => string | undefined>([
    ["http", (monitor) => monitor.url ?? undefined],
    ["ping", (monitor) => monitor.host ?? undefined],
    ["port", (monitor) => (monitor.host && monitor.port ? `${monitor.host}:${monitor.port}` : undefined)],
    // Add new monitor types here as they're implemented
    // ["dns", (monitor) => `${monitor.domain} (${monitor.recordType})` ?? undefined],
    // ["ssl", (monitor) => monitor.host ?? undefined],
    // ["api", (monitor) => monitor.endpoint ?? undefined],
]);

/**
 * Generate display identifier for a monitor dynamically.
 * Replaces hardcoded backward compatibility patterns.
 *
 * @param monitor - Monitor object
 * @param siteFallback - Fallback site identifier
 * @returns Display identifier string
 *
 * @remarks
 * This function uses a configuration-driven approach to support new monitor types
 * without requiring code changes. To add support for a new monitor type:
 * 1. Add an entry to MONITOR_IDENTIFIER_GENERATORS with a function that extracts the identifier
 * 2. The function will automatically use the new generator
 *
 * @example
 * ```typescript
 * // HTTP monitor
 * getMonitorDisplayIdentifier({type: "http", url: "https://example.com"}, "Site");
 * // Returns: "https://example.com"
 *
 * // Port monitor
 * getMonitorDisplayIdentifier({type: "port", host: "example.com", port: 80}, "Site");
 * // Returns: "example.com:80"
 *
 * // Unknown type
 * getMonitorDisplayIdentifier({type: "unknown"}, "My Site");
 * // Returns: "My Site"
 * ```
 */
export function getMonitorDisplayIdentifier(monitor: Monitor, siteFallback: string): string {
    return withSyncErrorHandling(
        () => {
            // First, try the configured generator for the monitor type
            const generator = MONITOR_IDENTIFIER_GENERATORS.get(monitor.type);
            if (generator) {
                const identifier = generator(monitor);
                if (identifier !== undefined) {
                    return identifier;
                }
            }

            // Fallback: Try common identifier fields
            return getGenericIdentifier(monitor) ?? siteFallback;
        },
        "Generate monitor display identifier",
        siteFallback
    );
}

/**
 * Generate identifier from common monitor fields.
 * Extracted to reduce complexity of main function.
 */
function getGenericIdentifier(monitor: Monitor): string | undefined {
    // Check common identifier fields in order of preference
    if (monitor.url) {
        return monitor.url;
    }
    if (monitor.host) {
        return monitor.port ? `${monitor.host}:${monitor.port}` : monitor.host;
    }
    return undefined;
}

/**
 * Configuration for monitor type display labels.
 * This makes it easy to add new monitor types without code changes.
 */
const MONITOR_TYPE_LABELS = new Map<string, string>([
    ["http", "Website URL"],
    ["ping", "Ping Monitor"],
    ["port", "Host & Port"],
    // Add new monitor types here as they're implemented
    // ["dns", "DNS Monitor"],
    // ["ssl", "SSL Certificate"],
    // ["api", "API Endpoint"],
]);

/**
 * Generate display label for monitor type dynamically.
 * Replaces hardcoded backward compatibility patterns.
 *
 * @param monitorType - Type of monitor
 * @returns Display label for the monitor type
 *
 * @remarks
 * This function uses a configuration-driven approach to support new monitor types
 * without requiring code changes. To add support for a new monitor type:
 * 1. Add an entry to MONITOR_TYPE_LABELS
 * 2. The function will automatically use the new label
 *
 * @example
 * ```typescript
 * getMonitorTypeDisplayLabel("http"); // "Website URL"
 * getMonitorTypeDisplayLabel("port"); // "Host & Port"
 * getMonitorTypeDisplayLabel("unknown"); // "Unknown Monitor"
 * ```
 */
export function getMonitorTypeDisplayLabel(monitorType: string): string {
    return withSyncErrorHandling(
        () => {
            // Check if we have a configured label for this monitor type
            if (monitorType && typeof monitorType === "string") {
                const configuredLabel = MONITOR_TYPE_LABELS.get(monitorType);
                if (configuredLabel) {
                    return configuredLabel;
                }

                // Fallback: Generate a reasonable label from the monitor type
                // Convert from camelCase/snake_case to Title Case
                const titleCase = monitorType
                    .replaceAll(/[_-]/g, " ") // Replace underscores and hyphens with spaces
                    .replaceAll(/([a-z])([A-Z])/g, "$1 $2") // Add space before capitals
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ");

                return `${titleCase} Monitor`;
            }

            // Final fallback for empty/invalid types
            return "Monitor Configuration";
        },
        "Get monitor type display label",
        UiDefaults.unknownLabel
    );
}

/**
 * Truncate sensitive data for logging (privacy protection).
 *
 * @param value - Value to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated string safe for logging
 */
export function truncateForLogging(value: string, maxLength = 50): string {
    // Guard clause: return early if value is shorter than maxLength or empty
    if (!value || value.length <= maxLength) {
        return value;
    }
    return value.slice(0, maxLength);
}

/**
 * Site-specific default values.
 */
export const SiteDefaults = {
    monitoring: true,
} as const;
