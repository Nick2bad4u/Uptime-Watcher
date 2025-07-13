/**
 * Monitor data mapping utilities.
 *
 * @remarks
 * Handles conversion between database rows and application monitor objects.
 * Provides type-safe mapping with default value handling and validation.
 *
 * @packageDocumentation
 */

import { Site } from "../../../types";
import { convertDateForDb, DbValue, safeNumberConvert } from "./valueConverters";

/**
 * Database row representation of a monitor.
 *
 * @public
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
 *
 * @param row - Database row data
 * @returns Converted monitor object
 *
 * @remarks
 * Applies default values for missing fields and validates data types.
 * Boolean fields are converted from SQLite integer representation.
 *
 * @public
 */
export function rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
    const monitor: Site["monitors"][0] = {
        checkInterval: 300_000, // Default 5 minutes
        history: [], // History will be loaded separately
        id: row.id === undefined ? "-1" : String(row.id),
        monitoring: true, // Default to monitoring enabled
        responseTime: -1, // Default to never checked sentinel value
        retryAttempts: 3, // Default retry attempts
        status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
        timeout: 5000, // Default timeout
        type: typeof row.type === "string" ? row.type : "http",
    };

    // Override defaults with database values if they exist and are valid
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

        monitor.url ? String(monitor.url) : null,

        monitor.host ? String(monitor.host) : null,

        monitor.port === undefined ? null : Number(monitor.port),

        Number(monitor.checkInterval),

        Number(monitor.timeout),

        Number(monitor.retryAttempts),
        monitor.monitoring ? 1 : 0,
        monitor.status,
        Number(monitor.responseTime),
        convertDateForDb(monitor.lastChecked),
    ];
}
