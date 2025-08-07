/**
 * Monitor operations utility for handling monitor-related operations.
 *
 * @remarks
 * Provides utilities for working with monitor data and configurations,
 * including creation, validation, and manipulation of monitor objects.
 */

import {
    BASE_MONITOR_TYPES,
    DEFAULT_MONITOR_STATUS,
    isMonitorStatus,
    type Monitor,
    type MonitorType,
    type Site,
} from "@shared/types";
import {
    isNonEmptyString,
    isValidUrl,
    safeInteger,
} from "@shared/validation/validatorUtils";

import { ERROR_CATALOG } from "../../../../shared/utils/errorCatalog";

// Re-export validateMonitor from shared types for convenience
export { validateMonitor } from "@shared/types";

/**
 * Adds a monitor to a site
 */
export function addMonitorToSite(site: Site, monitor: Monitor): Site {
    const updatedMonitors = [...site.monitors, monitor];
    return { ...site, monitors: updatedMonitors };
}

/**
 * Creates a default monitor for a site
 *
 * @param overrides - Partial monitor object to override defaults
 * @returns Complete monitor object with defaults applied
 *
 * @example
 * ```typescript
 * const monitor = createDefaultMonitor({ url: "https://example.com" });
 * ```
 */
export function createDefaultMonitor(
    overrides: Partial<Monitor> = {}
): Monitor {
    return {
        activeOperations: [],
        checkInterval: 300_000, // 5 minutes default
        history: [],
        id: overrides.id ?? crypto.randomUUID(),
        monitoring: true,
        responseTime: -1, // Sentinel value for never checked
        retryAttempts: 3, // Default retry attempts
        status: DEFAULT_MONITOR_STATUS,
        timeout: 5000, // Default timeout
        type: BASE_MONITOR_TYPES[0] as MonitorType, // Use first available monitor type (http)
        ...overrides,
    };
}

/**
 * Finds a monitor in a site by ID
 */
export function findMonitorInSite(
    site: Site,
    monitorId: string
): Monitor | undefined {
    return site.monitors.find((monitor) => monitor.id === monitorId);
}

/**
 * Normalizes monitor data ensuring all required fields are present
 *
 * @param monitor - Partial monitor object to normalize
 * @returns Complete monitor object with validated and normalized fields
 *
 * @example
 * ```typescript
 * const normalized = normalizeMonitor({ id: "123", url: "https://example.com" });
 * ```
 */
export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    return {
        activeOperations: Array.isArray(monitor.activeOperations)
            ? monitor.activeOperations
            : [],
        checkInterval: safeInteger(monitor.checkInterval, 300_000, 5000),
        history: Array.isArray(monitor.history) ? monitor.history : [],
        id: monitor.id ?? crypto.randomUUID(),
        monitoring: monitor.monitoring ?? true,
        responseTime:
            typeof monitor.responseTime === "number"
                ? monitor.responseTime
                : -1,
        retryAttempts: safeInteger(monitor.retryAttempts, 3, 0, 10),
        status:
            monitor.status && isMonitorStatus(monitor.status)
                ? monitor.status
                : DEFAULT_MONITOR_STATUS,
        timeout: safeInteger(monitor.timeout, 5000, 1000, 300_000),
        type: validateMonitorType(monitor.type),
        // Only add optional fields if they are explicitly provided and valid
        ...(isValidUrl(monitor.url) && { url: monitor.url }),
        ...(isNonEmptyString(monitor.host) && { host: monitor.host }),
        ...(typeof monitor.port === "number" &&
            monitor.port > 0 && { port: monitor.port }),
        ...(monitor.lastChecked instanceof Date && {
            lastChecked: monitor.lastChecked,
        }),
    };
}

/**
 * Removes a monitor from a site
 *
 * @param site - The site to remove the monitor from
 * @param monitorId - The ID of the monitor to remove
 * @returns Updated site without the specified monitor
 *
 * @example
 * ```typescript
 * const updatedSite = removeMonitorFromSite(site, "monitor-123");
 * ```
 */
export function removeMonitorFromSite(site: Site, monitorId: string): Site {
    const updatedMonitors = site.monitors.filter(
        (monitor) => monitor.id !== monitorId
    );
    return { ...site, monitors: updatedMonitors };
}

/**
 * Updates a monitor in a site
 *
 * @param site - The site containing the monitor
 * @param monitorId - The ID of the monitor to update
 * @param updates - Partial monitor updates to apply
 * @returns Updated site with modified monitor
 * @throws Error if monitor is not found
 *
 * @example
 * ```typescript
 * const updatedSite = updateMonitorInSite(site, "monitor-123", { timeout: 10000 });
 * ```
 */
export function updateMonitorInSite(
    site: Site,
    monitorId: string,
    updates: Partial<Monitor>
): Site {
    const monitorExists = site.monitors.some(
        (monitor) => monitor.id === monitorId
    );
    if (!monitorExists) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }

    const updatedMonitors = site.monitors.map((monitor) => {
        if (monitor.id === monitorId) {
            // Validate and normalize the updated monitor
            const updatedMonitor = {
                ...monitor,
                ...updates,
            };
            return normalizeMonitor(updatedMonitor);
        }
        return monitor;
    });

    return { ...site, monitors: updatedMonitors };
}

/**
 * Validates that a monitor exists in a site
 *
 * @param site - The site to check for the monitor
 * @param monitorId - The ID of the monitor to validate
 * @throws Error if site is not found or monitor does not exist
 *
 * @example
 * ```typescript
 * validateMonitorExists(site, "monitor-123");
 * ```
 */
export function validateMonitorExists(
    site: Site | undefined,
    monitorId: string
): void {
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
    }

    const monitor = findMonitorInSite(site, monitorId);
    if (!monitor) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }
}

/**
 * Creates monitor update operations
 */
export const monitorOperations = {
    /**
     * Toggle monitor monitoring state
     */
    toggleMonitoring: (monitor: Monitor): Monitor => ({
        ...monitor,
        monitoring: !monitor.monitoring,
    }),
    /**
     * Update monitor check interval
     */
    updateCheckInterval: (monitor: Monitor, interval: number): Monitor => ({
        ...monitor,
        checkInterval: interval,
    }),
    /**
     * Update monitor retry attempts
     */
    updateRetryAttempts: (
        monitor: Monitor,
        retryAttempts: number
    ): Monitor => ({
        ...monitor,
        retryAttempts,
    }),
    /**
     * Update monitor status
     *
     * @param monitor - The monitor to update
     * @param status - The new status to set
     * @returns Updated monitor with validated status
     * @throws Error if status is not valid
     */
    updateStatus: (monitor: Monitor, status: Monitor["status"]): Monitor => {
        if (!isMonitorStatus(status)) {
            throw new Error(`Invalid monitor status: ${String(status)}`);
        }
        return {
            ...monitor,
            status,
        };
    },
    /**
     * Update monitor timeout
     */
    updateTimeout: (monitor: Monitor, timeout: number): Monitor => ({
        ...monitor,
        timeout,
    }),
};

/**
 * Validates and returns a monitor type or default
 */
function validateMonitorType(type: unknown): MonitorType {
    return typeof type === "string" &&
        BASE_MONITOR_TYPES.includes(type as MonitorType)
        ? (type as MonitorType)
        : BASE_MONITOR_TYPES[0];
}
