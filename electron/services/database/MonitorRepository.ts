/**
 * @public
 * Database repository for monitor persistence and management.
 * Handles CRUD operations for site monitoring configurations.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for consistency and error handling.
 */

import { Database } from "node-sqlite3-wasm";

import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import { generateSqlParameters, mapMonitorToRow } from "./utils/dynamicSchema";
import { buildMonitorParameters, rowsToMonitors, rowToMonitorOrUndefined } from "./utils/monitorMapper";
import { DbValue } from "./utils/valueConverters";

/**
 * @public
 * Repository dependencies for managing monitor data persistence.
 *
 * @remarks
 * Provides the required database service for monitor operations.
 */
export interface MonitorRepositoryDependencies {
    /** Database service for transactional operations. */
    databaseService: DatabaseService;
}

/**
 * @public
 * Repository for managing monitor data persistence.
 * Handles CRUD operations for monitors in the database.
 *
 * @remarks
 * All operations are wrapped in transactions and use the repository pattern for consistency and error handling.
 */
export class MonitorRepository {
    private readonly databaseService: DatabaseService;

    /**
     * Constructs a new MonitorRepository instance.
     *
     * @param dependencies - The required dependencies for monitor operations.
     * @example
     * ```typescript
     * const repo = new MonitorRepository({ databaseService });
     * ```
     */
    constructor(dependencies: MonitorRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk creates monitors (for import functionality).
     * Returns the created monitors with their new IDs.
     * Uses transactions to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier to associate monitors with.
     * @param monitors - Array of monitor configuration objects to create.
     * @returns Promise resolving to array of created monitors with IDs.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.bulkCreate("site-123", monitorsArray);
     * ```
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
                        ) as Record<string, unknown> | undefined;

                        // Enhanced type safety validation
                        if (!insertResult || typeof insertResult !== "object") {
                            throw new Error("Failed to create monitor: invalid database response");
                        }
                        if (!("id" in insertResult) || typeof insertResult.id !== "number" || insertResult.id <= 0) {
                            throw new Error("Failed to create monitor: invalid or missing ID in database response");
                        }

                        const newMonitor = {
                            ...monitor,
                            id: String(insertResult.id),
                        };
                        createdMonitors.push(newMonitor);
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
     * Creates a new monitor and returns its ID.
     * Uses transactions to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier to associate the monitor with.
     * @param monitor - Monitor configuration data (without ID).
     * @returns Promise resolving to the created monitor ID as string.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const id = await repo.create("site-123", monitorObj);
     * ```
     */
    public async create(siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): Promise<string> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    return Promise.resolve(this.createInternal(db, siteIdentifier, monitor));
                });
            },
            "monitor-create",
            undefined,
            { siteIdentifier, type: monitor.type }
        );
    }

    /**
     * Internal method to create a monitor within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param siteIdentifier - Site identifier to associate monitor with.
     * @param monitor - Monitor configuration data (without ID).
     * @returns Generated monitor ID as string.
     * @throws {@link Error} When monitor creation fails or returns invalid ID.
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     * Uses enhanced type safety validation to prevent silent failures from schema changes.
     */
    public createInternal(db: Database, siteIdentifier: string, monitor: Omit<Site["monitors"][0], "id">): string {
        // Generate dynamic SQL and parameters
        const { columns, placeholders } = generateSqlParameters();
        const parameters = buildMonitorParameters(siteIdentifier, monitor as Site["monitors"][0]);

        const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;

        const insertResult = db.get(insertSql, parameters) as Record<string, unknown> | undefined;

        // Enhanced type safety validation
        if (!insertResult || typeof insertResult !== "object") {
            throw new Error(`Failed to create monitor for site ${siteIdentifier}: invalid database response`);
        }
        if (!("id" in insertResult) || typeof insertResult.id !== "number" || insertResult.id <= 0) {
            throw new Error(
                `Failed to create monitor for site ${siteIdentifier}: invalid or missing ID in database response`
            );
        }

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Created monitor with id: ${insertResult.id} for site: ${siteIdentifier} (internal)`
            );
        }

        return String(insertResult.id);
    }

    /**
     * Deletes a monitor and its history.
     * Uses a transaction to ensure atomicity.
     *
     * @param monitorId - The monitor ID to delete.
     * @returns Promise resolving to true if deleted, false otherwise.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const deleted = await repo.delete("monitor-123");
     * ```
     */
    public async delete(monitorId: string): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    const result = this.deleteInternal(db, monitorId);

                    if (result) {
                        if (isDev()) {
                            logger.debug(`[MonitorRepository] Deleted monitor with id: ${monitorId}`);
                        }
                    } else {
                        logger.warn(`[MonitorRepository] Monitor not found for deletion: ${monitorId}`);
                    }

                    return Promise.resolve(result);
                });
            },
            "monitor-delete",
            undefined,
            { monitorId }
        );
    }

    /**
     * Clears all monitors from the database.
     * Uses transactions to ensure atomicity.
     *
     * @returns A promise that resolves when all monitors are deleted.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.deleteAll();
     * ```
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.deleteAllInternal(db);
                return Promise.resolve();
            });
        }, "monitor-delete-all");
    }

    /**
     * Internal method to clear all monitors from the database within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @returns void
     * @remarks
     * Use this method when you're already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run("DELETE FROM monitors");
        logger.debug("[MonitorRepository] Cleared all monitors (internal)");
    }

    /**
     * Deletes all monitors for a specific site.
     * Uses a transaction to ensure atomicity.
     *
     * @param siteIdentifier - The site identifier to delete monitors for.
     * @returns A promise that resolves when all monitors are deleted for the site.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.deleteBySiteIdentifier("site-123");
     * ```
     */
    public async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.deleteBySiteIdentifierInternal(db, siteIdentifier);

                    if (isDev()) {
                        logger.debug(`[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`);
                    }
                    return Promise.resolve();
                });
            },
            "monitor-delete-by-site",
            undefined,
            { siteIdentifier }
        );
    }

    /**
     * Internal method to delete all monitors for a specific site within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param siteIdentifier - The site identifier to delete monitors for.
     * @returns void
     * @remarks
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
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to delete.
     * @returns True if deleted, false otherwise.
     * @remarks
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
     * Finds a monitor by its identifier with resilient error handling.
     *
     * @param monitorId - The monitor ID to find.
     * @returns Promise resolving to the monitor object or undefined if not found.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const monitor = await repo.findByIdentifier("monitor-123");
     * ```
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
     * Finds all monitors for a specific site.
     *
     * @param siteIdentifier - Site identifier to find monitors for.
     * @returns Promise resolving to array of monitors for the site.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const monitors = await repo.findBySiteIdentifier("site-123");
     * ```
     */
    public async findBySiteIdentifier(siteIdentifier: string): Promise<Site["monitors"]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const monitorRows = db.all("SELECT * FROM monitors WHERE site_identifier = ?", [siteIdentifier]) as Record<
                string,
                unknown
            >[];

            return Promise.resolve(rowsToMonitors(monitorRows));
        }, `find-monitors-by-site-${siteIdentifier}`);
    }

    /**
     * Gets all monitor IDs.
     *
     * @returns Promise resolving to array of monitor ID objects.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const ids = await repo.getAllMonitorIds();
     * ```
     */
    public async getAllMonitorIds(): Promise<{ id: number }[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const rows = db.all("SELECT id FROM monitors") as { id: number }[];
            return Promise.resolve(rows);
        }, "monitor-get-all-ids");
    }

    /**
     * Updates an existing monitor.
     * Uses transactions to ensure atomicity.
     *
     * @param monitorId - The monitor ID to update.
     * @param monitor - Partial monitor configuration data to update.
     * @returns A promise that resolves when the monitor is updated.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.update("monitor-123", { checkInterval: 60000 });
     * ```
     */
    public async update(monitorId: string, monitor: Partial<Site["monitors"][0]>): Promise<void> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.updateInternal(db, monitorId, monitor);
                    return Promise.resolve();
                });
            },
            "monitor-update",
            undefined,
            { monitorId }
        );
    }

    /**
     * Internal method to update an existing monitor within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to update.
     * @param monitor - Partial monitor configuration data to update.
     * @returns void
     * @throws If the update query fails.
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     *
     * **Field Mapping Logic:**
     * Converts camelCase field names to snake_case database columns using dynamic mapping.
     * Only updates fields that are provided and are primitive types (string, number, boolean).
     *
     * **Domain-Specific Behavior**:
     * The 'enabled' field is automatically derived from 'monitoring' state per domain contract.
     * If neither 'monitoring' nor 'enabled' are provided, the 'enabled' field is skipped
     * to preserve the current monitoring state (see shouldSkipMonitoringFields).
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
                // Skip monitoring-related fields based on domain logic
                // This prevents status updates from accidentally changing monitoring state
                if (this.shouldSkipMonitoringFields(key, monitor)) {
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
     *
     * @param key - Field name for logging purposes
     * @param value - Value to convert for database storage
     * @returns Database-compatible value or null if conversion not possible
     *
     * @remarks
     * **Type Conversion Logic**:
     * - Strings and numbers: passed through unchanged
     * - Booleans: converted to 1 (true) or 0 (false) for SQLite compatibility
     * - Other types: logged as warning and returned as null (skipped)
     */
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
     * Get the database instance for internal repository operations.
     *
     * @returns Database connection from the DatabaseService
     * @throws {@link Error} When database is not initialized
     *
     * @remarks
     * **Usage Pattern**: Only used for read operations and internal methods.
     * All mutations must use executeTransaction() for proper transaction management.
     * Caller must ensure DatabaseService.initialize() was called first.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Checks if monitoring-related fields should be skipped during update.
     *
     * @param key - Database field name to check
     * @param monitor - Monitor update data being processed
     * @returns True if the field should be skipped, false otherwise
     *
     * @remarks
     * **Domain Logic**: The 'enabled' field is automatically derived from 'monitoring' state.
     * If neither 'monitoring' nor 'enabled' are provided in the update, the 'enabled' field
     * should be skipped to preserve the current monitoring state.
     *
     * **Referenced in Domain Event Contract**: Monitor state transitions must preserve
     * monitoring status unless explicitly changed.
     */
    private shouldSkipMonitoringFields(key: string, monitor: Partial<Site["monitors"][0]>): boolean {
        if (key === "enabled" && !("monitoring" in monitor) && !("enabled" in monitor)) {
            if (isDev()) {
                logger.debug(`[MonitorRepository] Skipping 'enabled' field - monitoring state not provided in update`);
            }
            return true;
        }
        return false;
    }
}
