/**
 * Database repository for monitor persistence and management using the
 * repository pattern.
 *
 * @remarks
 * Handles CRUD operations for site monitoring configurations using the
 * repository pattern. All operations are wrapped in transactions and use the
 * DatabaseService for transaction management. All mutations are atomic to
 * ensure data consistency and proper error handling.
 *
 * Key features:
 *
 * - Type-safe monitor CRUD operations with comprehensive validation
 * - Transaction support for atomic operations and rollback safety
 * - Dynamic SQL generation for flexible queries and updates
 * - Performance optimization through prepared statements and caching
 * - Comprehensive error handling with operational hooks
 * - Site-monitor relationship management and integrity constraints
 * - Development mode debugging with detailed logging
 *
 * @example Basic monitor operations:
 *
 * ```typescript
 * const monitorRepo = new MonitorRepository({ databaseService });
 *
 * // Create a monitor for a site
 * const monitor = await monitorRepo.createMonitor({
 *     siteIdentifier: "site123",
 *     checkInterval: 60000,
 *     retryAttempts: 3,
 *     timeout: 30000,
 * });
 *
 * // Get all monitors for a site
 * const monitors = await monitorRepo.findBySiteIdentifier("site123");
 * ```
 *
 * @example Transaction usage:
 *
 * ```typescript
 * await databaseService.executeTransaction(async (db) => {
 *     const monitor1 = await monitorRepo.createMonitor(data1, db);
 *     const monitor2 = await monitorRepo.createMonitor(data2, db);
 *     // Both operations committed together
 * });
 * ```
 *
 * @packageDocumentation
 *
 * @public
 */
