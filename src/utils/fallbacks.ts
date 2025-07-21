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
 * Ensures value is within bounds with fallback.
 */
export function clampWithFallback(
    value: null | number | undefined,
    min: number,
    max: number,
    fallback: number
): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, value));
}

/**
 * Format display value with fallback.
 */
export function formatDisplayValue(
    value: unknown,
    formatter: (val: unknown) => string,
    fallback = UiDefaults.unknownLabel
): string {
    if (isNullOrUndefined(value)) {
        return fallback;
    }
    return withSyncErrorHandling(() => formatter(value), "Format display value", fallback);
}

/**
 * Get monitor field with type-safe fallback.
 */
export function getMonitorField<K extends keyof typeof MonitorDefaults>(
    monitor: null | Record<string, unknown> | undefined,
    field: K,
    customFallback?: (typeof MonitorDefaults)[K]
): (typeof MonitorDefaults)[K] {
    // eslint-disable-next-line security/detect-object-injection -- Constrained key access
    const value = monitor?.[field];
    // eslint-disable-next-line security/detect-object-injection -- Constrained key access
    const fallback = customFallback ?? MonitorDefaults[field];

    // Type check the value
    if (typeof value === typeof fallback) {
        return value as (typeof MonitorDefaults)[K];
    }

    return fallback;
}

/**
 * Get nested property with fallback.
 */
export function getNestedValue<T>(obj: null | Record<string, unknown> | undefined, path: string, fallback: T): T {
    if (!obj || typeof obj !== "object") {
        return fallback;
    }

    const keys = path.split(".");
    let current: unknown = obj;

    for (const key of keys) {
        if (current && typeof current === "object" && Object.hasOwn(current, key)) {
            // eslint-disable-next-line security/detect-object-injection -- Constrained key access
            current = (current as Record<string, unknown>)[key];
        } else {
            return fallback;
        }
    }

    return (current as T) ?? fallback;
}

/**
 * Get site field with type-safe fallback.
 */
export function getSiteField<K extends keyof typeof SiteDefaults>(
    site: null | Record<string, unknown> | undefined,
    field: K,
    customFallback?: (typeof SiteDefaults)[K]
): (typeof SiteDefaults)[K] {
    // eslint-disable-next-line security/detect-object-injection -- Constrained key access
    const value = site?.[field];
    // eslint-disable-next-line security/detect-object-injection -- Constrained key access
    const fallback = customFallback ?? SiteDefaults[field];

    if (typeof value === typeof fallback) {
        return value as (typeof SiteDefaults)[K];
    }

    return fallback;
}

/**
 * Safe array access with fallback.
 */
export function safeArrayAccess<T>(array: null | T[] | undefined, index: number, fallback: T): T {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
        return fallback;
    }
    // eslint-disable-next-line security/detect-object-injection -- Array access with bounds check
    return array[index] ?? fallback;
}

/**
 * Get value with fallback, checking for null/undefined.
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
    return value.slice(0, maxLength);
}

/**
 * Site-specific default values.
 */
export const SiteDefaults = {
    monitoring: true,
} as const;
