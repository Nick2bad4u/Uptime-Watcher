/**
 * Database repository for monitor persistence and management.
 * Handles CRUD operations for site monitoring configurations.
 */

import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/index";
import { DatabaseService } from "./DatabaseService";
import {
    addBooleanField,
    addNumberField,
    addStringField,
    buildMonitorParameters,
    convertDateForDb,
    DbValue,
    rowToMonitor,
} from "./utils";

/**
 * Repository for managing monitor data persistence.
 * Handles CRUD operations for monitors in the database.
 */
export class MonitorRepository {
    private readonly databaseService: DatabaseService;

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
     * Find all monitors for a specific site.
     */
    public findBySiteIdentifier(siteIdentifier: string): Site["monitors"] {
        try {
            const db = this.getDb();
            const monitorRows = db.all("SELECT * FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as Record<
                string,
                unknown
            >[];

            return monitorRows.map((row) => rowToMonitor(row));
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to fetch monitors for site: ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Find a monitor by its ID.
     */
    public findById(monitorId: string): Site["monitors"][0] | undefined {
        try {
            const db = this.getDb();
            const row = db.get("SELECT * FROM monitors WHERE id = ?", [monitorId]) as
                | Record<string, unknown>
                | undefined;

            if (!row) {
                return undefined;
            }

            return rowToMonitor(row);
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to fetch monitor with id: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Create a new monitor and return its ID.
     * Fixed to use RETURNING clause to avoid race conditions.
     */
    public create(siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): string {
        try {
            const db = this.getDb();

            // Use RETURNING clause to get the ID directly from the insert
            const result = db.get(
                `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                 RETURNING id`,
                [
                    siteIdentifier,
                    monitor.type,

                    monitor.url ? String(monitor.url) : null,

                    monitor.host ? String(monitor.host) : null,

                    monitor.port !== undefined ? Number(monitor.port) : null,

                    monitor.checkInterval !== undefined ? Number(monitor.checkInterval) : null,

                    monitor.timeout !== undefined ? Number(monitor.timeout) : null,

                    monitor.retryAttempts !== undefined ? Number(monitor.retryAttempts) : null,
                    monitor.monitoring ? 1 : 0,
                    monitor.status,

                    monitor.responseTime !== undefined ? Number(monitor.responseTime) : null,

                    monitor.lastChecked ? convertDateForDb(monitor.lastChecked) : null,
                ]
            ) as { id: number } | undefined;

            if (!result || typeof result.id !== "number") {
                throw new Error(`Failed to create monitor for site ${siteIdentifier} - no ID returned`);
            }

            const newId = String(result.id);
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
    public update(monitorId: string, monitor: Partial<Site["monitors"][0]>): void {
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

            addStringField("url", monitor.url, updateFields, updateValues);
            addStringField("host", monitor.host, updateFields, updateValues);
            addNumberField("port", monitor.port, updateFields, updateValues);
            addNumberField("checkInterval", monitor.checkInterval, updateFields, updateValues);
            addNumberField("timeout", monitor.timeout, updateFields, updateValues);
            addNumberField("retryAttempts", monitor.retryAttempts, updateFields, updateValues);
            addBooleanField("monitoring", monitor.monitoring, updateFields, updateValues);

            if (monitor.status !== undefined) {
                updateFields.push("status = ?");
                updateValues.push(monitor.status);
            }

            addNumberField("responseTime", monitor.responseTime, updateFields, updateValues);

            if (monitor.lastChecked !== undefined) {
                updateFields.push("lastChecked = ?");
                const lastCheckedValue = convertDateForDb(monitor.lastChecked);
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
     * Uses a transaction to ensure atomicity.
     */
    public async delete(monitorId: string): Promise<boolean> {
        try {
            const result = await this.databaseService.executeTransaction(async (db) => {
                const deleted = this.deleteInternal(db, monitorId);
                return Promise.resolve(deleted);
            });

            if (result) {
                if (isDev()) {
                    logger.debug(`[MonitorRepository] Deleted monitor with id: ${monitorId}`);
                }
            } else {
                logger.warn(`[MonitorRepository] Monitor not found for deletion: ${monitorId}`);
            }

            return result;
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to delete monitor with id: ${monitorId}`, error);
            throw error;
        }
    }

    /**
     * Internal method to delete a monitor and its history within an existing transaction.
     * This method should be called from within a database transaction.
     */
    private deleteInternal(db: Database, monitorId: string): boolean {
        // Delete history first (foreign key constraint)
        db.run("DELETE FROM history WHERE monitor_id = ?", [monitorId]);

        // Delete the monitor
        const deleteResult = db.run("DELETE FROM monitors WHERE id = ?", [monitorId]);
        return (deleteResult.changes ?? 0) > 0;
    }

    /**
     * Public internal method to delete a monitor within an existing transaction.
     * This method should be called from within a database transaction.
     */
    public deleteMonitorInternal(db: Database, monitorId: string): boolean {
        return this.deleteInternal(db, monitorId);
    }

    /**
     * Delete all monitors for a specific site.
     * Uses a transaction to ensure atomicity.
     */
    public async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        try {
            await this.databaseService.executeTransaction(async (db) => {
                this.deleteBySiteIdentifierInternal(db, siteIdentifier);
                return Promise.resolve();
            });

            if (isDev()) {
                logger.debug(`[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`);
            }
        } catch (error) {
            logger.error(`[MonitorRepository] Failed to delete monitors for site: ${siteIdentifier}`, error);
            throw error;
        }
    }

    /**
     * Internal method to delete all monitors for a specific site within an existing transaction.
     * This method should be called from within a database transaction.
     */
    public deleteBySiteIdentifierInternal(db: Database, siteIdentifier: string): void {
        // Get all monitor IDs for this site
        const monitorRows = db.all("SELECT id FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as {
            id: number;
        }[];

        // Delete history for all monitors
        for (const row of monitorRows) {
            db.run("DELETE FROM history WHERE monitor_id = ?", [row.id]);
        }

        // Delete all monitors for this site
        db.run("DELETE FROM monitors WHERE site_identifier = ?", [siteIdentifier]);
    }

    /**
     * Get all monitor IDs.
     */
    public getAllMonitorIds(): { id: number }[] {
        try {
            const db = this.getDb();
            const rows = db.all("SELECT id FROM monitors") as { id: number }[];
            return rows;
        } catch (error) {
            logger.error("[MonitorRepository] Failed to fetch all monitor IDs", error);
            throw error;
        }
    }

    /**
     * Clear all monitors from the database.
     */
    public deleteAll(): void {
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
     * Fixed to use RETURNING clause to avoid race conditions.
     */
    public bulkCreate(siteIdentifier: string, monitors: Site["monitors"][0][]): Site["monitors"][0][] {
        try {
            const db = this.getDb();
            const createdMonitors: Site["monitors"][0][] = [];

            for (const monitor of monitors) {
                // Use RETURNING clause to get the ID directly from the insert
                const result = db.get(
                    `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                     RETURNING id`,
                    buildMonitorParameters(siteIdentifier, monitor)
                ) as { id: number } | undefined;

                if (result && typeof result.id === "number") {
                    const newMonitor = {
                        ...monitor,
                        id: String(result.id),
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
