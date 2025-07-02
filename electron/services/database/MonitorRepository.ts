/**
 * Database repository for monitor persistence and management.
 * Handles CRUD operations for site monitoring configurations.
 */

import { Database } from "node-sqlite3-wasm";

import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { DatabaseService } from "./DatabaseService";

/**
 * Type for database parameter values.
 */
type DbValue = string | number | null;

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
 * Repository for managing monitor data persistence.
 * Handles CRUD operations for monitors in the database.
 */
export class MonitorRepository {
    private readonly databaseService: DatabaseService;

    private static readonly GET_LATEST_MONITOR_ID_SQL =
        "SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1";

    constructor() {
        this.databaseService = DatabaseService.getInstance();
    }

    /**
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Safely convert a value to number or return undefined.
     */
    private safeNumberConvert(value: unknown): number | undefined {
        if (typeof value === "number") {
            return value;
        }
        if (value) {
            return Number(value);
        }
        return undefined;
    }

    /**
     * Convert a date-like value to ISO string or null for database storage.
     */
    private convertDateForDb(value: Date | string | null | undefined): string | null {
        if (!value) {
            // eslint-disable-next-line unicorn/no-null -- required for SQLite
            return null;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        return String(value);
    }

    /**
     * Add a string field to update arrays if the value is defined.
     */
    private addStringField(
        fieldName: string,
        value: string | undefined,
        updateFields: string[],
        updateValues: DbValue[]
    ): void {
        if (value !== undefined) {
            updateFields.push(`${fieldName} = ?`);
            // eslint-disable-next-line unicorn/no-null -- required for SQLite
            updateValues.push(value ? String(value) : null);
        }
    }

    /**
     * Add a number field to update arrays if the value is defined.
     */
    private addNumberField(
        fieldName: string,
        value: number | undefined,
        updateFields: string[],
        updateValues: DbValue[]
    ): void {
        if (value !== undefined) {
            updateFields.push(`${fieldName} = ?`);
            updateValues.push(Number(value));
        }
    }

    /**
     * Add a boolean field to update arrays if the value is defined.
     */
    private addBooleanField(
        fieldName: string,
        value: boolean | undefined,
        updateFields: string[],
        updateValues: DbValue[]
    ): void {
        if (value !== undefined) {
            updateFields.push(`${fieldName} = ?`);
            updateValues.push(value ? 1 : 0);
        }
    }

    /**
     * Build parameter array for monitor insertion.
     */
    private buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): DbValue[] {
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
            this.convertDateForDb(monitor.lastChecked),
        ];
    }

    /**
     * Insert a single monitor and return its new ID.
     */
    private insertSingleMonitor(siteIdentifier: string, monitor: Site["monitors"][0], db: Database): string {
        const parameters = this.buildMonitorParameters(siteIdentifier, monitor);

        db.run(
            `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            parameters
        );

        // Get the created monitor ID
        const result = db.get(MonitorRepository.GET_LATEST_MONITOR_ID_SQL, [siteIdentifier]);

        return result?.id ? String(result.id) : "";
    }

    /**
     * Convert database row to monitor object.
     */
    private rowToMonitor(row: Record<string, unknown>): Site["monitors"][0] {
        return {
            checkInterval: this.safeNumberConvert(row.checkInterval),
            history: [], // History will be loaded separately
            host: row.host !== undefined ? String(row.host) : undefined,
            id: row.id !== undefined ? String(row.id) : "-1",
            lastChecked:
                row.lastChecked && (typeof row.lastChecked === "string" || typeof row.lastChecked === "number")
                    ? new Date(row.lastChecked)
                    : undefined,
            monitoring: Boolean(row.monitoring),
            port: this.safeNumberConvert(row.port),
            responseTime: this.safeNumberConvert(row.responseTime),
            retryAttempts: this.safeNumberConvert(row.retryAttempts),
            status: typeof row.status === "string" ? (row.status as "up" | "down" | "pending") : "down",
            timeout: this.safeNumberConvert(row.timeout),
            type: typeof row.type === "string" ? (row.type as Site["monitors"][0]["type"]) : "http",
            url: row.url !== undefined ? String(row.url) : undefined,
        };
    }

    /**
     * Find all monitors for a specific site.
     */
    public async findBySiteIdentifier(siteIdentifier: string): Promise<Site["monitors"]> {
        try {
            const db = this.getDb();
            const monitorRows = db.all("SELECT * FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as Record<
                string,
                unknown
            >[];

            return monitorRows.map((row) => this.rowToMonitor(row));
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to fetch monitors for site: ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Find a monitor by its ID.
     */
    public async findById(monitorId: string): Promise<Site["monitors"][0] | undefined> {
        try {
            const db = this.getDb();
            const row = db.get("SELECT * FROM monitors WHERE id = ?", [monitorId]) as
                | Record<string, unknown>
                | undefined;

            if (!row) {
                return undefined;
            }

            return this.rowToMonitor(row);
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to fetch monitor with id: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Create a new monitor and return its ID.
     */
    public async create(siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): Promise<string> {
        try {
            const db = this.getDb();
            db.run(
                `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
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
                    monitor.status,
                    // eslint-disable-next-line unicorn/no-null
                    monitor.responseTime !== undefined ? Number(monitor.responseTime) : null,
                    // eslint-disable-next-line unicorn/no-null
                    monitor.lastChecked ? this.convertDateForDb(monitor.lastChecked) : null,
                ]
            );

            // Fetch the ID of the last inserted monitor
            const row = db.get(MonitorRepository.GET_LATEST_MONITOR_ID_SQL, [siteIdentifier]) as
                | { id: number }
                | undefined;

            if (!row || typeof row.id !== "number") {
                throw new Error(`Failed to fetch monitor id after insert for site ${siteIdentifier}`);
            }

            const newId = String(row.id);
            if (isDev()) {
                logger.debug(`[MonitorRepository] Created monitor with id: ${newId} for site: ${siteIdentifier}`);
            }
            return newId;
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to create monitor for site: ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Update an existing monitor.
     */
    public async update(monitorId: string, monitor: Partial<Site["monitors"][0]>): Promise<void> {
        try {
            const db = this.getDb();

            // Build dynamic SQL based on provided fields to avoid overwriting with defaults
            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            // Add fields using helper methods
            if (monitor.type !== undefined) {
                updateFields.push("type = ?");
                updateValues.push(monitor.type);
            }

            this.addStringField("url", monitor.url, updateFields, updateValues);
            this.addStringField("host", monitor.host, updateFields, updateValues);
            this.addNumberField("port", monitor.port, updateFields, updateValues);
            this.addNumberField("checkInterval", monitor.checkInterval, updateFields, updateValues);
            this.addNumberField("timeout", monitor.timeout, updateFields, updateValues);
            this.addNumberField("retryAttempts", monitor.retryAttempts, updateFields, updateValues);
            this.addBooleanField("monitoring", monitor.monitoring, updateFields, updateValues);

            if (monitor.status !== undefined) {
                updateFields.push("status = ?");
                updateValues.push(monitor.status);
            }

            this.addNumberField("responseTime", monitor.responseTime, updateFields, updateValues);

            if (monitor.lastChecked !== undefined) {
                updateFields.push("lastChecked = ?");
                const lastCheckedValue = this.convertDateForDb(monitor.lastChecked);
                updateValues.push(lastCheckedValue);
            }

            if (updateFields.length === 0) {
                if (isDev()) {
                    logger.debug(`[MonitorRepository] No fields to update for monitor: ${monitorId}`);
                }
                return;
            }

            updateValues.push(monitorId);

            const sql = `UPDATE monitors SET ${updateFields.join(", ")} WHERE id = ?`;
            db.run(sql, updateValues);

            if (isDev()) {
                logger.debug(`[MonitorRepository] Updated monitor with id: ${monitorId}`);
            }
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to update monitor with id: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Delete a monitor and its history.
     */
    public async delete(monitorId: string): Promise<boolean> {
        try {
            const db = this.getDb();

            // Delete history first (foreign key constraint)
            db.run("DELETE FROM history WHERE monitor_id = ?", [monitorId]);

            // Delete the monitor
            const result = db.run("DELETE FROM monitors WHERE id = ?", [monitorId]);
            const deleted = (result.changes ?? 0) > 0;

            if (deleted) {
                if (isDev()) {
                    logger.debug(`[MonitorRepository] Deleted monitor with id: ${monitorId}`);
                }
            } else {
                logger.warn(`[MonitorRepository] Monitor not found for deletion: ${monitorId}`);
            }

            return deleted;
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to delete monitor with id: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Delete all monitors for a specific site.
     */
    public async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        try {
            const db = this.getDb();

            // Get all monitor IDs for this site
            const monitorRows = db.all("SELECT id FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as Array<{
                id: number;
            }>;

            // Delete history for all monitors
            for (const row of monitorRows) {
                db.run("DELETE FROM history WHERE monitor_id = ?", [row.id]);
            }

            // Delete all monitors for this site
            db.run("DELETE FROM monitors WHERE site_identifier = ?", [siteIdentifier]);

            if (isDev()) {
                logger.debug(`[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`);
            }
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to delete monitors for site: ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Get all monitor IDs.
     */
    public async getAllMonitorIds(): Promise<Array<{ id: number }>> {
        try {
            const db = this.getDb();
            const rows = db.all("SELECT id FROM monitors") as Array<{ id: number }>;
            return rows;
        } catch (error) {
            logger.error("[MonitorRepository] Failed to fetch all monitor IDs", error);
            throw error;
        }
    }

    /**
     * Clear all monitors from the database.
     */
    public async deleteAll(): Promise<void> {
        try {
            const db = this.getDb();
            db.run("DELETE FROM monitors");
            if (isDev()) {
                logger.debug("[MonitorRepository] Cleared all monitors");
            }
        } catch (error) {
            logger.error("[MonitorRepository] Failed to clear all monitors", error);
            throw error;
        }
    }

    /**
     * Bulk create monitors (for import functionality).
     * Returns the created monitor with their new IDs.
     */
    public async bulkCreate(
        siteIdentifier: string,
        monitors: Array<Site["monitors"][0]>
    ): Promise<Array<Site["monitors"][0]>> {
        try {
            const db = this.getDb();
            const createdMonitors: Array<Site["monitors"][0]> = [];

            for (const monitor of monitors) {
                const newId = this.insertSingleMonitor(siteIdentifier, monitor, db);

                if (newId) {
                    const newMonitor = {
                        ...monitor,
                        id: newId,
                    };
                    createdMonitors.push(newMonitor);
                }
            }

            logger.info(`[MonitorRepository] Bulk created ${monitors.length} monitors for site: ${siteIdentifier}`);
            return createdMonitors;
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to bulk create monitors for site: ${siteIdentifier}`, error);
            throw error;
        }
    }
}
