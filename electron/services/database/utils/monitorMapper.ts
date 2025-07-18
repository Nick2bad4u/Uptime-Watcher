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
import { logger } from "../../../utils/logger";
import { generateSqlParameters, mapMonitorToRow, mapRowToMonitor } from "./dynamicSchema";
import { DbValue } from "./valueConverters";

/**
 * Monitor row interface for database operations.
 */
export interface MonitorRow {
    checkInterval: number;
    createdAt: number;
    enabled: boolean;
    id: string;
    lastChecked?: Date;
    lastError?: string;
    responseTime?: number;
    retryAttempts: number;
    siteIdentifier: string;
    status: Site["monitors"][0]["status"];
    timeout: number;
    type: Site["monitors"][0]["type"];
    updatedAt: number;
}

/**
 * Build parameter array for monitor insertion using dynamic schema.
 */
export function buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): DbValue[] {
    try {
        // Convert monitor to row format
        const monitorWithMetadata = {
            ...monitor,
            createdAt: Date.now(),
            enabled: monitor.monitoring,
            siteIdentifier,
            updatedAt: Date.now(),
        };

        const row = mapMonitorToRow(monitorWithMetadata);
        const { columns } = generateSqlParameters();

        // Return values in the same order as columns
        // eslint-disable-next-line sonarjs/function-return-type -- Returns DbValue which can be different types
        return columns.map((column): DbValue => {
            // eslint-disable-next-line security/detect-object-injection
            const value = row[column];
            if (value === undefined || value === null) {
                return null;
            }
            return value as DbValue;
        });
    } catch (error) {
        logger.error("[MonitorMapper] Failed to build monitor parameters", { error, monitor, siteIdentifier });
        throw error;
    }
}

/**
 * Validate that a row contains the minimum required fields for a monitor.
 *
 * @param row - Database row to validate
 * @returns True if row is valid
 *
 * @public
 */
export function isValidMonitorRow(row: Record<string, unknown>): boolean {
    return (
        row.id !== undefined &&
        row.site_identifier !== undefined &&
        row.type !== undefined &&
        typeof row.site_identifier === "string" &&
        typeof row.type === "string"
    );
}

/**
 * Convert multiple database rows to monitor objects.
 *
 * @param rows - Array of database rows
 * @returns Array of converted monitor objects
 *
 * @public
 */
export function rowsToMonitors(rows: Record<string, unknown>[]): Site["monitors"] {
    return rows.map((row) => rowToMonitor(row));
}

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
    try {
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
                    "checkInterval",
                    "createdAt",
                    "enabled",
                    "id",
                    "lastChecked",
                    "lastError",
                    "name",
                    "nextCheck",
                    "responseTime",
                    "retryAttempts",
                    "siteIdentifier",
                    "status",
                    "timeout",
                    "type",
                    "updatedAt",
                ].includes(key)
            ) {
                // eslint-disable-next-line security/detect-object-injection
                (monitor as unknown as Record<string, unknown>)[key] = value;
            }
        }

        return monitor;
    } catch (error) {
        logger.error("[MonitorMapper] Failed to map database row to monitor", { error, row });
        throw error;
    }
}

/**
 * Convert database row to monitor object or return undefined if not found.
 *
 * @param row - Database row data or undefined
 * @returns Converted monitor object or undefined
 *
 * @public
 */
export function rowToMonitorOrUndefined(row: Record<string, unknown> | undefined): Site["monitors"][0] | undefined {
    if (!row) {
        return undefined;
    }

    return rowToMonitor(row);
}