import type { Monitor, Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";
import type { UnknownRecord } from "type-fest";

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
import {
    insertWithReturning,
    queryForIds,
    queryMonitorRow,
    queryMonitorRows,
} from "./utils/typedQueries";

/**
 * Repository dependencies for managing monitor data persistence.
 *
 * @remarks
 * Provides the required database service for monitor operations. Used for
 * dependency injection pattern to ensure proper service coupling.
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
 * Transaction-scoped monitor repository operations.
 */
export interface MonitorRepositoryTransactionAdapter {
    clearActiveOperations: (monitorId: string) => void;
    create: (siteIdentifier: string, monitor: Site["monitors"][0]) => string;
    deleteAll: () => void;
    deleteById: (monitorId: string) => boolean;
    deleteBySiteIdentifier: (siteIdentifier: string) => void;
    findBySiteIdentifier: (siteIdentifier: string) => Site["monitors"];
    update: (monitorId: string, monitor: Partial<Site["monitors"][0]>) => void;
}

/**
 * Common SQL queries for monitor persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the repository and not exported.
 *
 * @internal
 */
const MONITOR_QUERIES = {
    DELETE_ALL: "DELETE FROM monitors",
    DELETE_BY_ID: "DELETE FROM monitors WHERE id = ?",
    DELETE_BY_SITE: "DELETE FROM monitors WHERE site_identifier = ?",
    DELETE_HISTORY_BY_MONITOR: "DELETE FROM history WHERE monitor_id = ?",
    SELECT_ALL_IDS: "SELECT id FROM monitors",
    SELECT_BY_ID: "SELECT * FROM monitors WHERE id = ?",
    SELECT_BY_SITE: "SELECT * FROM monitors WHERE site_identifier = ?",
    SELECT_IDS_BY_SITE: "SELECT id FROM monitors WHERE site_identifier = ?",
    UPDATE_STATUS:
        "UPDATE monitors SET status = ?, responseTime = ?, lastChecked = ? WHERE id = ?",
} as const;

/**
 * @remarks
 * Handles all CRUD operations for monitors in the database using the repository
 * pattern. All mutations are wrapped in transactions for consistency and error
 * handling. All operations use the DatabaseService for transaction management
 * and maintain atomicity.
 *
 * @public
 * Repository for managing monitor data persistence.
 */
export class MonitorRepository {
    /** @internal */
    private readonly databaseService: DatabaseService;

    /**
     * Bulk creates monitors for a site.
     *
     * @remarks
     * Uses a transaction for atomicity. Each monitor is inserted and its ID is
     * returned.
     *
     * @example
     *
     * ```typescript
     * await repo.bulkCreate("site-123", monitorsArray);
     * ```
     *
     * @param siteIdentifier - The site identifier to associate monitors with.
     * @param monitors - Array of monitor configuration objects to create.
     *
     * @returns Promise resolving to array of created monitors with IDs.
     *
     * @throws Error if the database operation fails or monitor creation fails.
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
                        // Use the same dynamic schema insert strategy as the
                        // primary create path.
                        const { columns, placeholders } =
                            generateSqlParameters();
                        const parameters = buildMonitorParameters(
                            siteIdentifier,
                            monitor
                        );

                        // eslint-disable-next-line sql-template/no-unsafe-query -- Safe: columns/placeholders are generated by app code
                        const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;
                        const insertResult = insertWithReturning(
                            db,
                            insertSql,
                            parameters
                        );

                        if (
                            !("id" in insertResult) ||
                            typeof insertResult["id"] !== "string" ||
                            insertResult["id"].length === 0
                        ) {
                            throw new Error(
                                "Failed to create monitor: invalid or missing ID in database response"
                            );
                        }

                        // Keep the caller-provided id stable (UUID). The DB
                        // should echo it back.
                        createdMonitors.push(monitor);
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
     * @remarks
     * This method is used when a monitor is stopped or reset to ensure no stale
     * operations remain active. Use only for standalone operations. For
     * operations within existing transactions, use
     * clearActiveOperationsInternal.
     *
     * @param monitorId - The ID of the monitor to clear operations for
     *
     * @returns Promise that resolves when all operations are cleared
     *
     * @throws Error if the database operation fails
     */
    public async clearActiveOperations(monitorId: string): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.clearActiveOperationsInternal(db, monitorId);
                    return Promise.resolve();
                }),
            "MonitorRepository.clearActiveOperations"
        );
    }

    /**
     * Creates a new monitor for a site.
     *
     * @remarks
     * Uses a transaction for atomicity.
     *
     * @example
     *
     * ```typescript
     * const id = await repo.create("site-123", monitorObj);
     * ```
     *
     * @param siteIdentifier - The site identifier to associate the monitor
     *   with.
     * @param monitor - Monitor configuration data (without ID).
     *
     * @returns Promise resolving to the created monitor ID as string.
     *
     * @throws Error if the database operation fails or monitor creation fails.
     */
    public async create(
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): Promise<string> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) =>
                    Promise.resolve(
                        this.createInternal(db, siteIdentifier, monitor)
                    )),
            "monitor-create",
            undefined,
            { siteIdentifier, type: monitor.type }
        );
    }

    /**
     * Deletes a monitor and its history.
     *
     * @remarks
     * Uses a transaction for atomicity. History is deleted before monitor.
     *
     * @example
     *
     * ```typescript
     * const deleted = await repo.delete("monitor-123");
     * ```
     *
     * @param monitorId - The monitor ID to delete.
     *
     * @returns Promise resolving to true if deleted, false otherwise.
     *
     * @throws Error if the database operation fails.
     */
    public async delete(monitorId: string): Promise<boolean> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
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
                }),
            "monitor-delete",
            undefined,
            { monitorId }
        );
    }

    /**
     * Clears all monitors from the database.
     *
     * @remarks
     * Uses a transaction for atomicity.
     *
     * @example
     *
     * ```typescript
     * await repo.deleteAll();
     * ```
     *
     * @returns Promise that resolves when all monitors are deleted.
     *
     * @throws Error if the database operation fails.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.deleteAllInternal(db);
                    return Promise.resolve();
                }),
            "monitor-delete-all"
        );
    }

    /**
     * Deletes all monitors for a specific site.
     *
     * @remarks
     * Uses a transaction for atomicity.
     *
     * @example
     *
     * ```typescript
     * await repo.deleteBySiteIdentifier("site-123");
     * ```
     *
     * @param siteIdentifier - The site identifier to delete monitors for.
     *
     * @returns Promise that resolves when all monitors are deleted for the
     *   site.
     *
     * @throws Error if the database operation fails.
     */
    public async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.deleteBySiteIdentifierInternal(db, siteIdentifier);

                    if (isDev()) {
                        logger.debug(
                            `[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`
                        );
                    }

                    return Promise.resolve();
                }),
            "monitor-delete-by-site",
            undefined,
            { siteIdentifier }
        );
    }

    /**
     * Finds a monitor by its unique identifier.
     *
     * @remarks
     * Uses a direct database query and maps the result to a monitor object.
     *
     * @example
     *
     * ```typescript
     * const monitor = await repo.findByIdentifier("monitor-123");
     * ```
     *
     * @param monitorId - The unique identifier of the monitor to find.
     *
     * @returns A promise resolving to the monitor object, or `undefined` if not
     *   found.
     *
     * @throws Error if the database operation fails.
     */
    public async findByIdentifier(
        monitorId: string
    ): Promise<Site["monitors"][0] | undefined> {
        return withDatabaseOperation(
            () =>
                Promise.resolve(
                    rowToMonitorOrUndefined(
                        queryMonitorRow(
                            this.getDb(),
                            MONITOR_QUERIES.SELECT_BY_ID,
                            [monitorId]
                        )
                    )
                ),
            "monitor-lookup",
            undefined,
            { monitorId }
        );
    }

    /**
     * Finds all monitors for a specific site.
     *
     * @remarks
     * Uses a direct database query and maps the results to monitor objects.
     *
     * @example
     *
     * ```typescript
     * const monitors = await repo.findBySiteIdentifier("site-123");
     * ```
     *
     * @param siteIdentifier - The site identifier to find monitors for.
     *
     * @returns A promise resolving to an array of monitor objects.
     *
     * @throws Error if the database operation fails.
     */
    public async findBySiteIdentifier(
        siteIdentifier: string
    ): Promise<Site["monitors"]> {
        return withDatabaseOperation(
            () =>
                Promise.resolve(
                    this.findBySiteIdentifierInternal(
                        this.getDb(),
                        siteIdentifier
                    )
                ),
            `find-monitors-by-site-${siteIdentifier}`
        );
    }

    /**
     * Gets all monitor IDs in the database.
     *
     * @remarks
     * Returns all monitor IDs as objects with an `id` property.
     *
     * @example
     *
     * ```typescript
     * const ids = await repo.getAllMonitorIds();
     * ```
     *
     * @returns A promise resolving to an array of objects with monitor IDs.
     *
     * @throws Error if the database operation fails.
     */
    public async getAllMonitorIds(): Promise<Array<{ id: number | string }>> {
        return withDatabaseOperation(
            () =>
                Promise.resolve(
                    queryForIds(this.getDb(), MONITOR_QUERIES.SELECT_ALL_IDS)
                ),
            "monitor-get-all-ids"
        );
    }

    /**
     * Updates a monitor's configuration.
     *
     * @remarks
     * Only provided fields are updated. Uses a transaction for atomicity.
     *
     * @example
     *
     * ```typescript
     * await repo.update("monitor-123", { checkInterval: 60000 });
     * ```
     *
     * @param monitorId - The unique identifier of the monitor to update.
     * @param monitor - Partial monitor configuration data to update.
     *
     * @returns A promise that resolves when the update is complete.
     *
     * @throws Error if the database operation fails.
     */
    public async update(
        monitorId: string,
        monitor: Partial<Site["monitors"][0]>
    ): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.updateInternal(db, monitorId, monitor);
                    return Promise.resolve();
                }),
            "monitor-update",
            undefined,
            { monitorId }
        );
    }

    /**
     * Create a transaction adapter bound to the provided database connection.
     */
    public createTransactionAdapter(
        db: Database
    ): MonitorRepositoryTransactionAdapter {
        const clearActiveOperations: MonitorRepositoryTransactionAdapter["clearActiveOperations"] =
            (monitorId) => {
                this.clearActiveOperationsInternal(db, monitorId);
            };

        const create: MonitorRepositoryTransactionAdapter["create"] = (
            siteIdentifier,
            monitor
        ) => this.createInternal(db, siteIdentifier, monitor);

        const deleteAll: MonitorRepositoryTransactionAdapter["deleteAll"] =
            () => {
                this.deleteAllInternal(db);
            };

        const deleteById: MonitorRepositoryTransactionAdapter["deleteById"] = (
            monitorId
        ) => this.deleteInternal(db, monitorId);

        const deleteBySiteIdentifier: MonitorRepositoryTransactionAdapter["deleteBySiteIdentifier"] =
            (siteIdentifier) => {
                this.deleteBySiteIdentifierInternal(db, siteIdentifier);
            };

        const findBySiteIdentifier: MonitorRepositoryTransactionAdapter["findBySiteIdentifier"] =
            (siteIdentifier) =>
                this.findBySiteIdentifierInternal(db, siteIdentifier);

        const update: MonitorRepositoryTransactionAdapter["update"] = (
            monitorId,
            monitor
        ) => {
            this.updateInternal(db, monitorId, monitor);
        };

        return {
            clearActiveOperations,
            create,
            deleteAll,
            deleteById,
            deleteBySiteIdentifier,
            findBySiteIdentifier,
            update,
        } satisfies MonitorRepositoryTransactionAdapter;
    }

    /**
     * Internal helper to fetch monitors for a site within an existing
     * transaction.
     *
     * @remarks
     * Must be invoked with a database connection that belongs to the active
     * transaction. Consumers should prefer the public
     * {@link findBySiteIdentifier} unless they already participate in a larger
     * transactional flow.
     *
     * @param db - Active transaction database connection.
     * @param siteIdentifier - Identifier of the site whose monitors should be
     *   retrieved.
     *
     * @returns Array of monitors associated with the specified site.
     */
    private findBySiteIdentifierInternal(
        db: Database,
        siteIdentifier: string
    ): Site["monitors"] {
        const monitorRows = queryMonitorRows(
            db,
            MONITOR_QUERIES.SELECT_BY_SITE,
            [siteIdentifier]
        );

        return rowsToMonitors(monitorRows);
    }

    /**
     * Constructs a new MonitorRepository instance.
     *
     * @example
     *
     * ```typescript
     * const repo = new MonitorRepository({ databaseService });
     * ```
     *
     * @param dependencies - The required dependencies for monitor operations.
     */
    public constructor(dependencies: MonitorRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Internal method to clear all active operations for a monitor. Must be
     * called within an active transaction.
     *
     * @param db - Database connection within active transaction
     * @param monitorId - The ID of the monitor to clear operations for
     *
     * @public
     */
    private clearActiveOperationsInternal(
        db: Database,
        monitorId: string
    ): void {
        // Clear all active operations (internal call to avoid nested
        // transaction)
        this.updateInternal(db, monitorId, { activeOperations: [] });

        if (isDev()) {
            logger.debug(
                `[MonitorRepository] Cleared all active operations for monitor ${monitorId}`
            );
        }
    }

    /**
     * Internal method to create a monitor within an existing transaction.
     *
     * @remarks
     * Must be called within an active transaction context.
     *
     * @param db - Database connection (must be within active transaction).
     * @param siteIdentifier - Site identifier to associate monitor with.
     * @param monitor - Monitor configuration data (without ID).
     *
     * @returns Generated monitor ID as string.
     *
     * @throws Error when monitor creation fails or returns invalid ID.
     */
    private createInternal(
        db: Database,
        siteIdentifier: string,
        monitor: Site["monitors"][0]
    ): string {
        if (!monitor.id || typeof monitor.id !== "string") {
            throw new TypeError(
                `Monitor id is required for stable persistence (site ${siteIdentifier})`
            );
        }

        // Generate dynamic SQL and parameters
        const { columns, placeholders } = generateSqlParameters();
        // Type assertion is safe: buildMonitorParameters doesn't use the id
        // field for INSERT operations
        const parameters = buildMonitorParameters(siteIdentifier, monitor);

        // eslint-disable-next-line sql-template/no-unsafe-query -- Safe: columns and placeholders are generated by application code, user values passed as parameters
        const insertSql = `INSERT INTO monitors (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`;

        const insertResult = insertWithReturning(db, insertSql, parameters);

        // Validate the returned ID from database
        if (
            !("id" in insertResult) ||
            typeof insertResult["id"] !== "string" ||
            insertResult["id"].length === 0
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

        return insertResult["id"];
    }

    /**
     * Internal method to clear all monitors from the database within an
     * existing transaction.
     *
     * @remarks
     * Use this method when already within a transaction context.
     *
     * @param db - Database connection (must be within active transaction).
     *
     * @returns Void
     */
    private deleteAllInternal(db: Database): void {
        // Get all monitor IDs first
        const monitorRows = queryForIds(db, MONITOR_QUERIES.SELECT_ALL_IDS);

        // Delete history for all monitors first (foreign key constraint)
        for (const row of monitorRows) {
            db.run(MONITOR_QUERIES.DELETE_HISTORY_BY_MONITOR, [row.id]);
        }

        // Then delete all monitors
        db.run(MONITOR_QUERIES.DELETE_ALL);
        logger.debug(
            "[MonitorRepository] Cleared all monitors and history (internal)"
        );
    }

    /**
     * Internal method to delete all monitors for a specific site within an
     * existing transaction.
     *
     * @remarks
     * Deletes all history for monitors before deleting monitors.
     *
     * @param db - Database connection (must be within active transaction).
     * @param siteIdentifier - The site identifier to delete monitors for.
     *
     * @returns Void
     */
    private deleteBySiteIdentifierInternal(
        db: Database,
        siteIdentifier: string
    ): void {
        // Get all monitor IDs for this site
        const monitorRows = queryForIds(
            db,
            MONITOR_QUERIES.SELECT_IDS_BY_SITE,
            [siteIdentifier]
        );

        // Delete history for all monitors
        for (const row of monitorRows) {
            db.run(MONITOR_QUERIES.DELETE_HISTORY_BY_MONITOR, [row.id]);
        }

        // Delete all monitors for this site
        db.run(MONITOR_QUERIES.DELETE_BY_SITE, [siteIdentifier]);
    }

    /**
     * Internal method to delete a monitor and its history within an existing
     * transaction.
     *
     * @remarks
     * Deletes history before deleting monitor.
     *
     * @param db - Database connection (must be within active transaction).
     * @param monitorId - The monitor ID to delete.
     *
     * @returns True if deleted, false otherwise.
     */
    private deleteInternal(db: Database, monitorId: string): boolean {
        // Delete history first (foreign key constraint)
        db.run(MONITOR_QUERIES.DELETE_HISTORY_BY_MONITOR, [monitorId]);

        // Delete the monitor
        const deleteResult = db.run(MONITOR_QUERIES.DELETE_BY_ID, [monitorId]);
        return deleteResult.changes > 0;
    }

    /**
     * Updates a monitor's configuration within an existing transaction context.
     *
     * @remarks
     * Only provided fields are updated. Converts camelCase to snake_case for DB
     * columns. Use this method only when already within a transaction context.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     * @param monitorId - The unique identifier of the monitor to update.
     * @param monitor - Partial monitor configuration data to update.
     *
     * @throws Error if the update query fails.
     */
    private updateInternal(
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
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Monitor row mapping requires type assertions for dynamic field conversion */
        const row = mapMonitorToRow(monitor as Monitor);

        if (isDev()) {
            logger.debug(`[MonitorRepository] mapMonitorToRow result:`, row);
        }

        const { updateFields, updateValues } = this.buildUpdateFieldsAndValues(
            row as unknown as UnknownRecord,
            monitor
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after monitor field mapping with validated types */

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
     * @remarks
     * Only primitive types are included. Monitoring fields may be skipped per
     * domain logic.
     *
     * @param row - Row object mapping monitor fields to DB columns.
     * @param monitor - Partial monitor configuration data to update.
     *
     * @returns Object containing updateFields (SQL fragments) and updateValues
     *   (DB values).
     */
    private buildUpdateFieldsAndValues(
        row: UnknownRecord,
        monitor: Partial<Site["monitors"][0]>
    ): { updateFields: string[]; updateValues: DbValue[] } {
        const updateFields: string[] = [];
        const updateValues: DbValue[] = [];

        // Only update fields that are actually provided and are primitive types
        for (const [key, value] of Object.entries(row)) {
            const shouldProcess =
                value !== undefined &&
                value !== null &&
                !this.shouldSkipMonitoringFields(key, monitor);

            if (shouldProcess) {
                // Ensure we only bind primitive types that SQLite can handle
                const fieldValue = this.convertValueForDatabase(key, value);
                if (fieldValue !== undefined) {
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
     * @remarks
     * Strings and numbers are passed through. Booleans are converted to 1/0.
     * Other types are skipped.
     *
     * @param key - Field name for logging purposes.
     * @param value - Value to convert for database storage.
     *
     * @returns Database-compatible value or `undefined` when conversion is not
     *   possible.
     */
    private convertValueForDatabase(
        key: string,
        value: unknown
    ): DbValue | undefined {
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
        return undefined;
    }

    /**
     * Executes the update query with the given fields and values.
     *
     * @remarks
     * Executes the SQL update statement for the monitor.
     *
     * @param db - Database connection (must be within active transaction).
     * @param updateFields - Array of SQL field assignments.
     * @param updateValues - Array of values to bind.
     * @param monitorId - The monitor ID to update.
     *
     * @returns Void
     */
    private executeUpdateQuery(
        db: Database,
        updateFields: string[],
        updateValues: DbValue[],
        monitorId: string
    ): void {
        updateValues.push(monitorId);
        // eslint-disable-next-line sql-template/no-unsafe-query -- Safe: updateFields is generated by application code, user values passed as parameters
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
     * @remarks
     * Only used for read operations and internal methods. Mutations must use
     * executeTransaction().
     *
     * @returns Database connection from the DatabaseService.
     *
     * @throws Error when database is not initialized.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Checks if monitoring-related fields should be skipped during update.
     *
     * @remarks
     * The 'enabled' field is derived from 'monitoring' state. If neither is
     * provided, skip 'enabled'.
     *
     * @param key - Database field name to check.
     * @param monitor - Monitor update data being processed.
     *
     * @returns True if the field should be skipped, false otherwise.
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
