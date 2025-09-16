/**
 * Centralized fallback and default value utilities for robust error handling.
 *
 * @remarks
 * Provides type-safe fallback handling across the application with consistent
 * error handling, default value management, and UI state recovery patterns.
 * This module ensures the application remains functional even when expected
 * data is missing or invalid.
 *
 * Key features:
 *
 * - Type-safe null/undefined checking utilities
 * - Async error handling wrappers for React event handlers
 * - Consistent default value patterns for UI components
 * - Graceful degradation strategies for missing data
 * - Centralized fallback value definitions
 *
 * @example
 *
 * ```typescript
 * import {
 *     isNullOrUndefined,
 *     withAsyncErrorHandling,
 *     UiDefaults,
 * } from "./fallbacks";
 *
 * // Safe null checking
 * if (isNullOrUndefined(userInput)) {
 *     return UiDefaults.EMPTY_STRING;
 * }
 *
 * // Async event handler with error handling
 * const handleClick = withAsyncErrorHandling(
 *     async () => await saveData(),
 *     "saveData"
 * );
 *
 * // Use default values for missing data
 * const displayName = siteName || UiDefaults.UNNAMED_SITE;
 * ```
 *
 * @packageDocumentation
 */

import type { Monitor } from "@shared/types";
import type { ReadonlyDeep } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "../services/logger";

/**
 * Enhanced null/undefined check utility.
 *
 * Replaces scattered `value === null || value === undefined` patterns.
 *
 * @param value - Value to check
 *
 * @returns Whether value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * Type-safe utility for React async event handlers. Prevents void return type
 * issues with async operations.
 *
 * @param operation - Async operation to execute
 * @param operationName - Name for logging purposes
 *
 * @returns Sync function suitable for React event handlers
 */
export function withAsyncErrorHandling(
    operation: () => Promise<void>,
    operationName: string
): () => void {
    return () => {
        void (async (): Promise<void> => {
            try {
                await operation();
            } catch (error: unknown) {
                logger.error(`${operationName} failed`, ensureError(error));
            }
        })();
    };
}

/**
 * Synchronous error handling wrapper for operations that don't return promises.
 * Provides consistent error handling and fallback behavior for sync
 * operations.
 *
 * @param operation - Synchronous operation to execute
 * @param operationName - Name for logging purposes
 * @param fallbackValue - Value to return if operation fails
 *
 * @returns Result of operation or fallback value
 */
export function withSyncErrorHandling<T>(
    operation: () => T,
    operationName: string,
    fallbackValue: T
): T {
    try {
        return operation();
    } catch (error) {
        logger.error(`${operationName} failed`, ensureError(error));
        return fallbackValue;
    }
}

/**
 * Default values for UI components and user interface elements with deep
 * immutability.
 *
 * @remarks
 * Centralized defaults that ensure consistent behavior across the application
 * when data is missing or components need fallback values. Uses ReadonlyDeep to
 * guarantee immutability of the configuration object.
 */
export const UiDefaults: ReadonlyDeep<{
    /** Default chart time period for data visualization */
    chartPeriod: "24h";
    /** Default number of data points to display in charts */
    chartPoints: number;
    /** Default error message label */
    errorLabel: string;
    /** Delay in milliseconds before showing loading spinner */
    loadingDelay: number;
    /** Default loading state text */
    loadingLabel: string;
    /** Default text when data is not available */
    notAvailableLabel: string;
    /** Default page size for paginated lists */
    pageSize: number;
    /** Default text for unknown/unspecified values */
    unknownLabel: string;
}> = {
    // Chart defaults
    /** Default chart time period for data visualization */
    chartPeriod: "24h" as const,
    /** Default number of data points to display in charts */
    chartPoints: 24,

    // Labels
    /** Default error message label */
    errorLabel: "Error",
    // Timeouts defaults
    /** Delay in milliseconds before showing loading spinner */
    loadingDelay: 100, // ms before showing loading spinner
    /** Default loading state text */
    loadingLabel: "Loading...",
    /** Default text when data is not available */
    notAvailableLabel: "N/A",

    // Pagination defaults
    /** Default page size for paginated lists */
    pageSize: 10,

    /** Default text for unknown/unspecified values */
    unknownLabel: "Unknown",
} as const;

/**
 * Get value with fallback, checking for null/undefined.
 *
 * @param value - The value to check for null or undefined
 * @param fallback - The fallback value to use if value is null or undefined
 *
 * @returns The original value if not null/undefined, otherwise the fallback
 */
export function withFallback<T>(value: null | T | undefined, fallback: T): T {
    return value ?? fallback;
}

/**
 * Monitor-specific default values with deep immutability.
 *
 * @remarks
 * Standard defaults for monitor configuration to ensure consistent behavior
 * when monitors are created or when values are missing. Uses ReadonlyDeep to
 * guarantee immutability of the configuration object.
 */
