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
    const monitor: Site["monitors"][0] = {
        history: [], // History will be loaded separately
        id: row.id !== undefined ? String(row.id) : "-1",
        status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
        type: typeof row.type === "string" ? (row.type as Site["monitors"][0]["type"]) : "http",
    };

    // Add optional properties only if they have valid values
    const checkInterval = safeNumberConvert(row.checkInterval);
    if (checkInterval !== undefined) {
        monitor.checkInterval = checkInterval;
    }

    if (row.host !== undefined && row.host !== null) {
        monitor.host = String(row.host);
    }

    if (row.lastChecked && (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")) {
        monitor.lastChecked = new Date(row.lastChecked);
    }

    if (row.monitoring !== undefined) {
        monitor.monitoring = Boolean(row.monitoring);
    }

    const port = safeNumberConvert(row.port);
    if (port !== undefined) {
        monitor.port = port;
    }

    const responseTime = safeNumberConvert(row.responseTime);
    if (responseTime !== undefined) {
        monitor.responseTime = responseTime;
    }

    const retryAttempts = safeNumberConvert(row.retryAttempts);
    if (retryAttempts !== undefined) {
        monitor.retryAttempts = retryAttempts;
    }

    const timeout = safeNumberConvert(row.timeout);
    if (timeout !== undefined) {
        monitor.timeout = timeout;
    }

    if (row.url !== undefined && row.url !== null) {
        monitor.url = String(row.url);
    }

    return monitor;
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
