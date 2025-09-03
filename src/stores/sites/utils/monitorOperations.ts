/**
 * Monitor operations utility for handling monitor-related operations.
 *
 * @remarks
 * Provides utilities for working with monitor data and configurations,
 * including creation, validation, and manipulation of monitor objects.
 */

import type { UnknownRecord } from "type-fest";

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
    isValidPort,
    isValidUrl,
    safeInteger,
} from "@shared/validation/validatorUtils";

// Import validateMonitor directly from "@shared/types" if needed

/**
 * Default monitor configuration values. Centralized to ensure consistency
 * between createDefaultMonitor and normalizeMonitor.
 *
 * @internal
 */
const DEFAULT_MONITOR_CONFIG = {
    activeOperations: [] as string[],
    checkInterval: 300_000, // 5 minutes default
    history: [] as Monitor["history"],
    monitoring: true,
    responseTime: -1, // Sentinel value for never checked
    retryAttempts: 3, // Default retry attempts
    status: DEFAULT_MONITOR_STATUS,
    timeout: 5000, // Default timeout
    type: BASE_MONITOR_TYPES[0] as MonitorType, // Use first available monitor type (http)
} as const;

/**
 * Validates and returns a monitor type or default
 */
function validateMonitorType(type: unknown): MonitorType {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Type validation with runtime checks ensures safe assertions */
    return typeof type === "string" &&
        BASE_MONITOR_TYPES.includes(type as MonitorType)
        ? (type as MonitorType)
        : BASE_MONITOR_TYPES[0];
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
}

/**
 * Adds a monitor to a site
 */
export function addMonitorToSite(site: Site, monitor: Monitor): Site {
    const updatedMonitors = [...site.monitors, monitor];
    return { ...site, monitors: updatedMonitors };
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
    const monitorRecord = monitor as UnknownRecord;
    for (const [key, value] of Object.entries(monitorRecord)) {
        if (allowedFields.has(key)) {
            (filtered as UnknownRecord)[key] = value;
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

/**
 * Applies type-specific field requirements and defaults for HTTP monitors.
 */
function applyHttpMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // HTTP monitors require a URL - provide default if missing or invalid
    const urlValue = filteredData["url"];
    monitor.url = isValidUrl(urlValue) ? urlValue : "https://example.com";
}

/**
 * Applies type-specific field requirements and defaults for port monitors.
 */
function applyPortMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // Port monitors require host and port
    const hostValue = filteredData["host"];
    const portValue = filteredData["port"];

    monitor.host = isNonEmptyString(hostValue) ? hostValue : "localhost";
    monitor.port = isValidPort(portValue) ? Number(portValue) : 80;
}

/**
 * Applies type-specific field requirements and defaults for ping monitors.
 */
function applyPingMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // Ping monitors require host
    const hostValue = filteredData["host"];
    monitor.host = isNonEmptyString(hostValue) ? hostValue : "localhost";
}

/**
 * Applies type-specific field requirements and defaults for DNS monitors.
 */
function applyDnsMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // DNS monitors require host, recordType, and expectedValue
    const hostValue = filteredData["host"];
    const recordTypeValue = filteredData["recordType"];
    const expectedValueValue = filteredData["expectedValue"];

    monitor.host = isNonEmptyString(hostValue) ? hostValue : "example.com";
    monitor.recordType = isNonEmptyString(recordTypeValue)
        ? recordTypeValue
        : "A";
    monitor.expectedValue = isNonEmptyString(expectedValueValue)
        ? expectedValueValue
        : "0.0.0.0";
}

/**
 * Applies type-specific field requirements and defaults based on monitor type.
 */
function applyTypeSpecificDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    switch (monitor.type) {
        case "dns": {
            applyDnsMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http": {
            applyHttpMonitorDefaults(monitor, filteredData);
            break;
        }
        case "ping": {
            applyPingMonitorDefaults(monitor, filteredData);
            break;
        }
        case "port": {
            applyPortMonitorDefaults(monitor, filteredData);
            break;
        }
        default: {
            // No type-specific defaults for unknown types
            break;
        }
    }
}