export const MonitorDefaults: ReadonlyDeep<{
    /** Default check interval in milliseconds (5 minutes) */
    checkInterval: number;
    /** Sentinel value indicating monitor has never been checked */
    responseTime: number;
    /** Default number of retry attempts on failure */
    retryAttempts: number;
    /** Default status for new monitors */
    status: "pending";
    /** Default request timeout in milliseconds (10 seconds) */
    timeout: number;
}> = {
    /** Default check interval in milliseconds (5 minutes) */
    checkInterval: 300_000, // 5 minutes
    /** Sentinel value indicating monitor has never been checked */
    responseTime: -1, // Sentinel for "never checked"
    /** Default number of retry attempts on failure */
    retryAttempts: 3,
    /** Default status for new monitors */
    status: "pending" as const,
    /** Default request timeout in milliseconds (10 seconds) */
    timeout: 10_000, // 10 seconds
} as const;

/**
 * Configuration for monitor display identifier generation. Maps monitor types
 * to functions that generate display identifiers.
 */
const MONITOR_IDENTIFIER_GENERATORS = new Map<
    string,
    (monitor: Monitor) => string | undefined
>([
    ["http", (monitor): string | undefined => monitor.url ?? undefined],
    ["ping", (monitor): string | undefined => monitor.host ?? undefined],
    [
        "port",
        (
            monitor
        ):
            | string
            | undefined =>
            monitor.host && monitor.port
                ? `${monitor.host}:${monitor.port}`
                : undefined,
    ],
    // Add new monitor types here as they're implemented
    // ["dns", (monitor) => `${monitor.domain} (${monitor.recordType})` ??
    // undefined], ["ssl", (monitor) => monitor.host ?? undefined], ["api",
    // (monitor) => monitor.endpoint ?? undefined],
]);

/**
 * Generate identifier from common monitor fields. Extracted to reduce
 * complexity of main function.
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
 * Generate display identifier for a monitor dynamically. Replaces hardcoded
 * backward compatibility patterns.
 *
 * @remarks
 * This function uses a configuration-driven approach to support new monitor
 * types without requiring code changes. To add support for a new monitor type:
 *
 * 1. Add an entry to MONITOR_IDENTIFIER_GENERATORS with a function that extracts
 *    the identifier 2. The function will automatically use the new generator
 *
 * @example
 *
 * ```typescript
 * // HTTP monitor
 * getMonitorDisplayIdentifier(
 *     { type: "http", url: "https://example.com" },
 *     "Site"
 * );
 * // Returns: "https://example.com"
 *
 * // Port monitor
 * getMonitorDisplayIdentifier(
 *     { type: "port", host: "example.com", port: 80 },
 *     "Site"
 * );
 * // Returns: "example.com:80"
 *
 * // Unknown type
 * getMonitorDisplayIdentifier({ type: "unknown" }, "My Site");
 * // Returns: "My Site"
 * ```
 *
 * @param monitor - Monitor object
 * @param siteFallback - Fallback site identifier
 *
 * @returns Display identifier string
 */
export function getMonitorDisplayIdentifier(
    monitor: Monitor,
    siteFallback: string
): string {
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
 * Configuration for monitor type display labels. This makes it easy to add new
 * monitor types without code changes.
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
 * Generate display label for monitor type dynamically. Replaces hardcoded
 * backward compatibility patterns.
 *
 * @remarks
 * This function uses a configuration-driven approach to support new monitor
 * types without requiring code changes. To add support for a new monitor type:
 *
 * 1. Add an entry to MONITOR_TYPE_LABELS
 * 2. The function will automatically use the new label
 *
 * @example
 *
 * ```typescript
 * getMonitorTypeDisplayLabel("http"); // "Website URL"
 * getMonitorTypeDisplayLabel("port"); // "Host & Port"
 * getMonitorTypeDisplayLabel("unknown"); // "Unknown Monitor"
 * ```
 *
 * @param monitorType - Type of monitor
 *
 * @returns Display label for the monitor type
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
                    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- Environment compatibility
                    .replaceAll(/[_-]/g, " ") // Replace underscores and hyphens with spaces
                    // eslint-disable-next-line regexp/require-unicode-sets-regexp, no-lookahead-lookbehind-regexp/no-lookahead-lookbehind-regexp -- Environment compatibility
                    .replaceAll(/(?<=[a-z])(?=[A-Z])/g, " ") // Add space before capitals
                    .split(" ")
                    .map(
                        (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                    )
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
 *
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
 *
 * @remarks
 * Standard defaults for site configuration to ensure consistent behavior when
 * sites are created or when values are missing.
 */
export const SiteDefaults = {
    /** Default monitoring state for new sites */
    monitoring: true,
} as const;
