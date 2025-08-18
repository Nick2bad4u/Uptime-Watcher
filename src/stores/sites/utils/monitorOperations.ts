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
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import {
    isNonEmptyString,
    isValidUrl,
    safeInteger,
} from "@shared/validation/validatorUtils";

// Import validateMonitor directly from "@shared/types" if needed

/**
 * Validates and returns a monitor type or default
 */
function validateMonitorType(type: unknown): MonitorType {
    return typeof type === "string" &&
        BASE_MONITOR_TYPES.includes(type as MonitorType)
        ? (type as MonitorType)
        : BASE_MONITOR_TYPES[0];
}

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
 * @example
 *
 * ```typescript
 * const monitor = createDefaultMonitor({ url: "https://example.com" });
 * ```
 *
 * @param overrides - Partial monitor object to override defaults
 *
 * @returns Complete monitor object with defaults applied
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
 * @example
 *
 * ```typescript
 * const normalized = normalizeMonitor({
 *     id: "123",
 *     url: "https://example.com",
 * });
 * ```
 *
 * @param monitor - Partial monitor object to normalize
 *
 * @returns Complete monitor object with validated and normalized fields
 */
/**
 * Gets the allowed fields for a specific monitor type.
 *
 * @param type - The monitor type
 *
 * @returns Set of field names allowed for this monitor type
 *
 * @internal
 */
function getAllowedFieldsForMonitorType(type: MonitorType): Set<string> {
    // Base fields that all monitors have
    const baseFields = new Set([
        "activeOperations",
        "checkInterval",
        "history",
        "id",
        "lastChecked",
        "monitoring",
        "responseTime",
        "retryAttempts",
        "status",
        "timeout",
        "type",
    ]);

    // Add type-specific fields based on monitor type registry
    switch (type) {
        case "dns": {
            baseFields.add("expectedValue");
            baseFields.add("host");
            baseFields.add("recordType");
            break;
        }
        case "http": {
            baseFields.add("url");
            break;
        }
        case "ping": {
            baseFields.add("host");
            break;
        }
        case "port": {
            baseFields.add("host");
            baseFields.add("port");
            break;
        }
        default: {
            // For unknown types, only allow base fields
            break;
        }
    }

    return baseFields;
}

/**
 * Filters monitor object to only include fields appropriate for its type.
 *
 * @param monitor - Monitor object to filter
 * @param type - Monitor type to use for filtering
 *
 * @returns Filtered monitor object with only appropriate fields
 *
 * @internal
 */
function filterMonitorFieldsByType(
    monitor: Partial<Monitor>,
    type: MonitorType
): Partial<Monitor> {
    const allowedFields = getAllowedFieldsForMonitorType(type);
    const filtered: Partial<Monitor> = {};

    // Only include fields that are allowed for this monitor type
    // Use type assertion to safely access monitor properties
    const monitorRecord = monitor as Record<string, unknown>;
    for (const [key, value] of Object.entries(monitorRecord)) {
        if (allowedFields.has(key)) {
            (filtered as Record<string, unknown>)[key] = value;
        }
    }

    return filtered;
}

/**
 * Validates monitor input data before processing.
 *
 * @param monitor - Monitor data to validate
 *
 * @throws TypeError if monitor data is invalid
 *
 * @internal
 */
function validateMonitorInput(monitor: Partial<Monitor>): void {
    if (Array.isArray(monitor)) {
        throw new TypeError(
            "Invalid monitor data: must be an object, not an array"
        );
    }
}