/**
 * Normalizes a partial monitor object into a complete Monitor instance.
 *
 * @remarks
 * This function takes a partial monitor configuration and ensures it has all
 * required fields with appropriate defaults, validates the data types, and
 * filters fields based on monitor type.
 *
 * @param monitor - Partial monitor data to normalize
 *
 * @returns Complete Monitor object with validated and normalized data
 *
 * @throws TypeError if monitor data is invalid or malformed
 *
 * @public
 */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe: Dynamic property access with runtime validation after filtering */
export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    // Validate input data
    validateMonitorInput(monitor);

    // Cast to unknown first to avoid strict type issues with Partial<Monitor>
    const monitorData = monitor as unknown as UnknownRecord;
    const finalizedType = validateMonitorType(monitorData["type"]);

    // Filter the monitor data to only include fields appropriate for this type
    const filteredMonitor = filterMonitorFieldsByType(monitor, finalizedType);

    // Cast filtered monitor for safe access
    const filteredData = filteredMonitor as unknown as UnknownRecord;

    // Generate a valid ID - handle empty strings as falsy
    const rawId = filteredData["id"] as string | undefined;
    const validId = isNonEmptyString(rawId) ? rawId : crypto.randomUUID();

    // Build base monitor object with guaranteed required fields
    const baseMonitor: Monitor = {
        activeOperations: Array.isArray(filteredData["activeOperations"])
            ? (filteredData["activeOperations"] as string[])
            : DEFAULT_MONITOR_CONFIG.activeOperations,
        checkInterval: safeInteger(
            filteredData["checkInterval"] as number | undefined,
            DEFAULT_MONITOR_CONFIG.checkInterval,
            5000
        ),
        history: Array.isArray(filteredData["history"])
            ? (filteredData["history"] as Monitor["history"])
            : DEFAULT_MONITOR_CONFIG.history,
        id: validId,
        monitoring:
            (filteredData["monitoring"] as boolean | undefined) ??
            DEFAULT_MONITOR_CONFIG.monitoring,
        responseTime:
            typeof filteredData["responseTime"] === "number"
                ? filteredData["responseTime"]
                : DEFAULT_MONITOR_CONFIG.responseTime,
        retryAttempts: safeInteger(
            filteredData["retryAttempts"] as number | undefined,
            DEFAULT_MONITOR_CONFIG.retryAttempts,
            0,
            10
        ),
        status:
            filteredData["status"] &&
            isMonitorStatus(filteredData["status"] as string)
                ? (filteredData["status"] as Monitor["status"])
                : DEFAULT_MONITOR_CONFIG.status,
        timeout: safeInteger(
            filteredData["timeout"] as number | undefined,
            DEFAULT_MONITOR_CONFIG.timeout,
            1000,
            300_000
        ),
        type: finalizedType,
    };

    // Apply type-specific defaults
    applyTypeSpecificDefaults(baseMonitor, filteredData);

    // Add optional fields that were provided and valid
    if (filteredData["lastChecked"] instanceof Date) {
        baseMonitor.lastChecked = filteredData["lastChecked"];
    }

    return baseMonitor;
}
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

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
    // Delegate to normalizeMonitor to avoid divergence in default/validation logic
    return normalizeMonitor(overrides);
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

    // Updates may be contaminated; rely on normalizeMonitor for sanitation instead of pre-validating which could throw
    const updatedMonitors = site.monitors.map((monitor) => {
        if (monitor.id !== monitorId) return monitor;

        // Always work with a normalized baseline to avoid undefined fields lingering
        const baseline = normalizeMonitor(monitor);
        try {
            // Ignore any id field in updates to preserve original monitor identity
            const restUpdates = { ...updates };
            delete (restUpdates as { id?: unknown }).id;
            const merged: Partial<Monitor> = {
                ...baseline,
                ...restUpdates,
                id: baseline.id,
            };
            return normalizeMonitor(merged);
        } catch (error) {
            // If updates are invalid, keep the baseline (already normalized) instead of possibly malformed original
            console.error(`Failed to update monitor ${monitorId}:`, error);
            return baseline;
        }
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
