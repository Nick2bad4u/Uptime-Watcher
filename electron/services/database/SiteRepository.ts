/**
 * Module documentation for the site persistence repository.
 *
 * @remarks
 * Provides comprehensive CRUD operations for site data with transaction
 * support, data validation, and consistent error handling. Follows the
 * repository pattern to abstract database operations from business logic.
 *
 * Key features:
 *
 * - Type-safe site CRUD operations with transaction support
 * - Data validation and normalization for site entities
 * - Consistent error handling with operational hooks
 * - Performance optimization through prepared statements
 * - Automatic data mapping between database rows and domain models
 * - Comprehensive logging for debugging and monitoring
 *
 * @example Basic site operations:
 *
 * ```typescript
 * const siteRepo = new SiteRepository({ databaseService });
 *
 * // Create a new site
 * const newSite = await siteRepo.createSite({
 *     name: "Example Site",
 *     url: "https://example.com",
 *     checkInterval: 60000,
 * });
 *
 * // Fetch all sites
 * const sites = await siteRepo.getAllSites();
 *
 * // Update site
 * await siteRepo.updateSite(siteIdentifier, { name: "Updated Name" });
 * ```
 *
 * @example Transaction usage:
 *
 * ```typescript
 * await databaseService.executeTransaction(async (db) => {
 *     const site1 = await siteRepo.createSite(siteData1, db);
 *     const site2 = await siteRepo.createSite(siteData2, db);
 *     // Both operations committed together
 * });
 * ```
 */
import type { Database } from "node-sqlite3-wasm";

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";

import type { DatabaseService } from "./DatabaseService";

import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { rowsToSites, rowToSite, type SiteRow } from "./utils/siteMapper";
import { querySiteRow, querySiteRows } from "./utils/typedQueries";

/**
 * Defines the dependencies required by the {@link SiteRepository} for managing
 * site data persistence.
 *
 * @remarks
 * Used to inject the {@link DatabaseService} for transactional operations. This
 * interface is used for dependency injection.
 *
 * @public
 */
export interface SiteRepositoryDependencies {
    /**
     * The database service used for transactional operations.
     *
     * @readonly
     */
    databaseService: DatabaseService;
}

/**
 * Property subset required when upserting a site record.
 *
 * @remarks
 * Used to restrict the fields accepted by {@link SiteRepository.upsert} and
 * related transactional helpers to the values persisted by the database.
 */
type SiteRowUpsertFields = "identifier" | "monitoring" | "name";

/**
 * Operations available within a site repository transaction context.
 *
 * @remarks
 * Instances of this adapter are scoped to a single transaction and should not
 * be retained beyond the transaction boundary.
 */
export interface SiteRepositoryTransactionAdapter {
    /** Bulk insert sites within the active transaction. */
    bulkInsert: (sites: SiteRow[]) => void;
    /** Delete a site by identifier within the active transaction. */
    delete: (identifier: string) => boolean;
    /** Delete all sites within the active transaction. */
    deleteAll: () => void;
    /** Upsert a site record within the active transaction. */
    upsert: (site: Pick<SiteRow, SiteRowUpsertFields>) => void;
}

/**
 * Standard site data defaults for normalization across repository operations.
 *
 * @remarks
 * Used to ensure consistent fallback values for site properties. This constant
 * is internal to the repository and not exported.
 *
 * @internal
 */
const SITE_DEFAULTS = {
    MONITORING: true,
    NAME: DEFAULT_SITE_NAME,
} as const;

/**
 * Common SQL queries for site persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the repository and not exported.
 *
 * @internal
 */
const SITE_QUERIES = {
    DELETE_ALL: "DELETE FROM sites",
    DELETE_BY_ID: "DELETE FROM sites WHERE identifier = ?",
    INSERT: "INSERT OR IGNORE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
    SELECT_ALL: "SELECT identifier, name, monitoring FROM sites",
    SELECT_BY_ID:
        "SELECT identifier, name, monitoring FROM sites WHERE identifier = ?",
    UPSERT: "INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
} as const;

