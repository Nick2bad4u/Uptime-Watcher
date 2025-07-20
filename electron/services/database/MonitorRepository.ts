/**
 * Database repository for monitor persistence and management.
 * Handles CRUD operations for site monitoring configurations.
 */

import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import { generateSqlParameters, mapMonitorToRow } from "./utils/dynamicSchema";
import { buildMonitorParameters, rowsToMonitors, rowToMonitorOrUndefined } from "./utils/monitorMapper";
import { addBooleanField, addNumberField, addStringField, convertDateForDb, DbValue } from "./utils/valueConverters";

/**
 * Repository for managing monitor data persistence.
 * Handles CRUD operations for monitors in the database.
 */
export interface MonitorRepositoryDependencies {
    databaseService: DatabaseService;
}

export class MonitorRepository {
    private readonly databaseService: DatabaseService;

    constructor(dependencies: MonitorRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk create monitors (for import functionality).
     * Returns the created monitor with their new IDs.
     * Uses transactions to ensure atomicity.
     */
    public async bulkCreate(siteIdentifier: string, monitors: Site["monitors"][0][]): Promise<Site["monitors"][0][]> {
        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic bulk create operation
                const createdMonitors: Site["monitors"][0][] = [];

                await this.databaseService.executeTransaction((db) => {
                    for (const monitor of monitors) {
                        // Use RETURNING clause to get the ID directly from the insert
                        const insertResult = db.get(
                            `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                             RETURNING id`,
                            buildMonitorParameters(siteIdentifier, monitor)
                        ) as undefined | { id: number };

                        if (insertResult && typeof insertResult.id === "number") {
                            const newMonitor = {
                                ...monitor,
                                id: String(insertResult.id),
                            };
                            createdMonitors.push(newMonitor);
                        }
                    }
                    return Promise.resolve();
                });

                logger.info(`[MonitorRepository] Bulk created ${monitors.length} monitors for site: ${siteIdentifier}`);
                return createdMonitors;
            },
            "monitor-bulk-create",
            undefined,
            { count: monitors.length, siteIdentifier }
        );
    }

    /**
     * Create a new monitor and return its ID.
     * Uses transactions to ensure atomicity.
     */
    public async create(siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): Promise<string> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();

                // Generate dynamic SQL and parameters
                const { columns, placeholders } = generateSqlParameters();
                const parameters = buildMonitorParameters(siteIdentifier, monitor as Site["monitors"][0]);

                const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;

                const insertResult = db.get(insertSql, parameters) as undefined | { id: number };

                if (!insertResult || typeof insertResult.id !== "number") {
                    throw new Error(`Failed to create monitor for site ${siteIdentifier} - no ID returned`);
                }

                const result = String(insertResult.id);

                if (isDev()) {
                    logger.debug(`[MonitorRepository] Created monitor with id: ${result} for site: ${siteIdentifier}`);
                }
                return Promise.resolve(result);
            },
            "monitor-create",
            undefined,
            { siteIdentifier, type: monitor.type }
        );
    }

    /**
     * Internal method to create a monitor within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public createInternal(db: Database, siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): string {
        // Generate dynamic SQL and parameters
        const { columns, placeholders } = generateSqlParameters();
        const parameters = buildMonitorParameters(siteIdentifier, monitor as Site["monitors"][0]);

        const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;

        const insertResult = db.get(insertSql, parameters) as undefined | { id: number };

        if (!insertResult || typeof insertResult.id !== "number") {
            throw new Error(`Failed to create monitor for site ${siteIdentifier} - no ID returned`);
        }

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Created monitor with id: ${insertResult.id} for site: ${siteIdentifier} (internal)`
            );
        }

        return String(insertResult.id);
    }

    /**
     * Delete a monitor and its history.
     * Uses a transaction to ensure atomicity.
     */
    public async delete(monitorId: string): Promise<boolean> {
        return withDatabaseOperation(
            () => {
                const db = this.databaseService.getDatabase();
                const result = this.deleteInternal(db, monitorId);

                if (result) {
                    if (isDev()) {
                        logger.debug(`[MonitorRepository] Deleted monitor with id: ${monitorId}`);
                    }
                } else {
                    logger.warn(`[MonitorRepository] Monitor not found for deletion: ${monitorId}`);
                }

                return Promise.resolve(result);
            },
            "monitor-delete",
            undefined,
            { monitorId }
        );
    }

    /**
     * Clear all monitors from the database.
     * Uses transactions to ensure atomicity.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(() => {
            const db = this.databaseService.getDatabase();
            this.deleteAllInternal(db);
            return Promise.resolve();
        }, "monitor-delete-all");
    }

    /**
     * Internal method to clear all monitors from the database within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run("DELETE FROM monitors");
        logger.debug("[MonitorRepository] Cleared all monitors (internal)");
    }

    /**
     * Delete all monitors for a specific site.
     * Uses a transaction to ensure atomicity.
     */
    public async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        return withDatabaseOperation(
            () => {
                const db = this.databaseService.getDatabase();
                this.deleteBySiteIdentifierInternal(db, siteIdentifier);

                if (isDev()) {
                    logger.debug(`[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`);
                }
                return Promise.resolve();
            },
            "monitor-delete-by-site",
            undefined,
            { siteIdentifier }
        );
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
     * Internal method to delete a monitor and its history within an existing transaction.
     * This method should be called from within a database transaction.
     */
    public deleteInternal(db: Database, monitorId: string): boolean {
        // Delete history first (foreign key constraint)
        db.run("DELETE FROM history WHERE monitor_id = ?", [monitorId]);

        // Delete the monitor
        const deleteResult = db.run("DELETE FROM monitors WHERE id = ?", [monitorId]);
        return deleteResult.changes > 0;
    }

    /**
     * Find a monitor by its identifier with resilient error handling.
     */
    public async findByIdentifier(monitorId: string): Promise<Site["monitors"][0] | undefined> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                const row = db.get("SELECT * FROM monitors WHERE id = ?", [monitorId]) as
                    | Record<string, unknown>
                    | undefined;

                return Promise.resolve(rowToMonitorOrUndefined(row));
            },
            "monitor-lookup",
            undefined,
            { monitorId }
        );
    }

    /**
     * Find all monitors for a specific site.
     */
    public async findBySiteIdentifier(siteIdentifier: string): Promise<Site["monitors"]> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return withDatabaseOperation(async () => {
            const db = this.getDb();
            const monitorRows = db.all("SELECT * FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as Record<
                string,
                unknown
            >[];

            return rowsToMonitors(monitorRows);
        }, `find-monitors-by-site-${siteIdentifier}`);
    }

    /**
     * Get all monitor IDs.
     */
    public async getAllMonitorIds(): Promise<{ id: number }[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const rows = db.all("SELECT id FROM monitors") as { id: number }[];
            return Promise.resolve(rows);
        }, "monitor-get-all-ids");
    }

    /**
     * Update an existing monitor.
     * Uses transactions to ensure atomicity.
     */
    public async update(monitorId: string, monitor: Partial<Site["monitors"][0]>): Promise<void> {
        return withDatabaseOperation(
            () => {
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

                // monitor.responseTime is always a number, so no need for unnecessary conditional
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
                    return Promise.resolve();
                }

                updateValues.push(monitorId);

                const sql = `UPDATE monitors SET ${updateFields.join(", ")} WHERE id = ?`;
                db.run(sql, updateValues);

                if (isDev()) {
                    logger.debug(`[MonitorRepository] Updated monitor with id: ${monitorId}`);
                }

                return Promise.resolve();
            },
            "monitor-update",
            undefined,
            { monitorId }
        );
    }

    /**
     * Update an existing monitor (internal version for use within existing transactions).
     * Does not create its own transaction.
     */
    /**
     * Update an existing monitor (internal version for use within existing transactions).
     * Does not create its own transaction.
     */
    public updateInternal(db: Database, monitorId: string, monitor: Partial<Site["monitors"][0]>): void {
        if (isDev()) {
            logger.debug(`[MonitorRepository] updateInternal called with monitorId: ${monitorId}, monitor:`, monitor);
        }

        // Use dynamic row mapping to convert camelCase to snake_case
        const row = mapMonitorToRow(monitor as Record<string, unknown>);

        if (isDev()) {
            logger.debug(`[MonitorRepository] mapMonitorToRow result:`, row);
        }

        const { updateFields, updateValues } = this.buildUpdateFieldsAndValues(row, monitor);

        if (updateFields.length === 0) {
            if (isDev()) {
                logger.debug(`[MonitorRepository] No fields to update for monitor: ${monitorId} (internal)`);
            }
            return;
        }

        this.executeUpdateQuery(db, updateFields, updateValues, monitorId);
    }

    /**
     * Builds the update fields and values for the monitor update query.
     */
    private buildUpdateFieldsAndValues(
        row: Record<string, unknown>,
        monitor: Partial<Site["monitors"][0]>
    ): { updateFields: string[]; updateValues: DbValue[] } {
        const updateFields: string[] = [];
        const updateValues: DbValue[] = [];

        // Only update fields that are actually provided and are primitive types
        for (const [key, value] of Object.entries(row)) {
            if (value !== undefined && value !== null) {
                // Skip 'enabled' field if monitoring state wasn't provided in the original monitor object
                // This prevents status updates from accidentally disabling monitoring
                if (this.shouldSkipEnabledField(key, monitor)) {
                    continue;
                }

                // Ensure we only bind primitive types that SQLite can handle
                const fieldValue = this.convertValueForDatabase(key, value);
                if (fieldValue !== null) {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(fieldValue);
                }
            }
        }

        return { updateFields, updateValues };
    }

    /**
     * Converts a value to the appropriate database format.
     */
    // eslint-disable-next-line sonarjs/function-return-type -- Function returns different types based on input type
    private convertValueForDatabase(key: string, value: unknown): DbValue | null {
        if (typeof value === "string" || typeof value === "number") {
            return value;
        }
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        }

        if (isDev()) {
            logger.warn(`[MonitorRepository] Skipping non-primitive field ${key} with value:`, value);
        }
        return null;
    }

    /**
     * Executes the update query with the given fields and values.
     */
    private executeUpdateQuery(db: Database, updateFields: string[], updateValues: DbValue[], monitorId: string): void {
        updateValues.push(monitorId);
        const sql = `UPDATE monitors SET ${updateFields.join(", ")} WHERE id = ?`;

        if (isDev()) {
            logger.debug(`[MonitorRepository] Executing SQL: ${sql} with values:`, updateValues);
        }

        db.run(sql, updateValues);

        if (isDev()) {
            logger.debug(`[MonitorRepository] Updated monitor with id: ${monitorId} (internal)`);
        }
    }

    /**
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Checks if the 'enabled' field should be skipped during update.
     */
    private shouldSkipEnabledField(key: string, monitor: Partial<Site["monitors"][0]>): boolean {
        if (key === "enabled" && !("monitoring" in monitor) && !("enabled" in monitor)) {
            if (isDev()) {
                logger.debug(`[MonitorRepository] Skipping 'enabled' field - monitoring state not provided in update`);
            }
            return true;
        }
        return false;
    }
}
