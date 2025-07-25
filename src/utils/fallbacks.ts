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
 * Generate display identifier for a monitor dynamically.
 * Replaces hardcoded backward compatibility patterns.
 *
 * @param monitor - Monitor object
 * @param siteFallback - Fallback site identifier
 * @returns Display identifier string
 */
export function getMonitorDisplayIdentifier(monitor: Monitor, siteFallback: string): string {
    return withSyncErrorHandling(
        () => {
            // Dynamic generation based on monitor type and available fields
            if (monitor.type === "http" && monitor.url) {
                return monitor.url;
            }
            if (monitor.type === "port" && monitor.host && monitor.port) {
                return `${monitor.host}:${monitor.port}`;
            }
            // Could be extended with other monitor types dynamically
            return siteFallback;
        },
        "Generate monitor display identifier",
        siteFallback
    );
}

/**
 * Generate display label for monitor type dynamically.
 * Replaces hardcoded backward compatibility patterns.
 *
 * @param monitorType - Type of monitor
 * @returns Display label for the monitor type
 */
export function getMonitorTypeDisplayLabel(monitorType: string): string {
    return withSyncErrorHandling(
        () => {
            // Dynamic generation based on monitor type
            switch (monitorType) {
                case "http": {
                    return "Website URL";
                }
                case "port": {
                    return "Host & Port";
                }
                // Could be extended with other types dynamically
                default: {
                    return "Monitor Configuration";
                }
            }
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
