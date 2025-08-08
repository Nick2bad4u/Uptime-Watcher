/**
 * Database repository for monitor persistence and management.
 *
 * @remarks
 * Handles CRUD operations for site monitoring configurations using the repository pattern.
 * All operations are wrapped in transactions and use the DatabaseService for transaction management.
 * All mutations are atomic to ensure data consistency and proper error handling.
 *
 * @public
 */
import type { Database } from "node-sqlite3-wasm";

import type { MonitorRow } from "../../../shared/types/database";
import type { Monitor, Site } from "../../types";
import type { DatabaseService } from "./DatabaseService";
import type { DbValue } from "./utils/valueConverters";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { generateSqlParameters, mapMonitorToRow } from "./utils/dynamicSchema";
import {
    buildMonitorParameters,
    rowsToMonitors,
    rowToMonitorOrUndefined,
} from "./utils/monitorMapper";

/**
 * Repository dependencies for managing monitor data persistence.
 *
 * @remarks
 * Provides the required database service for monitor operations.
 * Used for dependency injection pattern to ensure proper service coupling.
 *
 * @public
 */
export interface MonitorRepositoryDependencies {
    /**
     * Database service for transactional operations.
     *
     * @remarks
     * Must be properly initialized before being passed to the repository.
     */
    databaseService: DatabaseService;
}

/**
 * Common SQL queries for monitor persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant is internal to the repository and not exported.
 * @internal
 */
const MONITOR_QUERIES = {
    DELETE_ALL: "DELETE FROM monitors",
    DELETE_BY_ID: "DELETE FROM monitors WHERE id = ?",
    DELETE_BY_SITE: "DELETE FROM monitors WHERE site_identifier = ?",
    DELETE_HISTORY_BY_MONITOR: "DELETE FROM history WHERE monitor_id = ?",
    INSERT_WITH_RETURNING: `INSERT INTO monitors (site_identifier, type, url, host, port, checkInterval, timeout, retryAttempts, monitoring, status, responseTime, lastChecked) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                           RETURNING id`,
    SELECT_ALL_IDS: "SELECT id FROM monitors",
    SELECT_BY_ID: "SELECT * FROM monitors WHERE id = ?",
    SELECT_BY_SITE: "SELECT * FROM monitors WHERE site_identifier = ?",
    SELECT_IDS_BY_SITE: "SELECT id FROM monitors WHERE site_identifier = ?",
    UPDATE_STATUS:
        "UPDATE monitors SET status = ?, responseTime = ?, lastChecked = ? WHERE id = ?",
} as const;

/**
 * @public
 * Repository for managing monitor data persistence.
 *
 * @remarks
 * Handles all CRUD operations for monitors in the database using the repository pattern.
 * All mutations are wrapped in transactions for consistency and error handling.
 * All operations use the DatabaseService for transaction management and maintain atomicity.
 */