export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    // Validate input data
    validateMonitorInput(monitor);

    // Cast to unknown first to avoid strict type issues with Partial<Monitor>
    const monitorData = monitor as unknown as Record<string, unknown>;
    const finalizedType = validateMonitorType(monitorData["type"]);

    // Filter the monitor data to only include fields appropriate for this type
    const filteredMonitor = filterMonitorFieldsByType(monitor, finalizedType);

    // Cast filtered monitor for safe access
    const filteredData = filteredMonitor as unknown as Record<string, unknown>;

    return {
        activeOperations: Array.isArray(filteredData["activeOperations"])
            ? (filteredData["activeOperations"] as string[])
            : [],
        checkInterval: safeInteger(
            filteredData["checkInterval"] as number | undefined,
            300_000,
            5000
        ),
        history: Array.isArray(filteredData["history"])
            ? (filteredData["history"] as Monitor["history"])
            : [],
        id: (filteredData["id"] as string | undefined) ?? crypto.randomUUID(),
        monitoring: (filteredData["monitoring"] as boolean | undefined) ?? true,
        responseTime:
            typeof filteredData["responseTime"] === "number"
                ? filteredData["responseTime"]
                : -1,
        retryAttempts: safeInteger(
            filteredData["retryAttempts"] as number | undefined,
            3,
            0,
            10
        ),
        status:
            filteredData["status"] &&
            isMonitorStatus(filteredData["status"] as string)
                ? (filteredData["status"] as Monitor["status"])
                : DEFAULT_MONITOR_STATUS,
        timeout: safeInteger(
            filteredData["timeout"] as number | undefined,
            5000,
            1000,
            300_000
        ),
        type: finalizedType,
        // Only add optional fields if they are explicitly provided and valid after filtering
        ...(isValidUrl(filteredData["url"] as string) && {
            url: filteredData["url"] as string,
        }),
        ...(isNonEmptyString(filteredData["host"] as string) && {
            host: filteredData["host"] as string,
        }),
        ...(typeof filteredData["port"] === "number" &&
            filteredData["port"] > 0 && {
                port: filteredData["port"],
            }),
        ...(filteredData["lastChecked"] instanceof Date && {
            lastChecked: filteredData["lastChecked"],
        }),
        // Add DNS-specific fields if this is a DNS monitor and they are present after filtering
        ...(finalizedType === "dns" &&
            isNonEmptyString(filteredData["recordType"] as string) && {
                recordType: filteredData["recordType"] as string,
            }),
        ...(finalizedType === "dns" &&
            isNonEmptyString(filteredData["expectedValue"] as string) && {
                expectedValue: filteredData["expectedValue"] as string,
            }),
    };
}

/**
 * Removes a monitor from a site
 *
 * @example
 *
 * ```typescript
 * const updatedSite = removeMonitorFromSite(site, "monitor-123");
 * ```
 *
 * @param site - The site to remove the monitor from
 * @param monitorId - The ID of the monitor to remove
 *
 * @returns Updated site without the specified monitor
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
 * @example
 *
 * ```typescript
 * const updatedSite = updateMonitorInSite(site, "monitor-123", {
 *     timeout: 10000,
 * });
 * ```
 *
 * @param site - The site containing the monitor
 * @param monitorId - The ID of the monitor to update
 * @param updates - Partial monitor updates to apply
 *
 * @returns Updated site with modified monitor
 *
 * @throws Error if monitor is not found
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

    // Validate updates before applying them
    validateMonitorInput(updates);

    const updatedMonitors = site.monitors.map((monitor) => {
        if (monitor.id === monitorId) {
            // Store original monitor for potential rollback
            const originalMonitor = monitor;

            try {
                // Validate and normalize the updated monitor
                const updatedMonitor = {
                    ...monitor,
                    ...updates,
                };
                return normalizeMonitor(updatedMonitor);
            } catch (error) {
                // Log error and return original monitor to prevent corruption
                console.error(`Failed to update monitor ${monitorId}:`, error);
                return originalMonitor;
            }
        }
        return monitor;
    });

    return { ...site, monitors: updatedMonitors };
}

/**
 * Validates that a monitor exists in a site
 *
 * @example
 *
 * ```typescript
 * validateMonitorExists(site, "monitor-123");
 * ```
 *
 * @param site - The site to check for the monitor
 * @param monitorId - The ID of the monitor to validate
 *
 * @throws Error if site is not found or monitor does not exist
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
     *
     * @returns Updated monitor with validated status
     *
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
