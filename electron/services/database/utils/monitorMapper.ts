/**
 * Monitor data mapping utilities.
 *
 * @remarks
 * Handles conversion between database rows and application monitor objects.
 * Uses dynamic schema based on monitor type registry for extensible monitor types.
 *
 * @packageDocumentation
 */

import { Site } from "../../../types";
import { DbValue } from "./valueConverters";
import { mapRowToMonitor, mapMonitorToRow, generateSqlParameters } from "./dynamicSchema";

/**
 * Convert database row to monitor object using dynamic schema.
 *
 * @param row - Database row data
 * @returns Converted monitor object
 *
 * @remarks
 * Uses dynamic mapping based on monitor type registry.
 * Automatically handles all monitor type specific fields.
 *
 * @public
 */
export function rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
    const dynamicMonitor = mapRowToMonitor(row);

    // Convert to Site monitor format with defaults
    const monitor: Site["monitors"][0] = {
        checkInterval: Number(dynamicMonitor.checkInterval) || 300_000,
        history: [], // History will be loaded separately
        id:
            dynamicMonitor.id && (typeof dynamicMonitor.id === "string" || typeof dynamicMonitor.id === "number")
                ? String(dynamicMonitor.id)
                : "-1",
        monitoring: Boolean(dynamicMonitor.enabled),
        responseTime: Number(dynamicMonitor.responseTime) || (row.responseTime ? Number(row.responseTime) : -1),
        retryAttempts: Number(dynamicMonitor.retryAttempts) || 3,
        status: dynamicMonitor.status ? (dynamicMonitor.status as Site["monitors"][0]["status"]) : "down",
        timeout: Number(dynamicMonitor.timeout) || 5000,
        type: dynamicMonitor.type ? (dynamicMonitor.type as Site["monitors"][0]["type"]) : "http",
    };

    // Add lastChecked if available
    if (dynamicMonitor.lastChecked) {
        monitor.lastChecked = new Date(Number(dynamicMonitor.lastChecked));
    }

    // Copy all dynamic fields (monitor type specific fields)
    for (const [key, value] of Object.entries(dynamicMonitor)) {
        if (
            ![
                "id",
                "siteIdentifier",
                "name",
                "type",
                "enabled",
                "checkInterval",
                "timeout",
                "retryAttempts",
                "status",
                "lastChecked",
                "nextCheck",
                "responseTime",
                "lastError",
                "createdAt",
                "updatedAt",
            ].includes(key)
        ) {
            // eslint-disable-next-line security/detect-object-injection
            (monitor as unknown as Record<string, unknown>)[key] = value;
        }
    }

    return monitor;
}

/**
 * Build parameter array for monitor insertion using dynamic schema.
 */
export function buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): DbValue[] {
    // Convert monitor to row format
    const monitorWithMetadata = {
        ...monitor,
        siteIdentifier,
        enabled: monitor.monitoring,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    const row = mapMonitorToRow(monitorWithMetadata);
    const { columns } = generateSqlParameters();

    // Return values in the same order as columns
    return columns.map((column) => {
        // eslint-disable-next-line security/detect-object-injection
        const value = row[column];
        if (value === undefined || value === null) {
            return null;
        }
        return value as DbValue;
    });
}