export class MonitorRepository {
    /** @internal */
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
    public constructor(dependencies: MonitorRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk creates monitors for a site.
     *
     * @param siteIdentifier - The site identifier to associate monitors with.
     * @param monitors - Array of monitor configuration objects to create.
     * @returns Promise resolving to array of created monitors with IDs.
     * @throws Error if the database operation fails or monitor creation fails.
     * @remarks
     * Uses a transaction for atomicity. Each monitor is inserted and its ID is returned.
     * @example
     * ```typescript
     * await repo.bulkCreate("site-123", monitorsArray);
     * ```
     */
    public async bulkCreate(
        siteIdentifier: string,
        monitors: Array<Site["monitors"][0]>
    ): Promise<Array<Site["monitors"][0]>> {
        return withDatabaseOperation(
            async () => {
                // Use executeTransaction for atomic bulk create operation
                const createdMonitors: Array<Site["monitors"][0]> = [];

                await this.databaseService.executeTransaction((db) => {
                    for (const monitor of monitors) {
                        // Use RETURNING clause to get the ID directly from the insert
                        const insertResult = db.get(
                            MONITOR_QUERIES.INSERT_WITH_RETURNING,
                            buildMonitorParameters(siteIdentifier, monitor)
                        ) as Record<string, unknown> | undefined;

                        // Enhanced type safety validation
                        if (!insertResult || typeof insertResult !== "object") {
                            throw new Error(
                                "Failed to create monitor: invalid database response"
                            );
                        }
                        if (
                            !("id" in insertResult) ||
                            typeof insertResult["id"] !== "number" ||
                            insertResult["id"] <= 0
                        ) {
                            throw new Error(
                                "Failed to create monitor: invalid or missing ID in database response"
                            );
                        }

                        const newMonitor = {
                            ...monitor,
                            id: String(insertResult["id"]),
                        };
                        createdMonitors.push(newMonitor);
                    }
                    return Promise.resolve();
                });

                logger.info(
                    `[MonitorRepository] Bulk created ${monitors.length} monitors for site: ${siteIdentifier}`
                );
                return createdMonitors;
            },
            "monitor-bulk-create",
            undefined,
            { count: monitors.length, siteIdentifier }
        );
    }

    /**
     * Clears all active operations for a monitor.
     *
     * @param monitorId - The ID of the monitor to clear operations for
     * @returns Promise that resolves when all operations are cleared
     * @throws Error if the database operation fails
     *
     * @remarks
     * This method is used when a monitor is stopped or reset to ensure
     * no stale operations remain active. Use only for standalone operations.
     * For operations within existing transactions, use clearActiveOperationsInternal.
     */
    public async clearActiveOperations(monitorId: string): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.clearActiveOperationsInternal(db, monitorId);
                return Promise.resolve();
            });
        }, "MonitorRepository.clearActiveOperations");
    }

    /**
     * Internal method to clear all active operations for a monitor.
     * Must be called within an active transaction.
     *
     * @param db - Database connection within active transaction
     * @param monitorId - The ID of the monitor to clear operations for
     * @public
     */
    public clearActiveOperationsInternal(
        db: Database,
        monitorId: string
    ): void {
        // Clear all active operations (internal call to avoid nested transaction)
        this.updateInternal(db, monitorId, { activeOperations: [] });

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Cleared all active operations for monitor ${monitorId}`
            );
        }
    }

    /**
     * Creates a new monitor for a site.
     *
     * @param siteIdentifier - The site identifier to associate the monitor with.
     * @param monitor - Monitor configuration data (without ID).
     * @returns Promise resolving to the created monitor ID as string.
     * @throws Error if the database operation fails or monitor creation fails.
     * @remarks
     * Uses a transaction for atomicity.
     * @example
     * ```typescript
     * const id = await repo.create("site-123", monitorObj);
     * ```
     */
    public async create(
        siteIdentifier: string,
        monitor: Omit<Site["monitors"][0], "id">
    ): Promise<string> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    return Promise.resolve(
                        this.createInternal(db, siteIdentifier, monitor)
                    );
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
     * @throws Error when monitor creation fails or returns invalid ID.
     * @remarks
     * Must be called within an active transaction context.
     */
    public createInternal(
        db: Database,
        siteIdentifier: string,
        monitor: Omit<Site["monitors"][0], "id">
    ): string {
        // Generate dynamic SQL and parameters
        const { columns, placeholders } = generateSqlParameters();
        const parameters = buildMonitorParameters(
            siteIdentifier,
            monitor as Site["monitors"][0]
        );

        const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;

        const insertResult = db.get(insertSql, parameters) as
            | Record<string, unknown>
            | undefined;

        // Enhanced type safety validation
        if (!insertResult || typeof insertResult !== "object") {
            throw new Error(
                `Failed to create monitor for site ${siteIdentifier}: invalid database response`
            );
        }
        if (
            !("id" in insertResult) ||
            typeof insertResult["id"] !== "number" ||
            insertResult["id"] <= 0
        ) {
            throw new Error(
                `Failed to create monitor for site ${siteIdentifier}: invalid or missing ID in database response`
            );
        }

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Created monitor with id: ${insertResult["id"]} for site: ${siteIdentifier} (internal)`
            );
        }

        return String(insertResult["id"]);
    }

    /**
     * Deletes a monitor and its history.
     *
     * @param monitorId - The monitor ID to delete.
     * @returns Promise resolving to true if deleted, false otherwise.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a transaction for atomicity. History is deleted before monitor.
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
                            logger.debug(
                                `[MonitorRepository] Deleted monitor with id: ${monitorId}`
                            );
                        }
                    } else {
                        logger.warn(
                            `[MonitorRepository] Monitor not found for deletion: ${monitorId}`
                        );
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
     *
     * @returns Promise that resolves when all monitors are deleted.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a transaction for atomicity.
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
     * Use this method when already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run(MONITOR_QUERIES.DELETE_ALL);
        logger.debug("[MonitorRepository] Cleared all monitors (internal)");
    }

    /**
     * Deletes all monitors for a specific site.
     *
     * @param siteIdentifier - The site identifier to delete monitors for.
     * @returns Promise that resolves when all monitors are deleted for the site.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a transaction for atomicity.
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
                        logger.debug(
                            `[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`
                        );
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
     * Deletes all history for monitors before deleting monitors.
     */
    public deleteBySiteIdentifierInternal(
        db: Database,
        siteIdentifier: string
    ): void {
        // Get all monitor IDs for this site
        const monitorRows = db.all(MONITOR_QUERIES.SELECT_IDS_BY_SITE, [
            siteIdentifier,
        ]) as Array<{
            id: number;
        }>;

        // Delete history for all monitors
        for (const row of monitorRows) {
            db.run(MONITOR_QUERIES.DELETE_HISTORY_BY_MONITOR, [row.id]);
        }

        // Delete all monitors for this site
        db.run(MONITOR_QUERIES.DELETE_BY_SITE, [siteIdentifier]);
    }

    /**
     * Internal method to delete a monitor and its history within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to delete.
     * @returns True if deleted, false otherwise.
     * @remarks
     * Deletes history before deleting monitor.
     */
    public deleteInternal(db: Database, monitorId: string): boolean {
        // Delete history first (foreign key constraint)
        db.run(MONITOR_QUERIES.DELETE_HISTORY_BY_MONITOR, [monitorId]);

        // Delete the monitor
        const deleteResult = db.run(MONITOR_QUERIES.DELETE_BY_ID, [monitorId]);
        return deleteResult.changes > 0;
    }

    /**
     * Finds a monitor by its unique identifier.
     *
     * @param monitorId - The unique identifier of the monitor to find.
     * @returns A promise resolving to the monitor object, or `undefined` if not found.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a direct database query and maps the result to a monitor object.
     * @example
     * ```typescript
     * const monitor = await repo.findByIdentifier("monitor-123");
     * ```
     */
    public async findByIdentifier(
        monitorId: string
    ): Promise<Site["monitors"][0] | undefined> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                const row = db.get(MONITOR_QUERIES.SELECT_BY_ID, [
                    monitorId,
                ]) as MonitorRow | undefined;

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
     * @param siteIdentifier - The site identifier to find monitors for.
     * @returns A promise resolving to an array of monitor objects.
     * @throws Error if the database operation fails.
     * @remarks
     * Uses a direct database query and maps the results to monitor objects.
     * @example
     * ```typescript
     * const monitors = await repo.findBySiteIdentifier("site-123");
     * ```
     */
    public async findBySiteIdentifier(
        siteIdentifier: string
    ): Promise<Site["monitors"]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const monitorRows = db.all(MONITOR_QUERIES.SELECT_BY_SITE, [
                siteIdentifier,
            ]) as MonitorRow[];

            return Promise.resolve(rowsToMonitors(monitorRows));
        }, `find-monitors-by-site-${siteIdentifier}`);
    }

    /**
     * Gets all monitor IDs in the database.
     *
     * @returns A promise resolving to an array of objects with monitor IDs.
     * @throws Error if the database operation fails.
     * @remarks
     * Returns all monitor IDs as objects with an `id` property.
     * @example
     * ```typescript
     * const ids = await repo.getAllMonitorIds();
     * ```
     */
    public async getAllMonitorIds(): Promise<Array<{ id: number }>> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const rows = db.all(MONITOR_QUERIES.SELECT_ALL_IDS) as Array<{
                id: number;
            }>;
            return Promise.resolve(rows);
        }, "monitor-get-all-ids");
    }

    /**
     * Updates a monitor's configuration.
     *
     * @param monitorId - The unique identifier of the monitor to update.
     * @param monitor - Partial monitor configuration data to update.
     * @returns A promise that resolves when the update is complete.
     * @throws Error if the database operation fails.
     * @remarks
     * Only provided fields are updated. Uses a transaction for atomicity.
     * @example
     * ```typescript
     * await repo.update("monitor-123", { checkInterval: 60000 });
     * ```
     */
    public async update(
        monitorId: string,
        monitor: Partial<Site["monitors"][0]>
    ): Promise<void> {
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
     * Updates a monitor's configuration within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param monitorId - The unique identifier of the monitor to update.
     * @param monitor - Partial monitor configuration data to update.
     * @throws Error if the update query fails.
     * @remarks
     * Only provided fields are updated. Converts camelCase to snake_case for DB columns. Use this method only when already within a transaction context.
     */
    public updateInternal(
        db: Database,
        monitorId: string,
        monitor: Partial<Site["monitors"][0]>
    ): void {
        if (isDev()) {
            logger.debug(
                `[MonitorRepository] updateInternal called with monitorId: ${monitorId}, monitor:`,
                monitor
            );
        }

        // Use dynamic row mapping to convert camelCase to snake_case
        const row = mapMonitorToRow(monitor as Monitor);

        if (isDev()) {
            logger.debug(`[MonitorRepository] mapMonitorToRow result:`, row);
        }

        const { updateFields, updateValues } = this.buildUpdateFieldsAndValues(
            row as unknown as Record<string, unknown>,
            monitor
        );

        if (updateFields.length === 0) {
            if (isDev()) {
                logger.debug(
                    `[MonitorRepository] No fields to update for monitor: ${monitorId} (internal)`
                );
            }
            return;
        }

        this.executeUpdateQuery(db, updateFields, updateValues, monitorId);
    }

    /**
     * Builds the update fields and values for the monitor update query.
     *
     * @param row - Row object mapping monitor fields to DB columns.
     * @param monitor - Partial monitor configuration data to update.
     * @returns Object containing updateFields (SQL fragments) and updateValues (DB values).
     * @remarks
     * Only primitive types are included. Monitoring fields may be skipped per domain logic.
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
     * @param key - Field name for logging purposes.
     * @param value - Value to convert for database storage.
     * @returns Database-compatible value or null if conversion not possible.
     * @remarks
     * Strings and numbers are passed through. Booleans are converted to 1/0. Other types are skipped.
     */
    private convertValueForDatabase(
        key: string,
        value: unknown
    ): DbValue | null {
        if (typeof value === "string" || typeof value === "number") {
            return value;
        }
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        }

        if (isDev()) {
            logger.warn(
                `[MonitorRepository] Skipping non-primitive field ${key} with value:`,
                value
            );
        }
        return null;
    }

    /**
     * Executes the update query with the given fields and values.
     *
     * @param db - Database connection (must be within active transaction).
     * @param updateFields - Array of SQL field assignments.
     * @param updateValues - Array of values to bind.
     * @param monitorId - The monitor ID to update.
     * @returns void
     * @remarks
     * Executes the SQL update statement for the monitor.
     */
    private executeUpdateQuery(
        db: Database,
        updateFields: string[],
        updateValues: DbValue[],
        monitorId: string
    ): void {
        updateValues.push(monitorId);
        const sql = `UPDATE monitors SET ${updateFields.join(", ")} WHERE id = ?`;

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Executing SQL: ${sql} with values:`,
                updateValues
            );
        }

        db.run(sql, updateValues);

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Updated monitor with id: ${monitorId} (internal)`
            );
        }
    }

    /**
     * Gets the database instance for internal repository operations.
     *
     * @returns Database connection from the DatabaseService.
     * @throws Error when database is not initialized.
     * @remarks
     * Only used for read operations and internal methods. Mutations must use executeTransaction().
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Checks if monitoring-related fields should be skipped during update.
     *
     * @param key - Database field name to check.
     * @param monitor - Monitor update data being processed.
     * @returns True if the field should be skipped, false otherwise.
     * @remarks
     * The 'enabled' field is derived from 'monitoring' state. If neither is provided, skip 'enabled'.
     */
    private shouldSkipMonitoringFields(
        key: string,
        monitor: Partial<Site["monitors"][0]>
    ): boolean {
        if (
            key === "enabled" &&
            !("monitoring" in monitor) &&
            !("enabled" in monitor)
        ) {
            if (isDev()) {
                logger.debug(
                    `[MonitorRepository] Skipping 'enabled' field - monitoring state not provided in update`
                );
            }
            return true;
        }
        return false;
    }
}
