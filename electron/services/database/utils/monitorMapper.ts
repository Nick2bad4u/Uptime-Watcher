/**
 * Monitor data mapping utilities.
 * Handles conversion between database rows and application monitor objects.
 */

import { Site } from "../../../types";
import { convertDateForDb, DbValue, safeNumberConvert } from "./valueConverters";

/**
 * Database row representation of a monitor.
 */
export interface MonitorRow {
    id: number;
    site_identifier: string;
    type: string;
    url?: string;
    host?: string;
    port?: number;
    checkInterval?: number;
    timeout?: number;
    retryAttempts?: number;
    monitoring: boolean;
    status: string;
    responseTime?: number;
    lastChecked?: string;
}

/**
 * Convert database row to monitor object.
 */
export function rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
    return {
        checkInterval: safeNumberConvert(row.checkInterval),
        history: [], // History will be loaded separately
        host: row.host !== undefined ? String(row.host) : undefined,
        id: row.id !== undefined ? String(row.id) : "-1",
        lastChecked:
            row.lastChecked && (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                ? new Date(row.lastChecked)
                : undefined,
        monitoring: Boolean(row.monitoring),
        port: safeNumberConvert(row.port),
        responseTime: safeNumberConvert(row.responseTime),
        retryAttempts: safeNumberConvert(row.retryAttempts),
        status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
        timeout: safeNumberConvert(row.timeout),
        type: typeof row.type === "string" ? (row.type as Site["monitors"][0]["type"]) : "http",
        url: row.url !== undefined ? String(row.url) : undefined,
    };
}

/**
 * Build parameter array for monitor insertion.
 */
export function buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): DbValue[] {
    return [
        siteIdentifier,
        monitor.type,
        // eslint-disable-next-line unicorn/no-null
        monitor.url ? String(monitor.url) : null,
        // eslint-disable-next-line unicorn/no-null
        monitor.host ? String(monitor.host) : null,
        // eslint-disable-next-line unicorn/no-null
        monitor.port !== undefined ? Number(monitor.port) : null,
        // eslint-disable-next-line unicorn/no-null
        monitor.checkInterval !== undefined ? Number(monitor.checkInterval) : null,
        // eslint-disable-next-line unicorn/no-null
        monitor.timeout !== undefined ? Number(monitor.timeout) : null,
        // eslint-disable-next-line unicorn/no-null
        monitor.retryAttempts !== undefined ? Number(monitor.retryAttempts) : null,
        monitor.monitoring ? 1 : 0,
        monitor.status || "down",
        // eslint-disable-next-line unicorn/no-null
        monitor.responseTime !== undefined ? Number(monitor.responseTime) : null,
        convertDateForDb(monitor.lastChecked),
    ];
}