/**
 * Repository for managing site data persistence.
 *
 * @remarks
 * Handles all CRUD operations for sites in the database using the repository
 * pattern. All mutations are wrapped in transactions for consistency and error
 * handling. Data normalization is applied for site names and monitoring
 * status.
 *
 * @public
 */
export class SiteRepository {
    /** @internal */
    private readonly databaseService: DatabaseService;

    /**
     * Bulk inserts sites into the database.
     *
     * @remarks
     * - Uses a transaction for atomicity.
     * - Applies default values for missing name or monitoring fields.
     * - Uses `INSERT OR IGNORE` to avoid duplicate identifiers.
     *
     * @example
     *
     * ```typescript
     * await repo.bulkInsert([
     *     { identifier: "abc", name: "Site", monitoring: true },
     * ]);
     * ```
     *
     * @param sites - Array of site data to insert.
     *
     * @returns A promise that resolves when all sites are inserted.
     *
     * @throws Error When the database operation fails.
     */
    public async bulkInsert(sites: SiteRow[]): Promise<void> {
        if (sites.length === 0) {
            return;
        }

        await withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.bulkInsertInternal(db, sites);
                    return Promise.resolve();
                }),
            "site-bulk-insert",
            undefined,
            { count: sites.length }
        );
    }

    /**
     * Deletes a site by its identifier.
     *
     * @example
     *
     * ```typescript
     * const deleted = await repo.delete("site-123");
     * ```
     *
     * @param identifier - Unique site identifier to delete.
     *
     * @returns Promise resolving to `true` if the site was deleted, `false` if
     *   not found.
     *
     * @throws Error When the database operation fails.
     */
    public async delete(identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) =>
                    Promise.resolve(this.deleteInternal(db, identifier))
                ),
            "site-delete",
            undefined,
            { identifier }
        );
    }

    /**
     * Deletes all sites from the database.
     *
     * @remarks
     * **WARNING**: This operation is irreversible and will delete all site
     * data.
     *
     * @example
     *
     * ```typescript
     * await repo.deleteAll();
     * ```
     *
     * @returns Promise that resolves when all sites are deleted.
     *
     * @throws Error When the database operation fails.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.deleteAllInternal(db);
                    return Promise.resolve();
                }),
            "site-delete-all"
        );
    }

    /**
     * Checks if a site exists by its identifier.
     *
     * @example
     *
     * ```typescript
     * const exists = await repo.exists("site-123");
     * ```
     *
     * @param identifier - Site identifier to check.
     *
     * @returns Promise resolving to `true` if the site exists, `false`
     *   otherwise.
     *
     * @throws Error When the database operation fails.
     */
    public async exists(identifier: string): Promise<boolean> {
        return this.runSiteReadOperation(
            "site-exists",
            (db) => this.findByIdentifierInternal(db, identifier) !== undefined,
            { identifier }
        );
    }

    /**
     * Exports all sites for backup or import functionality.
     *
     * @remarks
     * Returns raw site data suitable for backup or export operations.
     *
     * @example
     *
     * ```typescript
     * const allSites = await repo.exportAll();
     * ```
     *
     * @returns Promise resolving to an array of all site data.
     *
     * @throws Error When the database operation fails.
     */
    public async exportAll(): Promise<SiteRow[]> {
        return this.runAllSitesOperation("site-export-all");
    }

    /**
     * Retrieves all sites from the database.
     *
     * @remarks
     * Functionally identical to {@link exportAll}, but intended for general
     * querying.
     *
     * @example
     *
     * ```typescript
     * const sites = await repo.findAll();
     * ```
     *
     * @returns Promise resolving to an array of all site data.
     *
     * @throws Error When the database operation fails.
     */
    public async findAll(): Promise<SiteRow[]> {
        return this.runAllSitesOperation("find-all-sites");
    }

    /**
     * Finds a site by its identifier.
     *
     * @example
     *
     * ```typescript
     * const site = await repo.findByIdentifier("site-123");
     * ```
     *
     * @param identifier - Site identifier to find.
     *
     * @returns Promise resolving to site data if found, or `undefined` if not
     *   found.
     *
     * @throws Error When the database operation fails.
     */
    public async findByIdentifier(
        identifier: string
    ): Promise<SiteRow | undefined> {
        return this.runSiteReadOperation(
            "site-lookup",
            (db) => this.findByIdentifierInternal(db, identifier),
            { identifier }
        );
    }

    /**
     * Creates or updates a site in the database.
     *
     * @remarks
     * - Uses `INSERT OR REPLACE` for atomic upsert.
     * - Normalizes site data before persistence.
     *
     * @example
     *
     * ```typescript
     * await repo.upsert({
     *     identifier: "site-123",
     *     name: "My Site",
     *     monitoring: true,
     * });
     * ```
     *
     * @param site - Site data to create or update.
     *
     * @returns Promise that resolves when the operation completes.
     *
     * @throws Error When the database operation fails.
     */
    public async upsert(
        site: Pick<SiteRow, SiteRowUpsertFields>
    ): Promise<void> {
        return withDatabaseOperation(
            () =>
                this.databaseService.executeTransaction((db) => {
                    this.upsertInternal(db, site);
                    return Promise.resolve();
                }),
            "site-upsert",
            undefined,
            { identifier: site.identifier }
        );
    }

    /**
     * Executes the shared "select all sites" operation within a database
     * context.
     *
     * @param operationName - Identifier used for logging and metrics.
     *
     * @returns Promise resolving to all sites currently persisted.
     *
     * @throws Error When the underlying database operation fails.
     */
    private async runAllSitesOperation(
        operationName: string
    ): Promise<SiteRow[]> {
        return this.runSiteReadOperation(operationName, (db) =>
            this.fetchAllSitesInternal(db)
        );
    }

    /**
     * Executes a readonly site repository operation inside the shared
     * operational hook with consistent logging metadata.
     *
     * @typeParam TResult - Result type produced by the handler.
     *
     * @param operationName - Identifier used for logging/metrics.
     * @param handler - Function executed with an active database connection.
     * @param metadata - Optional metadata to include in operational logging.
     *
     * @returns The value produced by the supplied handler.
     *
     * @throws Error When the underlying database operation fails.
     */
    private async runSiteReadOperation<TResult>(
        operationName: string,
        handler: (db: Database) => TResult,
        metadata?: Record<string, unknown>
    ): Promise<TResult> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();
                return Promise.resolve(handler(db));
            },
            operationName,
            undefined,
            metadata
        );
    }

    /**
     * Create a transaction-scoped adapter exposing encapsulated write
     * operations.
     *
     * @remarks
     * The returned adapter must only be used with the provided transaction
     * connection and is not safe to retain once the transaction has been
     * committed or rolled back.
     *
     * @param db - Active transaction database connection.
     *
     * @returns A transaction-aware adapter exposing write helpers.
     */
    public createTransactionAdapter(
        db: Database
    ): SiteRepositoryTransactionAdapter {
        const bulkInsert: SiteRepositoryTransactionAdapter["bulkInsert"] = (
            sites
        ) => {
            this.bulkInsertInternal(db, sites);
        };

        const deleteSite: SiteRepositoryTransactionAdapter["delete"] = (
            identifier
        ) => this.deleteInternal(db, identifier);

        const deleteAll: SiteRepositoryTransactionAdapter["deleteAll"] = () => {
            this.deleteAllInternal(db);
        };

        const upsert: SiteRepositoryTransactionAdapter["upsert"] = (site) => {
            this.upsertInternal(db, site);
        };

        return {
            bulkInsert,
            delete: deleteSite,
            deleteAll,
            upsert,
        } satisfies SiteRepositoryTransactionAdapter;
    }

    /**
     * Constructs a new {@link SiteRepository} instance.
     *
     * @example
     *
     * ```typescript
     * const repo = new SiteRepository({ databaseService });
     * ```
     *
     * @param dependencies - The required dependencies for site operations.
     */
    public constructor(dependencies: SiteRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Internal method to bulk insert sites within an existing transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Uses prepared statements for performance.
     * - Normalizes site data before insertion.
     *
     * @param db - Database connection (must be within active transaction).
     * @param sites - Array of site data to insert.
     *
     * @throws Error When the underlying SQLite driver reports a failure.
     */
    private bulkInsertInternal(db: Database, sites: SiteRow[]): void {
        if (sites.length === 0) {
            return;
        }

        // Use consistent INSERT OR IGNORE for conflict handling
        const stmt = db.prepare(SITE_QUERIES.INSERT);

        try {
            for (const site of sites) {
                // Apply consistent data normalization
                const name = site.name ?? SITE_DEFAULTS.NAME;
                const monitoring = site.monitoring ?? SITE_DEFAULTS.MONITORING;
                const monitoringValue = monitoring ? 1 : 0;

                stmt.run([
                    site.identifier,
                    name,
                    monitoringValue,
                ]);
            }

            logger.debug(
                `[SiteRepository] Bulk inserted ${sites.length} sites (internal)`
            );
        } finally {
            stmt.finalize();
        }
    }

    /**
     * Internal method to delete all sites within an existing transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Performs a hard delete of all site records.
     *
     * @param db - Database connection (must be within active transaction).
     *
     * @throws Error When the underlying SQLite driver reports a failure.
     */
    private deleteAllInternal(db: Database): void {
        db.run(SITE_QUERIES.DELETE_ALL);
        logger.debug("[SiteRepository] All sites deleted (internal)");
    }

    /**
     * Internal method to delete a site by identifier within an existing
     * transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Logs deletion status.
     *
     * @param db - Database connection (must be within active transaction).
     * @param identifier - Site identifier to delete.
     *
     * @returns `true` if the site was deleted, `false` if not found.
     *
     * @throws Error When database operations fail.
     */
    private deleteInternal(db: Database, identifier: string): boolean {
        try {
            const result = db.run(SITE_QUERIES.DELETE_BY_ID, [identifier]);
            const deleted = result.changes > 0;

            if (deleted) {
                logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
            } else {
                logger.warn(
                    `[SiteRepository] Site not found for deletion: ${identifier}`
                );
            }

            return deleted;
        } catch (error) {
            logger.error(
                `[SiteRepository] Failed to delete site: ${identifier}`,
                error
            );
            throw error;
        }
    }

    /**
     * Creates or updates a site within an existing transaction context.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Applies default values for missing fields.
     *
     * @param db - The database connection (must be within an active
     *   transaction).
     * @param site - Site data to create or update.
     *
     * @throws Error When the underlying SQLite driver reports a failure.
     */
    private upsertInternal(
        db: Database,
        site: Pick<SiteRow, "identifier" | "monitoring" | "name">
    ): void {
        // Apply consistent data normalization
        const { identifier } = site;
        const name = site.name ?? SITE_DEFAULTS.NAME;
        const monitoring = site.monitoring ?? SITE_DEFAULTS.MONITORING;
        const monitoringValue = monitoring ? 1 : 0;

        db.run(SITE_QUERIES.UPSERT, [
            identifier,
            name,
            monitoringValue,
        ]);
        logger.debug(
            `[SiteRepository] Upserted site (internal): ${identifier}`
        );
    }

    /**
     * Gets the database instance for internal operations.
     *
     * @remarks
     * Used for all direct query operations within the repository.
     *
     * @returns Database connection from the {@link DatabaseService}.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Internal helper to retrieve all sites using an existing database
     * connection.
     *
     * @param db - Active database connection.
     *
     * @returns Array of all site records.
     */
    private fetchAllSitesInternal(db: Database): SiteRow[] {
        const siteRows = querySiteRows(db, SITE_QUERIES.SELECT_ALL);
        return rowsToSites(siteRows);
    }

    /**
     * Internal helper to find a site by identifier within a transaction scope.
     *
     * @param db - Active database connection tied to the caller's transaction.
     * @param identifier - Site identifier to look up.
     *
     * @returns Site data if found; otherwise undefined.
     *
     * @throws Error When database access fails.
     */
    private findByIdentifierInternal(
        db: Database,
        identifier: string
    ): SiteRow | undefined {
        try {
            const siteRow = querySiteRow(db, SITE_QUERIES.SELECT_BY_ID, [
                identifier,
            ]);

            return siteRow ? rowToSite(siteRow) : undefined;
        } catch (error) {
            logger.error(
                `[SiteRepository] Failed to find site: ${identifier}`,
                error
            );
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}
